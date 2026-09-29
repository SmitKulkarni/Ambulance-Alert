/**
 * middleware/auth.ts
 * ------------------
 * JWT authentication middleware for Express routes.
 * Verifies Bearer token from Authorization header.
 * Attaches decoded user payload to req.user.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  organizationId?: string | null;
}

// Extend Express Request type to include the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[Auth] WARNING: JWT_SECRET is not set. Use a strong secret in production.');
}

/**
 * Middleware — validates JWT Bearer token.
 * Returns 401 if missing/invalid, 403 if expired.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  try {
    const secret = JWT_SECRET || 'dev-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(403).json({ error: 'Token expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid token.' });
    }
  }
}

/**
 * Middleware — restricts route to specified roles only.
 * Must be used AFTER authenticateToken.
 * Usage: router.delete('/users/:id', authenticateToken, requireRole(['System Admin']), handler)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}

/**
 * Sign a JWT token for a user.
 * Used in auth routes after successful login.
 */
export function signToken(payload: JwtPayload): string {
  const secret = JWT_SECRET || 'dev-secret-change-in-production';
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any,
  });
}
