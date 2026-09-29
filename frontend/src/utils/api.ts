/**
 * src/utils/api.ts
 * -----------------
 * Centralised fetch wrapper for all API calls to the Express backend.
 * All functions:
 *  - Read the auth token from localStorage
 *  - Handle 401/403 automatically (redirect to login)
 *  - Return typed results or throw ApiError
 *
 * BASE_URL resolves to:
 *  - Dev:  http://localhost:4000 (VITE_API_URL not set)
 *  - Prod: same origin (reverse proxied) or VITE_API_URL
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'ambulert_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = tokenStorage.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Auto-clear token and redirect on auth errors
  if (response.status === 401) {
    tokenStorage.clear();
    window.location.href = '/login';
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(body.error || `HTTP ${response.status}`, response.status);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; role: string; department: string };
  expiresIn: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false),

  logout: () =>
    apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch<LoginResponse['user']>('/api/auth/me'),
};

// ─── Scenarios ────────────────────────────────────────────────────────────────
import type { Scenario } from '@shared/types';
import type { SimulationRun } from '@shared/types';
import type { HazardReport } from '@shared/types';
import type { DistressCall } from '@shared/types';
import type { UserAccount } from '@shared/types';
import type { SystemAuditLog } from '@shared/types';

export const scenariosApi = {
  list: () =>
    apiFetch<{ data: Scenario[]; total: number }>('/api/scenarios'),

  get: (id: string) =>
    apiFetch<Scenario>(`/api/scenarios/${id}`),

  create: (payload: Partial<Scenario>) =>
    apiFetch<Scenario>('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Scenario>) =>
    apiFetch<Scenario>(`/api/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  archive: (id: string) =>
    apiFetch<{ message: string; id: string }>(`/api/scenarios/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Simulation Runs ──────────────────────────────────────────────────────────

export const simulationsApi = {
  list: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return apiFetch<{ data: SimulationRun[]; total: number; page: number; pages: number }>(
      `/api/simulations?${params}`
    );
  },

  get: (id: string) =>
    apiFetch<SimulationRun>(`/api/simulations/${id}`),

  run: (scenarioId: string, mode: 'Advance Alert' | 'Normal Traffic') =>
    apiFetch<SimulationRun>('/api/simulations/run', {
      method: 'POST',
      body: JSON.stringify({ scenarioId, mode }),
    }),
};

// ─── Hazards ──────────────────────────────────────────────────────────────────

export const hazardsApi = {
  list: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiFetch<{ data: HazardReport[]; total: number }>(`/api/hazards${params}`);
  },

  submit: (payload: Omit<HazardReport, 'id' | 'timestamp' | 'status'>) =>
    apiFetch<HazardReport>('/api/hazards', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: HazardReport['status']) =>
    apiFetch<HazardReport>(`/api/hazards/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export const dispatchApi = {
  calls: () =>
    apiFetch<{ data: DistressCall[]; total: number }>('/api/dispatch/calls'),

  dispatch: (callId: string, unit?: string) =>
    apiFetch<{ message: string; call: DistressCall; unit: string }>('/api/dispatch/dispatch', {
      method: 'POST',
      body: JSON.stringify({ callId, unit }),
    }),

  corridors: () =>
    apiFetch<{ data: { name: string; active: boolean }[] }>('/api/dispatch/corridors'),

  toggleCorridor: (name: string, active?: boolean) =>
    apiFetch<{ corridor: string; active: boolean }>(
      `/api/dispatch/corridors/${encodeURIComponent(name)}`,
      { method: 'PATCH', body: JSON.stringify({ active }) }
    ),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: () =>
    apiFetch<{ data: UserAccount[]; total: number }>('/api/users'),

  create: (payload: { name: string; email: string; password: string; role: string; department: string }) =>
    apiFetch<UserAccount>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<UserAccount & { password: string }>) =>
    apiFetch<UserAccount>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  suspend: (id: string) =>
    apiFetch<{ message: string; id: string }>(`/api/users/${id}`, { method: 'DELETE' }),
};

// ─── Audit ────────────────────────────────────────────────────────────────────

export const auditApi = {
  list: (page = 1, limit = 50, action?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (action) params.set('action', action);
    if (status) params.set('status', status);
    return apiFetch<{ data: SystemAuditLog[]; total: number; page: number; pages: number }>(
      `/api/audit?${params}`
    );
  },
};

// ─── WebSocket GPS Telemetry ──────────────────────────────────────────────────
export interface TelemetryFrame {
  ambulanceId: string;
  lat: number;
  lng: number;
  speedKph: number;
  headingDeg: number;
  progressPercent: number;
  currentStreet: string;
  distanceRemainingKm: number;
  etaMinutes: number;
  timestamp: string;
}

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000')
  .replace(/^http/, 'ws');

/**
 * Connect to the GPS telemetry WebSocket.
 * Returns a cleanup function that closes the connection.
 *
 * Usage in a React component:
 * ```ts
 * useEffect(() => {
 *   return connectTelemetry((frame) => {
 *     setProgressPercent(frame.progressPercent);
 *   });
 * }, []);
 * ```
 */
