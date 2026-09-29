/**
 * routes/simulations.ts
 * ----------------------
 * POST /api/simulations/run    — start a new simulation run
 * GET  /api/simulations        — list all historical runs (paginated)
 * GET  /api/simulations/:id    — get single run detail
 */

import { Router, Request, Response } from 'express';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';

export const simulationsRouter = Router();

// ─── GET /api/simulations ─────────────────────────────────────────────────────
simulationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const statusFilter = req.query.status as string | undefined;

    const orgId = req.user?.organizationId || null;
    let whereClause = 'WHERE (organization_id = $1 OR $1 IS NULL)';
    const values: any[] = [orgId];
    let paramCount = 2;

    if (statusFilter) {
      whereClause += ` AND status = $${paramCount++}`;
      values.push(statusFilter);
    }

    const countResult = await query(`SELECT COUNT(*) FROM simulation_runs ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM simulation_runs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );

    res.json({ data: result.rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch simulations.' });
  }
});

// ─── GET /api/simulations/:id ─────────────────────────────────────────────────
simulationsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      'SELECT * FROM simulation_runs WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)',
      [req.params.id, orgId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Simulation run not found.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch simulation.' });
  }
});
// ─── POST /api/simulations/run ────────────────────────────────────────────────
simulationsRouter.post(
  '/run',
  requireRole(['System Admin', 'Organization Admin', 'Traffic Analyst', 'Emergency Planner']),
  async (req: Request, res: Response) => {
    const { scenarioId, mode } = req.body as {
      scenarioId?: string;
      mode?: 'Advance Alert' | 'Normal Traffic';
    };

    if (!scenarioId) {
      res.status(400).json({ error: 'scenarioId is required.' });
      return;
    }

    try {
      const orgId = req.user?.organizationId || null;
      
      const scenarioRes = await query('SELECT * FROM scenarios WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', [scenarioId, orgId]);
      if (scenarioRes.rowCount === 0) {
        res.status(404).json({ error: 'Scenario not found.' });
        return;
      }
      
      const scenario = scenarioRes.rows[0];

      // Calculate simulated results (replace with real engine output in production)
      const isAdvance = mode === 'Advance Alert';
      const compRate = scenario.driver_compliance;
      const radius = scenario.alert_radius;
      const speedFactor = scenario.ambulance_speed / 60;
      const densityPenalty = { low: 0, medium: 1.2, high: 2.5, critical: 4.5 }[scenario.traffic_density as string] || 1.2;

      const baseTravelTime = (7 + densityPenalty) / speedFactor;
      const timeSavedMin = isAdvance ? +(baseTravelTime * (compRate / 100) * 0.45).toFixed(2) : 0;
      const travelTimeMin = +(baseTravelTime - timeSavedMin).toFixed(2);
      const clearanceTimeMin = +(travelTimeMin * 0.35).toFixed(2);
      const totalDelayMin = +(travelTimeMin * 0.3).toFixed(2);
      const timeSavedPercent = isAdvance ? +((timeSavedMin / baseTravelTime) * 100).toFixed(2) : 0;
      const driverResponseRate = isAdvance ? Math.round(compRate * 0.9 + Math.random() * 10) : Math.round(20 + Math.random() * 15);

      const simName = scenario.name;
      const routeStr = `${scenario.start_node} → ${scenario.destination_node}`;
      const simMode = mode || 'Advance Alert';

      const insertRes = await query(
        `INSERT INTO simulation_runs 
          (organization_id, scenario_id, name, route, mode, status, travel_time_min, clearance_time_min, total_delay_min, time_saved_min, time_saved_percent, driver_response_rate, alert_radius, compliance_rate, started_by)
         VALUES
          ($1, $2, $3, $4, $5, 'Completed', $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [orgId, scenarioId, simName, routeStr, simMode, travelTimeMin, clearanceTimeMin, totalDelayMin, timeSavedMin, timeSavedPercent, driverResponseRate, isAdvance ? radius : 0, isAdvance ? compRate : 0, req.user!.userId]
      );

      const newRun = insertRes.rows[0];

      appendAuditLog({
        organizationId: orgId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'SIMULATION_RUN_STARTED',
        resource: `${newRun.id} — ${simName}`,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: `Mode: ${newRun.mode}. Time saved: ${timeSavedMin}min (${timeSavedPercent}%).`,
      });

      res.status(201).json(newRun);
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to create simulation run.' });
    }
  }
);
