/**
 * routes/scenarios.ts
 * --------------------
 * GET    /api/scenarios        — list all scenarios
 * POST   /api/scenarios        — create a new scenario
 * GET    /api/scenarios/:id    — get single scenario
 * PUT    /api/scenarios/:id    — update scenario
 * DELETE /api/scenarios/:id    — soft-delete (sets status = 'Draft')
 */

import { Router, Request, Response } from 'express';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';

export const scenariosRouter = Router();

// ─── GET /api/scenarios ───────────────────────────────────────────────────────
scenariosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      'SELECT * FROM scenarios WHERE organization_id = $1 OR $1 IS NULL ORDER BY created_at DESC',
      [orgId]
    );
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch scenarios.' });
  }
});

// ─── GET /api/scenarios/:id ───────────────────────────────────────────────────
scenariosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      'SELECT * FROM scenarios WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)',
      [req.params.id, orgId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Scenario not found.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch scenario.' });
  }
});

// ─── POST /api/scenarios ──────────────────────────────────────────────────────
scenariosRouter.post(
  '/',
  requireRole(['System Admin', 'Organization Admin', 'Emergency Planner', 'Traffic Analyst']),
  async (req: Request, res: Response) => {
    const body = req.body as any;

    if (!body.name) {
      res.status(400).json({ error: 'Scenario name is required.' });
      return;
    }

    try {
      const orgId = req.user?.organizationId || null;
      const result = await query(
        `INSERT INTO scenarios 
          (organization_id, name, route_profile, start_node, destination_node, alert_radius, driver_compliance, ambulance_speed, traffic_density, status, seed, created_by) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [
          orgId,
          body.name,
          body.routeProfile || '',
          body.startNode || '',
          body.destinationNode || '',
          body.alertRadius ?? 500,
          body.driverCompliance ?? 70,
          body.ambulanceSpeed ?? 60,
          body.trafficDensity || 'medium',
          'Draft',
          body.seed || null,
          req.user!.userId
        ]
      );

      const newScenario = result.rows[0];

      appendAuditLog({
        organizationId: orgId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'SCENARIO_CREATED',
        resource: newScenario.name,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: `Alert radius: ${newScenario.alert_radius}m, compliance: ${newScenario.driver_compliance}%`,
      });

      res.status(201).json(newScenario);
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to create scenario.' });
    }
  }
);

// ─── PUT /api/scenarios/:id ───────────────────────────────────────────────────
scenariosRouter.put(
  '/:id',
  requireRole(['System Admin', 'Organization Admin', 'Emergency Planner', 'Traffic Analyst']),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      // First verify it exists and belongs to the org
      const getRes = await query('SELECT * FROM scenarios WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', [req.params.id, orgId]);
      
      if (getRes.rowCount === 0) {
        res.status(404).json({ error: 'Scenario not found.' });
        return;
      }

      const updates = req.body as any;
      const setClauses: string[] = [];
      const values: any[] = [];
      let i = 1;

      const updatableFields = ['name', 'route_profile', 'start_node', 'destination_node', 'alert_radius', 'driver_compliance', 'ambulance_speed', 'traffic_density', 'status', 'seed'];
      
      for (const field of updatableFields) {
        // Map camelCase to snake_case if needed
        const reqField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        if (updates[reqField] !== undefined) {
          setClauses.push(`${field} = $${i++}`);
          values.push(updates[reqField]);
        }
      }

      if (setClauses.length === 0) {
        res.json(getRes.rows[0]);
        return;
      }

      setClauses.push(`updated_at = NOW()`);
      values.push(req.params.id, orgId);
      
      const updateQuery = `
        UPDATE scenarios 
        SET ${setClauses.join(', ')} 
        WHERE id = $${i} AND (organization_id = $${i+1} OR $${i+1} IS NULL) 
        RETURNING *`;

      const result = await query(updateQuery, values);
      const updated = result.rows[0];

      appendAuditLog({
        organizationId: orgId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'SCENARIO_CONFIG_SAVED',
        resource: updated.name,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: `Scenario updated. Status: ${updated.status}`,
      });

      res.json(updated);
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to update scenario.' });
    }
  }
);

// ─── DELETE /api/scenarios/:id ────────────────────────────────────────────────
// Soft-delete: sets status to 'Draft' instead of removing from store
scenariosRouter.delete(
  '/:id',
  requireRole(['System Admin', 'Organization Admin']),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      const result = await query(
        `UPDATE scenarios SET status = 'Draft', updated_at = NOW() 
         WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL) RETURNING *`,
        [req.params.id, orgId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Scenario not found.' });
        return;
      }

      const scenario = result.rows[0];

      appendAuditLog({
        organizationId: orgId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'SCENARIO_ARCHIVED',
        resource: scenario.name,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: 'Scenario soft-deleted (status set to Draft).',
      });

      res.json({ message: 'Scenario archived.', id: scenario.id });
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to archive scenario.' });
    }
  }
);
