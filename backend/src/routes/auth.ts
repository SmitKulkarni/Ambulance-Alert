/**
 * routes/auth.ts
 * ---------------
 * POST /api/auth/login   — validate credentials, return JWT
 * POST /api/auth/logout  — client-side; server acknowledges
 * GET  /api/auth/me      — return current user from token
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { signToken, authenticateToken } from '../middleware/auth.js';
import { appendAuditLog } from '../db/store.js';
import { query } from '../db/pg.js';

export const authRouter = Router();

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'Suspended') {
      res.status(403).json({ error: 'Account suspended. Contact your administrator.' });
      return;
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Update last active
    await query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organizationId: user.organization_id,
    });

  // Audit log
  appendAuditLog({
    organizationId: user.organization_id,
    actor: `${user.name} (${user.role})`,
    action: 'USER_LOGIN',
    resource: 'Auth',
    timestamp: new Date().toLocaleString(),
    status: 'SUCCESS',
    details: `User logged in from ${req.ip}`,
  });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organization_id,
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — client must discard the token.
// This endpoint exists for audit logging and future token blocklist support.
authRouter.post('/logout', authenticateToken, (req: Request, res: Response) => {
  if (req.user) {
    appendAuditLog({
      organizationId: req.user?.organizationId,
      actor: `${req.user.name} (${req.user.role})`,
      action: 'USER_LOGOUT',
      resource: 'Auth',
      timestamp: new Date().toLocaleString(),
      status: 'SUCCESS',
      details: 'User logged out.',
    });
  }
  res.json({ message: 'Logged out successfully. Please discard your token.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user!.userId]);
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      lastActive: user.last_active,
      organizationId: user.organization_id,
    });
  } catch (err) {
    console.error('[DB Error]', err);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});
