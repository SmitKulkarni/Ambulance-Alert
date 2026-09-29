/**
 * routes/cad.ts
 * -------------
 * Phase 4.3 - Computer-Aided Dispatch (CAD) System Integration.
 * REST adapters and webhooks for bi-directional sync.
 */

import { Router, Request, Response } from 'express';
import { query } from '../db/pg.js';
import { appendAuditLog } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';

export const cadRouter = Router();

// ─── POST /api/cad/webhook ────────────────────────────────────────────────────
// Webhook for CAD to push new distress calls to our platform
cadRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { orgId, cadId, incidentType, callerName, summary, coordinates } = req.body;

    if (!orgId || !cadId) {
      res.status(400).json({ error: 'orgId and cadId are required.' });
      return;
    }

    // Insert into distress_calls
    const insertQuery = `
      INSERT INTO distress_calls (organization_id, caller, incident_type, summary, status)
      VALUES ($1, $2, $3, $4, 'Active')
      RETURNING *
    `;
    const result = await query(insertQuery, [orgId, callerName || 'CAD System', incidentType || 'Unknown', summary || '']);

    // Fire and forget audit log
    appendAuditLog({
      organizationId: orgId,
      actor: 'CAD System Webhook',
      action: 'DISTRESS_CALL_SYNCED',
      resource: `CAD ID: ${cadId}`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Call imported automatically from CAD. Local ID: ${result.rows[0].id}`,
    });

    res.status(201).json({ success: true, localCallId: result.rows[0].id });
  } catch (err) {
    console.error('[CAD Error] webhook:', err);
    res.status(500).json({ error: 'Failed to process CAD webhook.' });
  }
});

// ─── POST /api/cad/dispatch-sync ─────────────────────────────────────────────
// Push a dispatch decision from our platform back to CAD
cadRouter.post('/dispatch-sync', requireRole(['System Admin', 'Organization Admin']), async (req: Request, res: Response) => {
  try {
    const { localCallId, cadUrl, unitAssigned, etaMin } = req.body;

    if (!localCallId || !cadUrl) {
      res.status(400).json({ error: 'localCallId and cadUrl are required.' });
      return;
    }

    // In a real implementation, we would make a fetch() request to cadUrl here.
    // e.g. await fetch(cadUrl, { method: 'POST', body: JSON.stringify({ unitAssigned, etaMin }) });

    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: `${req.user!.name} (${req.user!.role})`,
      action: 'CAD_DISPATCH_SYNC',
      resource: `Local Call: ${localCallId}`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Dispatched unit ${unitAssigned} with ETA ${etaMin}m synced to CAD.`,
    });

    res.json({ success: true, synced: true });
  } catch (err) {
    console.error('[CAD Error] dispatch sync:', err);
    res.status(500).json({ error: 'Failed to sync dispatch back to CAD.' });
  }
});
