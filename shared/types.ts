export type UserRole = 
  | 'System Admin'
  | 'Organization Admin'
  | 'Traffic Analyst'
  | 'Emergency Planner'
  | 'Transportation Researcher'
  | 'Decision Maker / Viewer';

export interface Scenario {
  id: string;
  name: string;
  routeProfile: string;
  startNode: string;
  destinationNode: string;
  alertRadius: number; // meters (100 to 2000)
  driverCompliance: number; // percentage (10 to 100)
  ambulanceSpeed: number; // km/h (20 to 120)
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Completed' | 'Running' | 'Queued' | 'Draft';
  createdAt: string;
  seed?: number;
}

export interface SimulationRun {
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

export interface PreemptionNode {
  id: string;
  code: string;
  name: string;
  status: 'Preempted' | 'Green Wave' | 'Standby' | 'Queued';
  distanceMeters: number;
  etaSeconds: number;
  phase: 'Green' | 'Amber' | 'Red';
  countdownSec: number;
}

export interface HazardReport {
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

export interface DistressCall {
  id: string;
  caller: string;
  incidentType: string;
  summary: string;
  timeAgo: string;
  audioDuration: string;
  status: 'Active' | 'Dispatched';
  isAudioPlaying?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export interface SystemAuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}
