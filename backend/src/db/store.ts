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
    ['usr-1', {
      id: 'usr-1', name: 'John Doe', email: 'john.doe@ambualert.gov',
      passwordHash: SEED_PASSWORD_HASH, role: 'System Admin' as UserRole,
      department: 'Municipal Traffic Control Center', status: 'Active', lastActive: 'Just now',
    }],
    ['usr-2', {
      id: 'usr-2', name: 'Sarah Connor', email: 's.connor@cityems.org',
      passwordHash: SEED_PASSWORD_HASH, role: 'Emergency Planner' as UserRole,
      department: 'EMS Rapid Response Division', status: 'Active', lastActive: '4m ago',
    }],
    ['usr-3', {
      id: 'usr-3', name: 'Dr. Marcus Vance', email: 'm.vance@transit-lab.edu',
      passwordHash: SEED_PASSWORD_HASH, role: 'Transportation Researcher' as UserRole,
      department: 'Smart Mobility Institute', status: 'Active', lastActive: '2h ago',
    }],
    ['usr-4', {
      id: 'usr-4', name: 'Elena Rostova', email: 'e.rostova@metro.gov',
      passwordHash: SEED_PASSWORD_HASH, role: 'Traffic Analyst' as UserRole,
      department: 'Corridor Optimization Unit', status: 'Active', lastActive: '1d ago',
    }],
  ]),

  scenarios: new Map<string, DbScenario>([
    ['sc-1', {
      id: 'sc-1', name: 'City Center to Hospital',
      routeProfile: 'Metropolitan Downtown Corridor, Sector 4',
      startNode: 'Node A (City Center)', destinationNode: 'Node H (General Hospital)',
      alertRadius: 500, driverCompliance: 70, ambulanceSpeed: 60,
      trafficDensity: 'medium', status: 'Completed', createdAt: '10 Apr 2025, 14:32', seed: 48921,
    }],
    ['sc-2', {
      id: 'sc-2', name: 'East Zone to Trauma Center',
      routeProfile: 'Eastside Expressway & Cross-town Arterial',
      startNode: 'Node E1 (East Depot)', destinationNode: 'Node T3 (Regional Trauma Center)',
      alertRadius: 750, driverCompliance: 85, ambulanceSpeed: 75,
      trafficDensity: 'high', status: 'Completed', createdAt: '10 Apr 2025, 11:20', seed: 81920,
    }],
    ['sc-3', {
      id: 'sc-3', name: 'North Expressway Rush Hour',
      routeProfile: 'I-95 Northern Spur into Downtown',
      startNode: 'Node N9 (Spur 12)', destinationNode: 'Node H1 (St. Jude Memorial)',
      alertRadius: 600, driverCompliance: 65, ambulanceSpeed: 50,
      trafficDensity: 'critical', status: 'Running', createdAt: '10 Apr 2025, 09:15', seed: 12048,
    }],
  ]),

  simRuns: new Map<string, DbSimulationRun>([
    ['SIM-001', {
      id: 'SIM-001', scenarioId: 'sc-1', name: 'City Center to Hospital',
      route: 'City Center → Hospital', mode: 'Advance Alert', status: 'Completed',
      createdAt: '10 Apr 2025, 14:32', travelTimeMin: 8.4, clearanceTimeMin: 3.1,
      totalDelayMin: 2.7, timeSavedMin: 4.4, timeSavedPercent: 34.4,
      driverResponseRate: 78, alertRadius: 500, complianceRate: 70,
    }],
    ['SIM-002', {
      id: 'SIM-002', scenarioId: 'sc-2', name: 'East Zone to Hospital',
      route: 'East Zone → Hospital', mode: 'Normal Traffic', status: 'Completed',
      createdAt: '10 Apr 2025, 11:20', travelTimeMin: 12.8, clearanceTimeMin: 6.2,
      totalDelayMin: 5.6, timeSavedMin: 0, timeSavedPercent: 0,
      driverResponseRate: 24, alertRadius: 0, complianceRate: 0,
    }],
    ['SIM-003', {
      id: 'SIM-003', scenarioId: 'sc-3', name: 'West Zone to Hospital',
      route: 'West Zone → Hospital', mode: 'Advance Alert', status: 'Running',
      createdAt: '10 Apr 2025, 09:15', travelTimeMin: 9.1, clearanceTimeMin: 3.5,
      totalDelayMin: 3.0, timeSavedMin: 3.7, timeSavedPercent: 28.9,
      driverResponseRate: 82, alertRadius: 600, complianceRate: 75,
    }],
    ['SIM-004', {
      id: 'SIM-004', scenarioId: 'sc-4', name: 'North Zone to Hospital',
      route: 'North Zone → Hospital', mode: 'Normal Traffic', status: 'Completed',
      createdAt: '09 Apr 2025, 17:48', travelTimeMin: 13.5, clearanceTimeMin: 6.8,
      totalDelayMin: 6.1, timeSavedMin: 0, timeSavedPercent: 0,
      driverResponseRate: 20, alertRadius: 0, complianceRate: 0,
    }],
  ]),

  hazards: new Map<string, DbHazard>([
    ['haz-1', {
      id: 'haz-1', category: 'Accident', locationName: 'I-95 North, Mile Marker 42.5',
      coordinates: '34.0522° N, -118.2437° W', severity: 'Critical Blocking',
      notes: 'Two vehicles collided in center lane, minor debris scattered across arterial route.',
      timestamp: 'Just now', hasPhoto: true, status: 'Active',
    }],
    ['haz-2', {
      id: 'haz-2', category: 'Road Obstruction', locationName: 'Market Street at 4th Ave',
      coordinates: '34.0510° N, -118.2490° W', severity: 'Lane Restricted',
      notes: 'Construction barrier fallen into right corridor lane.',
      timestamp: '14m ago', hasPhoto: false, status: 'Active',
    }],
  ]),

  distressCalls: new Map<string, DbDistressCall>([
    ['call-9021', {
      id: 'call-9021', caller: 'Caller #9021 - Cardiac Arrest',
      incidentType: 'Priority 1 Medical',
      summary: 'Patient unresponsive at 442 Maple Street, cross street 5th...',
      timeAgo: '12s ago', audioDuration: '0:14 / 0:42', status: 'Active',
    }],
    ['call-9020', {
      id: 'call-9020', caller: 'Caller #9020 - MVA Collision',
      incidentType: 'Traffic Trauma',
      summary: 'Two vehicles involved, minor injuries, blocking right lane...',
      timeAgo: '3m ago', audioDuration: '0:08 / 0:30', status: 'Active',
    }],
    ['call-9018', {
      id: 'call-9018', caller: 'Caller #9018 - Severe Respiratory',
      incidentType: 'Priority 1 Medical',
      summary: 'Asthma attack with hypoxia at Central Park pavilion entrance...',
      timeAgo: '7m ago', audioDuration: '0:19 / 0:35', status: 'Dispatched',
    }],
  ]),

  auditLogs: [
    {
      id: 'log-1', actor: 'John Doe (System Admin)',
      action: 'PREEMPTION_BROADCAST_TRIGGERED', resource: 'Corridor KA-01-AB-1234',
      timestamp: '10 Apr 2025, 14:32:04', status: 'SUCCESS' as const,
      details: 'Broadcast 500m preemption geofence to 1,420 connected motorists.',
    },
    {
      id: 'log-2', actor: 'System Autonomous AI',
      action: 'SIGNAL_GREEN_WAVE_LOCKED', resource: 'Node #403, #404, #405',
      timestamp: '10 Apr 2025, 14:31:40', status: 'SUCCESS' as const,
      details: 'Phase timing shifted +25s green lead for emergency vehicle priority.',
    },
    {
      id: 'log-3', actor: 'Sarah Connor (Planner)',
      action: 'SCENARIO_CONFIG_SAVED', resource: 'City Center to Hospital v2.4',
      timestamp: '10 Apr 2025, 14:28:11', status: 'SUCCESS' as const,
      details: 'Updated alert radius from 400m to 500m; compliance parameter set to 70%.',
    },
  ] as DbAuditLog[],
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
