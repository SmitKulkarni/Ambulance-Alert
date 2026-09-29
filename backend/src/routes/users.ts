/**
 * routes/users.ts
 * ----------------
 * GET    /api/users         — list all users (admin only)
 * POST   /api/users         — create new user (admin only)
 * PATCH  /api/users/:id     — update user info or status
 * DELETE /api/users/:id     — suspend user (soft-delete, status = Suspended)
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';
import { requireRole } from '../middleware/auth.js';
import { UserRole } from '@shared/types.js';

export const usersRouter = Router();

const ADMIN_ROLES = ['System Admin', 'Organization Admin'];

// ─── GET /api/users ───────────────────────────────────────────────────────────
usersRouter.get(
  '/',
  requireRole(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      const result = await query('SELECT * FROM users WHERE organization_id = $1 OR $1 IS NULL', [orgId]);
      const users = result.rows.map(sanitizeUser);
      res.json({ data: users, total: users.length });
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  }
);

// ─── POST /api/users ──────────────────────────────────────────────────────────
usersRouter.post(
  '/',
  requireRole(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    const { name, email, password, role, department } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      department?: string;
    };

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'name, email, password, and role are required.' });
      return;
    }

    try {
      const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (result.rowCount && result.rowCount > 0) {
        res.status(409).json({ error: 'A user with this email already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const orgId = req.user?.organizationId || null;
      
      const insertResult = await query(
        `INSERT INTO users (organization_id, name, email, password_hash, role, department, status, last_active)
         VALUES ($1, $2, $3, $4, $5, $6, 'Active', NOW()) RETURNING *`,
        [orgId, name, email.toLowerCase(), passwordHash, role, department || '']
      );
      
      const newUser = insertResult.rows[0];

      appendAuditLog({
        organizationId: req.user?.organizationId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'USER_CREATED',
        resource: `${name} <${email}>`,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS',
        details: `Role: ${role}, Department: ${department || 'None'}`,
      });

      res.status(201).json(sanitizeUser(newUser));
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  }
);

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
usersRouter.patch(
  '/:id',
  requireRole(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', 
        [req.params.id, orgId]
      );
      const user = result.rows[0];
      if (!user) {
        res.status(404).json({ error: 'User not found or access denied.' });
        return;
      }

      // Prevent modifying your own role or status (safety guard)
      if (req.params.id === req.user!.userId && (req.body.role || req.body.status)) {
        res.status(403).json({ error: 'You cannot modify your own role or status.' });
        return;
      }

      const { name, email, role, department, status, password } = req.body as any;

      const updates: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (name) { updates.push(`name = $${i++}`); values.push(name); }
      if (email) { updates.push(`email = $${i++}`); values.push(email.toLowerCase()); }
      if (role) { updates.push(`role = $${i++}`); values.push(role); }
      if (department !== undefined) { updates.push(`department = $${i++}`); values.push(department); }
      if (status) { updates.push(`status = $${i++}`); values.push(status); }
      if (password) {
        if (password.length < 8) {
          res.status(400).json({ error: 'Password must be at least 8 characters.' });
          return;
        }
        updates.push(`password_hash = $${i++}`); 
        values.push(await bcrypt.hash(password, 10));
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(req.params.id);
        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
        const updated = await query(updateQuery, values);
        
        appendAuditLog({
          organizationId: req.user?.organizationId,
          actor: `${req.user!.name} (${req.user!.role})`,
          action: 'USER_UPDATED',
          resource: `${updated.rows[0].name} <${updated.rows[0].email}>`,
          timestamp: new Date().toLocaleString(),
          status: 'SUCCESS',
          details: `Fields updated: ${Object.keys(req.body).filter(k => k !== 'password').join(', ')}`,
        });

        res.json(sanitizeUser(updated.rows[0]));
      } else {
        res.json(sanitizeUser(user));
      }
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to update user.' });
    }
  }
);

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// Soft-delete: sets status = 'Suspended'
usersRouter.delete(
  '/:id',
  requireRole(['System Admin']),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', 
        [req.params.id, orgId]
      );
      const user = result.rows[0];
      if (!user) {
        res.status(404).json({ error: 'User not found or access denied.' });
        return;
      }

      if (req.params.id === req.user!.userId) {
        res.status(403).json({ error: 'You cannot suspend your own account.' });
        return;
      }

      await query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND (organization_id = $3 OR $3 IS NULL)', 
        ['Suspended', req.params.id, orgId]
      );

      appendAuditLog({
        organizationId: req.user?.organizationId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'USER_SUSPENDED',
        resource: `${user.name} <${user.email}>`,
        timestamp: new Date().toLocaleString(),
        status: 'WARNING',
        details: 'Account suspended (soft-delete).',
      });

      res.json({ message: 'User suspended.', id: user.id });

    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to suspend user.' });
    }
  }
);

// ─── DELETE /api/users/:id/gdpr ───────────────────────────────────────────────
// GDPR Hard-Delete / Anonymize request
usersRouter.delete(
  '/:id/gdpr',
  requireRole(['System Admin', 'Organization Admin']),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user?.organizationId || null;
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)', 
        [req.params.id, orgId]
      );
      const user = result.rows[0];

      if (!user) {
        res.status(404).json({ error: 'User not found or access denied.' });
        return;
      }

      if (req.params.id === req.user!.userId) {
        res.status(403).json({ error: 'You cannot hard-delete your own account.' });
        return;
      }

      // We anonymize the user to maintain foreign key integrity for scenarios/runs/etc.
      await query(
        `UPDATE users SET 
          name = 'Anonymized User', 
          email = 'deleted-' || id || '@anonymized.local', 
          password_hash = '', 
          department = '', 
          status = 'Suspended', 
          updated_at = NOW() 
         WHERE id = $1 AND (organization_id = $2 OR $2 IS NULL)`, 
        [req.params.id, orgId]
      );

      appendAuditLog({
        organizationId: req.user?.organizationId,
        actor: `${req.user!.name} (${req.user!.role})`,
        action: 'USER_GDPR_DELETED',
        resource: `User ID: ${user.id}`,
        timestamp: new Date().toLocaleString(),
        status: 'WARNING',
        details: 'User anonymized per GDPR data deletion request.',
      });

      res.json({ message: 'User anonymized successfully.', id: user.id });
    } catch (err) {
      console.error('[DB Error]', err);
      res.status(500).json({ error: 'Failed to process GDPR deletion.' });
    }
  }
);

// ─── Helper: strip passwordHash from user object ──────────────────────────────
function sanitizeUser(user: any) {
  const { password_hash, passwordHash, ...safe } = user;
  return safe;
}
