/**
 * routes/hazards.ts
 * ------------------
 * GET    /api/hazards           — list hazards (filter by status)
 * POST   /api/hazards           — submit a new hazard report
 * PATCH  /api/hazards/:id/status — update hazard status
 */

import { Router, Request, Response } from 'express';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';

export const hazardsRouter = Router();

// ─── GET /api/hazards ─────────────────────────────────────────────────────────
hazardsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const orgId = req.user?.organizationId || null;
    
    let whereClause = 'WHERE (organization_id = $1 OR $1 IS NULL)';
    const values: any[] = [orgId];
    
    if (statusFilter) {
      whereClause += ' AND status = $2';
      values.push(statusFilter);
    }
    
    const result = await query(`SELECT * FROM hazard_reports ${whereClause} ORDER BY created_at DESC`, values);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch hazards.' });
  }
});

// ─── POST /api/hazards ────────────────────────────────────────────────────────
hazardsRouter.post('/', async (req: Request, res: Response) => {
  const body = req.body as any;

  if (!body.category || !body.locationName || !body.severity) {
    res.status(400).json({ error: 'category, locationName, and severity are required.' });
    return;
  }

  const valid_categories = ['Accident', 'Road Obstruction', 'Flooding', 'Stalled EMS'];
  const valid_severities = ['Minor Delay', 'Lane Restricted', 'Critical Blocking'];

  if (!valid_categories.includes(body.category)) {
    res.status(400).json({ error: `Invalid category. Must be one of: ${valid_categories.join(', ')}` });
    return;
  }
  if (!valid_severities.includes(body.severity)) {
    res.status(400).json({ error: `Invalid severity. Must be one of: ${valid_severities.join(', ')}` });
    return;
  }

  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      `INSERT INTO hazard_reports 
        (organization_id, category, location_name, coordinates, severity, notes, has_photo, status, reported_by)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, 'Active', $8)
       RETURNING *`,
      [
        orgId,
        body.category,
        body.locationName,
        body.coordinates || '',
        body.severity,
        body.notes || '',
        body.hasPhoto ?? false,
        req.user?.userId || null
      ]
    );

    const newHazard = result.rows[0];

    appendAuditLog({
      organizationId: orgId,
      actor: req.user ? `${req.user.name} (${req.user.role})` : 'Mobile User',
      action: 'HAZARD_REPORTED',
      resource: `${newHazard.category} at ${newHazard.location_name}`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Severity: ${newHazard.severity}. Photo: ${newHazard.has_photo}`,
    });

    res.status(201).json(newHazard);
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to create hazard.' });
  }
});

// ─── PATCH /api/hazards/:id/status ───────────────────────────────────────────
hazardsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      'SELECT * FROM hazard_reports WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)',
      [req.params.id, orgId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Hazard not found.' });
      return;
    }

    const { status } = req.body as { status?: 'Active' | 'Resolved' | 'Dispatched' };
    const validStatuses = ['Active', 'Resolved', 'Dispatched'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updateRes = await query(
      'UPDATE hazard_reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    const hazard = updateRes.rows[0];

    appendAuditLog({
      organizationId: orgId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'HAZARD_STATUS_UPDATED',
      resource: hazard.location_name,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Status changed to ${status}`,
    });

    res.json(hazard);
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to update hazard status.' });
  }
});
