/**
 * routes/reports.ts
 * -----------------
 * Phase 4.1 - Advanced Analytics Dashboard endpoints.
 */

import { Router, Request, Response } from 'express';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';

export const reportsRouter = Router();

// Allow viewers, planners, analysts, and admins
const ANALYTICS_ROLES = [
  'System Admin', 
  'Organization Admin', 
  'Traffic Analyst', 
  'Emergency Planner', 
  'Decision Maker / Viewer'
];

// ─── GET /api/reports/trends ───────────────────────────────────────────────────
// Historical trend data (monthly averages)
reportsRouter.get('/trends', requireRole(ANALYTICS_ROLES), async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const { startDate, endDate } = req.query;

    let timeFilter = '';
    const params: any[] = [orgId];
    if (startDate && endDate) {
      params.push(startDate, endDate);
      timeFilter = `AND created_at BETWEEN $2 AND $3`;
    }

    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) AS month,
        AVG(travel_time_min) AS avg_response_time,
        AVG(compliance_rate) AS avg_compliance,
        AVG(time_saved_min) AS avg_time_saved
      FROM simulation_runs
      WHERE (organization_id = $1 OR $1 IS NULL) ${timeFilter}
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await query(trendsQuery, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Reports Error] trends:', err);
    res.status(500).json({ error: 'Failed to fetch trends data.' });
  }
});

// ─── GET /api/reports/compare ─────────────────────────────────────────────────
// Compare two simulation runs side-by-side
reportsRouter.get('/compare', requireRole(ANALYTICS_ROLES), async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const { runA, runB } = req.query;

    if (!runA || !runB) {
      res.status(400).json({ error: 'runA and runB IDs are required.' });
      return;
    }

    const compareQuery = `
      SELECT * FROM simulation_runs
      WHERE id IN ($2, $3) AND (organization_id = $1 OR $1 IS NULL)
    `;

    const result = await query(compareQuery, [orgId, runA, runB]);
    res.json(result.rows);
  } catch (err) {
    console.error('[Reports Error] compare:', err);
    res.status(500).json({ error: 'Failed to compare runs.' });
  }
});

// ─── GET /api/reports/hazards-heatmap ─────────────────────────────────────────
// Get coordinates for hazard heatmap
reportsRouter.get('/hazards-heatmap', requireRole(ANALYTICS_ROLES), async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const { category, severity } = req.query;

    let filters = '';
    const params: any[] = [orgId];
    let i = 2;

    if (category) {
      params.push(category);
      filters += ` AND category = $${i++}`;
    }
    if (severity) {
      params.push(severity);
      filters += ` AND severity = $${i++}`;
    }

    const heatmapQuery = `
      SELECT id, category, severity, coordinates, created_at
      FROM hazard_reports
      WHERE (organization_id = $1 OR $1 IS NULL) ${filters}
      AND coordinates != ''
    `;

    const result = await query(heatmapQuery, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Reports Error] heatmap:', err);
    res.status(500).json({ error: 'Failed to fetch hazard heatmap data.' });
  }
});

// ─── GET /api/reports/sla-compliance ──────────────────────────────────────────
// SLA Breach Detection & Reporting
reportsRouter.get('/sla-compliance', requireRole(ANALYTICS_ROLES), async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;

    // Fetch org SLA target
    const orgQuery = await query('SELECT sla_target_eta_min FROM organizations WHERE id = $1', [orgId]);
    const slaTarget = orgQuery.rows[0]?.sla_target_eta_min || 8; // Default 8 min

    // Calculate breaches
    const slaQuery = `
      SELECT 
        COUNT(*) AS total_runs,
        COUNT(CASE WHEN travel_time_min <= $2 THEN 1 END) AS compliant_runs,
        COUNT(CASE WHEN travel_time_min > $2 THEN 1 END) AS breached_runs,
        (COUNT(CASE WHEN travel_time_min <= $2 THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100 AS compliance_percentage
      FROM simulation_runs
      WHERE (organization_id = $1 OR $1 IS NULL)
        AND status = 'Completed'
    `;

    const result = await query(slaQuery, [orgId, slaTarget]);

    res.json({
      slaTargetMinutes: slaTarget,
      metrics: result.rows[0]
    });
  } catch (err) {
    console.error('[Reports Error] sla:', err);
    res.status(500).json({ error: 'Failed to compute SLA compliance.' });
  }
});

// ─── GET /api/reports/export ──────────────────────────────────────────────────
// Export compliance data (CSV format)
reportsRouter.get('/export', requireRole(ANALYTICS_ROLES), async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organizationId || null;
    const format = req.query.format || 'csv';
    
    const queryStr = `
      SELECT id, name, mode, status, travel_time_min, time_saved_min, compliance_rate, created_at
      FROM simulation_runs
      WHERE (organization_id = $1 OR $1 IS NULL)
      ORDER BY created_at DESC
    `;
    const result = await query(queryStr, [orgId]);

    if (format === 'csv') {
      const rows = result.rows;
      if (rows.length === 0) {
        res.header('Content-Type', 'text/csv').send('id,name,mode,status,travel_time_min,time_saved_min,compliance_rate,created_at\n');
        return;
      }
      const header = Object.keys(rows[0]).join(',') + '\n';
      const body = rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
      
      res.header('Content-Type', 'text/csv');
      res.attachment('ambulance-alert-export.csv');
      res.send(header + body);
    } else {
      // Fallback JSON
      res.json(result.rows);
    }
  } catch (err) {
    console.error('[Reports Error] export:', err);
    res.status(500).json({ error: 'Failed to export data.' });
  }
});