export function connectTelemetry(
  onFrame: (frame: TelemetryFrame) => void,
  onError?: (e: Event) => void
): () => void {
  const ws = new WebSocket(`${WS_URL}/ws/telemetry`);

  ws.onopen = () => console.log('[WS] Connected to telemetry');
  ws.onclose = () => console.log('[WS] Disconnected from telemetry');
  ws.onerror = (e) => {
    console.warn('[WS] Telemetry connection error (server may be offline)');
    onError?.(e);
  };
  ws.onmessage = (event) => {
    try {
      const frame = JSON.parse(event.data) as TelemetryFrame;
      onFrame(frame);
    } catch {
      console.warn('[WS] Malformed telemetry frame');
    }
  };

  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) ws.close();
  };
}

// ─── AI — Phase 2 ─────────────────────────────────────────────────────────────
// (Scenario type already imported above for simulationsApi)

export interface DispatchRecommendation {
  callId: string;
  priority: number;
  unit: string;
  route: string;
  etaMinutes: number;
  confidence: number;
  reasoning: string;
}

export interface DispatchSuggestionResponse {
  recommendations: DispatchRecommendation[];
  summary: string;
  alertRadiusSuggestion: number;
  trafficNote: string;
  generatedAt: string;
}

export interface HazardCategorizationResponse {
  category: string;
  severity: string;
  confidence: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
}

export interface GeneratedScenarioResponse {
  scenario: Omit<Scenario, 'seed'> & { seed: number };
  reasoning: string;
  generatedAt: string;
}

export interface NodeRefinement {
  name: string;
  refinedEtaSec: number;
  action: string;
}

export interface EtaRefinementResponse {
  refinedEtaMinutes: number;
  confidencePercent: number;
  recommendedSpeedKph: number;
  timeSavingOpportunityMin: number;
  nodeRefinements: NodeRefinement[];
  corridorHealthScore: number;
  insight: string;
  speedAdjustmentReason: string;
  generatedAt: string;
}

export const aiApi = {
  /** 2.1 — Ranked dispatch recommendations */
  dispatchSuggest: () =>
    apiFetch<DispatchSuggestionResponse>('/api/ai/dispatch-suggest', { method: 'POST', body: '{}' }),

  /** 2.2 — NLP hazard categorization */
  categorizeHazard: (notes: string, coordinates?: string) =>
    apiFetch<HazardCategorizationResponse>('/api/ai/categorize-hazard', {
      method: 'POST',
      body: JSON.stringify({ notes, coordinates }),
    }),

  /** 2.3 — Natural language → Scenario */
  generateScenario: (description: string) =>
    apiFetch<GeneratedScenarioResponse>('/api/ai/generate-scenario', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),

  /** 2.4 — Predictive corridor ETA refinement */
  refineEta: (params: {
    trafficDensity: string;
    ambulanceSpeed: number;
    complianceRate: number;
    alertRadius: number;
    distanceRemainingKm: number;
    preemptionNodes: Array<{ name: string; status: string; distanceMeters: number; etaSeconds: number }>;
  }) =>
    apiFetch<EtaRefinementResponse>('/api/ai/refine-eta', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};
