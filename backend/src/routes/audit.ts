/**
 * routes/audit.ts
 * ----------------
 * GET /api/audit   — list system audit logs (admin only, paginated)
 */

import { Router, Request, Response } from 'express';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';

export const auditRouter = Router();

// ─── GET /api/audit ───────────────────────────────────────────────────────────
auditRouter.get(
  '/',
  requireRole(['System Admin', 'Organization Admin']),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const actionFilter = req.query.action as string | undefined;
      const statusFilter = req.query.status as string | undefined;

      let whereClause = 'WHERE (organization_id = $1 OR $1 IS NULL)';
      const values: any[] = [req.user?.organizationId || null];
      let paramCount = 2;

      if (actionFilter) {
        whereClause += ` AND action ILIKE $${paramCount++}`;
        values.push(`%${actionFilter}%`);
      }
      if (statusFilter) {
        whereClause += ` AND status = $${paramCount++}`;
        values.push(statusFilter.toUpperCase());
      }

      const countResult = await query(`SELECT COUNT(*) FROM system_audit_logs ${whereClause}`, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      values.push(limit, offset);
      const paginatedResult = await query(
        `SELECT * FROM system_audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`,
        values
      );

      res.json({ data: paginatedResult.rows, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
  }
);
