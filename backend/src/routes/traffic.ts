/**
 * routes/traffic.ts
 * ------------------
 * Stubs and webhooks for real-time traffic system integrations.
 * SCATS and SCOOT implementations.
 */

import { Router, Request, Response } from 'express';
import { appendAuditLog } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';

export const trafficRouter = Router();

// ─── POST /api/traffic/scats/webhook ──────────────────────────────────────────
// SCATS (Sydney Coordinated Adaptive Traffic System) webhook receiver
trafficRouter.post(
  '/scats/webhook',
  async (req: Request, res: Response) => {
    const { intersectionId, phase, status } = req.body;

    // In a real implementation, this would map the SCATS intersection ID to our PreemptionNode ID
    // and update the real-time simulation engine or broadcast over WebSockets.

    // Fire and forget audit log
    appendAuditLog({
      actor: 'SCATS System',
      action: 'TRAFFIC_SIGNAL_UPDATE',
      resource: `Intersection ${intersectionId || 'Unknown'}`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Phase: ${phase}, Status: ${status}`,
    });

    res.status(200).json({ received: true, system: 'SCATS' });
  }
);

// ─── POST /api/traffic/scoot/webhook ──────────────────────────────────────────
// SCOOT (Split Cycle Offset Optimisation Technique) adapter webhook
trafficRouter.post(
  '/scoot/webhook',
  async (req: Request, res: Response) => {
    const { linkId, saturationPercent, congestionFlag } = req.body;

    // Real implementation would adjust trafficDensity and baseline speeds
    // in our running simulation based on real-time SCOOT congestion metrics.

    appendAuditLog({
      actor: 'SCOOT System',
      action: 'TRAFFIC_DENSITY_UPDATE',
      resource: `Link ${linkId || 'Unknown'}`,
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: `Saturation: ${saturationPercent}%, Congested: ${congestionFlag}`,
    });

    res.status(200).json({ received: true, system: 'SCOOT' });
  }
);
