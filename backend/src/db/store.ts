/**
 * db/store.ts
 * -----------
 * In-memory data store — a structured singleton that mimics a relational DB.
 * All routes read/write from here. When PostgreSQL is available:
 *   1. Replace these Map/array collections with `pg` pool queries
 *   2. Run `db/schema.sql` to create the tables
 *   3. Delete this file
 */

import { UserRole } from '@shared/types.js';
import { query } from './pg.js';

// ─── Type mirrors of src/types.ts (with password field for users) ─────────────

export interface DbScenario {
  id: string;
  name: string;
  routeProfile: string;
  startNode: string;
  destinationNode: string;
  alertRadius: number;
  driverCompliance: number;
  ambulanceSpeed: number;
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Completed' | 'Running' | 'Queued' | 'Draft';
  createdAt: string;
  seed?: number;
}

export interface DbSimulationRun {
  id: string;
  scenarioId: string;
  name: string;
  route: string;
  mode: 'Advance Alert' | 'Normal Traffic';
  status: 'Completed' | 'Running' | 'Queued' | 'Failed';
  createdAt: string;
  travelTimeMin: number;
  clearanceTimeMin: number;
  totalDelayMin: number;
  timeSavedMin: number;
  timeSavedPercent: number;
  driverResponseRate: number;
  alertRadius: number;
  complianceRate: number;
}

export interface DbHazard {
  id: string;
  category: 'Accident' | 'Road Obstruction' | 'Flooding' | 'Stalled EMS';
  locationName: string;
  coordinates: string;
  severity: 'Minor Delay' | 'Lane Restricted' | 'Critical Blocking';
  notes: string;
  timestamp: string;
  hasPhoto: boolean;
  status: 'Active' | 'Resolved' | 'Dispatched';
}

export interface DbDistressCall {
  id: string;
  caller: string;
  incidentType: string;
  summary: string;
  timeAgo: string;
  audioDuration: string;
  status: 'Active' | 'Dispatched';
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;   // bcrypt hash
  role: UserRole;
  department: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export interface DbAuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
// Passwords are bcrypt hashes of 'Password123!' — change before production

const SEED_PASSWORD_HASH = '$2b$10$rH5BvzBs7A8LUflJ3q5a5.xR7K5Nz0yQ6gV1PFJlqt6cX9E.6GZ2';

export const store = {
  users: new Map<string, DbUser>([
    ['admin', {
      id: 'admin', name: 'Admin', email: 'admin@ambualert.gov',
      passwordHash: SEED_PASSWORD_HASH, role: 'System Admin' as UserRole,
      department: 'Admin', status: 'Active', lastActive: 'Just now',
    }]
  ]),

  scenarios: new Map<string, DbScenario>(),

  simRuns: new Map<string, DbSimulationRun>(),

  hazards: new Map<string, DbHazard>(),

  distressCalls: new Map<string, DbDistressCall>(),

  auditLogs: [] as DbAuditLog[],
};

/** Append an audit log entry */
export function appendAuditLog(entry: Omit<DbAuditLog, 'id'> & { organizationId?: string | null }): void {
  // Fire and forget insert to PostgreSQL
  query(
    `INSERT INTO system_audit_logs (organization_id, actor, action, resource, status, details) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [entry.organizationId || null, entry.actor, entry.action, entry.resource || '', entry.status, entry.details || '']
  ).catch(err => {
    console.error('[Audit Log Error] Failed to write log:', err);
  });
}
