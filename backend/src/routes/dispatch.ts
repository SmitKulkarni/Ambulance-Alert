/**
 * routes/dispatch.ts
 * -------------------
 * GET   /api/dispatch/calls              — list active distress calls
 * POST  /api/dispatch/dispatch           — dispatch a unit to a call
 * GET   /api/dispatch/corridors          — list corridor override states
 * PATCH /api/dispatch/corridors/:name    — toggle corridor override
 */

import { Router, Request, Response } from 'express';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';

export const dispatchRouter = Router();

// In-memory corridor override state
// key = corridor name, value = active override
const corridorOverrides: Record<string, boolean> = {
  'Route 9': true,
  'Metro Downtown': true,
  'Eastside Express': false,
};

// ─── GET /api/dispatch/calls ──────────────────────────────────────────────────
dispatchRouter.get('/calls', async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const result = await query(
      `SELECT id, caller, incident_type as "incidentType", summary, '' as "timeAgo", audio_duration as "audioDuration", status 
       FROM distress_calls WHERE (organization_id = $1 OR $1 IS NULL) ORDER BY created_at DESC`,
      [orgId]
    );
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch distress calls.' });
  }
});

// ─── POST /api/dispatch/dispatch ─────────────────────────────────────────────
dispatchRouter.post(
  '/dispatch',
  requireRole(['System Admin', 'Organization Admin', 'Traffic Analyst']),
  async (req: Request, res: Response) => {
    const { callId, unit } = req.body as { callId?: string; unit?: string };

    if (!callId) {
      res.status(400).json({ error: 'callId is required.' });
      return;
    }

    try {
      const orgId = req.user?.organizationId || null;
      
      const getRes = await query('SELECT * FROM distress_calls WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', [callId, orgId]);
      if (getRes.rowCount === 0) {
        res.status(404).json({ error: 'Distress call not found.' });
        return;
      }

      const call = getRes.rows[0];
      if (call.status === 'Dispatched') {
        res.status(409).json({ error: 'Unit already dispatched to this call.' });
        return;
      }

      const updateRes = await query(
        `UPDATE distress_calls SET status = 'Dispatched', dispatched_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [req.user!.userId, callId]
      );
      
      const updatedCall = updateRes.rows[0];

      appendAuditLog({
        organizationId: orgId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'UNIT_DISPATCHED',
        resource: callId,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: `Unit ${unit || 'ALS-104'} dispatched to ${updatedCall.incident_type} — ${updatedCall.caller}`,
      });

      res.json({ 
        message: 'Unit dispatched.', 
        call: { 
          id: updatedCall.id, 
          caller: updatedCall.caller, 
          incidentType: updatedCall.incident_type, 
          summary: updatedCall.summary, 
          status: updatedCall.status 
        }, 
        unit: unit || 'ALS-104' 
      });
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to dispatch unit.' });
    }
  }
);

// ─── GET /api/dispatch/corridors ─────────────────────────────────────────────
dispatchRouter.get('/corridors', (_req: Request, res: Response) => {
  const data = Object.entries(corridorOverrides).map(([name, active]) => ({ name, active }));
  res.json({ data });
});

// ─── PATCH /api/dispatch/corridors/:name ─────────────────────────────────────
dispatchRouter.patch(
  '/corridors/:name',
  requireRole(['System Admin', 'Organization Admin', 'Traffic Analyst']),
  (req: Request, res: Response) => {
    const corridorName = decodeURIComponent(req.params.name);

    if (!(corridorName in corridorOverrides)) {
      res.status(404).json({ error: `Corridor '${corridorName}' not found.` });
      return;
    }

    const { active } = req.body as { active?: boolean };
    const newState = active !== undefined ? active : !corridorOverrides[corridorName];
    corridorOverrides[corridorName] = newState;

    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'CORRIDOR_OVERRIDE_TOGGLED',
      resource: corridorName,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Corridor set to: ${newState ? 'Active Override' : 'Standby'}`,
    });

    res.json({ corridor: corridorName, active: newState });
  }
);
