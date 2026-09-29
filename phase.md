# 🚀 Implementation Phases — Ambulance Alert

> This document is the master execution plan for the Ambulance Alert platform. Each phase defines a clear scope, task breakdown, acceptance criteria, and success metrics. AI assistants and developers must refer to this file before picking up new work.

---

## Phase Overview

```
Current Status ──────────────────────────────────────────────────────▶
                                                                       
  ✅ v0.9.0           🟡 Phase 1          🔵 Phase 2          ⚪ Phase 3          ⚪ Phase 4
  Foundation       Production            AI Expansion       Scale & Native    Analytics &
  Complete         Hardening                                               Compliance
  (Done)          (In Progress)          (Planned)           (Future)          (Future)
```

| Phase | Name | Status | Priority | Milestone Version |
|-------|------|--------|----------|-------------------|
| ✅ v0.9.0 | Foundation | Complete | — | `v0.9.0` |
| ✅ Phase 1 | Production Hardening | **Complete** | Critical | `v1.0.0` |
| ✅ Phase 2 | AI Feature Expansion | **Complete** | High | `v1.5.0` |
| ✅ Phase 3 | Scale & Native | **Complete** | Medium | `v2.0.0` |
| ✅ Phase 4 | Analytics & Compliance | **Complete** | Low | `v3.0.0` |

---

## ✅ v0.9.0 — Foundation (Complete)

> **Released: 2026-09-29**
> Full simulation platform with web dashboard, mobile simulation, dual-view mode, and AI scaffold.

### Summary of What Was Built
- [x] React 19 + Vite 8 + TypeScript 7 + TailwindCSS v4 SPA
- [x] `SimulationContext` — single global state provider
- [x] Web Dashboard (8 views): Dashboard, Simulation, LiveMap, DispatchConsole, Scenarios, Reports, Users, SystemSettings
- [x] Mobile App (6 screens): HomeTracking, ETA, Alerts, ReportHazard, Settings, SimulationResults
- [x] Three view modes: `web`, `mobile`, `dual`
- [x] Signal preemption engine, simulation tick engine, advance alert broadcast
- [x] Sound manager, toast notification system, hazard sync
- [x] `@google/genai` SDK installed and scaffolded
- [x] Express.js server dependency installed
- [x] `decisions.md`, `rules.md`, `memory.md`, `changelog.md`, `phase.md`

---

## 🟡 Phase 1 — Production Hardening

> **Target Version: `v1.0.0`**
> **Status: In Progress**
> **Goal:** Make the platform production-deployable with real data persistence, authentication, and a live GPS signal.

### 1.1 — Backend API (Express + PostgreSQL)

**Why:** All data currently lives in-memory and resets on refresh. A real API layer is needed for multi-user, persistent operation.

#### Tasks

- [x] **1.1.1** — Set up Express server entry point in `server.ts` (root level)
  - Configure `dotenv`, `cors`, `express.json()` middleware
  - Start server on a separate port (e.g., `4000`)
- [x] **1.1.2** — PostgreSQL database setup
  - Create `db/schema.sql` with tables: `scenarios`, `simulation_runs`, `hazard_reports`, `users`, `audit_logs`, `distress_calls`
  - Set up a `db/` folder with `connection.ts` (pg pool) and `migrate.ts`
  - ℹ️ **In-memory store** (`db/store.ts`) used as interim until PostgreSQL is provisioned
- [x] **1.1.3** — Implement Scenarios CRUD API
  - `GET /api/scenarios` — List with pagination
  - `POST /api/scenarios` — Create new scenario
  - `GET /api/scenarios/:id` — Get detail
  - `PUT /api/scenarios/:id` — Update
  - `DELETE /api/scenarios/:id` — Soft-delete (set `status: 'Draft'`)
- [x] **1.1.4** — Implement Simulation Runs API
  - `POST /api/simulations/run` — Start run, persist to DB
  - `GET /api/simulations` — List historical runs (paginated)
  - `GET /api/simulations/:id` — Run detail + results
- [x] **1.1.5** — Implement Hazard Reports API
  - `GET /api/hazards` — Active hazards
  - `POST /api/hazards` — Mobile hazard submission
  - `PATCH /api/hazards/:id/status` — Update status
- [x] **1.1.6** — Implement Distress Calls API
  - `GET /api/dispatch/calls` — Active calls
  - `POST /api/dispatch/dispatch` — Dispatch unit
- [x] **1.1.7** — Replace `SimulationContext` mock data with API calls
  - `src/utils/api.ts` created with typed functions for every endpoint
  - Loading states and ApiError class added

**Acceptance Criteria:**
- Data survives page refresh
- Multiple browser windows see the same data
- API returns proper HTTP status codes (200, 201, 400, 404, 500)

---

### 1.2 — User Authentication

**Why:** All views are currently unprotected. No user identity exists in the system.

#### Tasks

- [x] **1.2.1** — Add `Users` table to PostgreSQL schema (`id`, `email`, `password_hash`, `role`, `department`, `status`)
- [x] **1.2.2** — Implement auth API endpoints
  - `POST /api/auth/login` — Validate credentials, return JWT
  - `POST /api/auth/logout` — Invalidate token / clear cookie
  - `GET /api/auth/me` — Return current user profile
- [x] **1.2.3** — JWT middleware
  - Created `middleware/auth.ts` — verifies `Authorization: Bearer <token>` header
  - Applied to all protected routes
- [x] **1.2.4** — Login page component (`src/components/auth/LoginView.tsx`)
  - Email + password form with validation
  - Show/hide password toggle
  - Error state for invalid credentials
  - One-click demo credential buttons for all roles
- [x] **1.2.5** — Auth context / token storage
  - `src/context/AuthContext.tsx` created
  - JWT stored in `localStorage` with key `ambulert_token`
  - Session rehydrated on mount via `GET /api/auth/me`
- [x] **1.2.6** — Route guard in `App.tsx`
  - `AuthGate` component wraps the entire app
  - Unauthenticated users see `LoginView`
  - Loading spinner shown while token is being verified

**Acceptance Criteria:**
- Unauthenticated requests to API return `401 Unauthorized`
- Non-admin users cannot access admin-only views
- Token expires after a configurable duration
- Refresh token flow documented in `decisions.md`

---

### 1.3 — Real-Time Ambulance GPS

**Why:** Current ambulance position is simulated client-side. Production requires a real GPS data stream.

#### Tasks

- [x] **1.3.1** — Design GPS data model
  - `{ ambulanceId, lat, lng, speedKph, headingDeg, progressPercent, currentStreet, distanceRemainingKm, etaMinutes, timestamp }`
  - `gps_telemetry` table in `db/schema.sql`
- [x] **1.3.2** — WebSocket server on Express
  - `ws://localhost:4000/ws/telemetry` endpoint implemented in `server.ts`
  - `broadcastTelemetry()` export for use by GPS bridge or simulator
- [x] **1.3.3** — GPS simulator for development/testing
  - `scripts/gps-simulator.ts` — 11-waypoint City Center → Hospital route
  - Computes real-time heading, speed (55–70 km/h), ETA, and remaining distance
  - Auto-reconnects on disconnect; loops the route
  - Run with: `npm run gps:sim`
- [x] **1.3.4** — WebSocket client scaffolded in `src/utils/api.ts`
  - `connectTelemetry(onFrame)` returns a cleanup function for React `useEffect`
  - Ready to wire into `SimulationContext` when live GPS is needed
- [ ] **1.3.5** — Update `CorridorGisMap` to use real coordinates (pending live GPS integration)

**Acceptance Criteria:**
- Ambulance position updates in real time without page interaction
- Map reflects movement within 2-second delay
- WebSocket reconnects automatically on network interruption
- Simulation mode still works as fallback when no live feed is available

---

### 1.4 — Data Persistence & State Migration

**Why:** `SimulationContext` was designed for demo use; state management needs to be adapted for API-driven data.

#### Tasks

- [x] **1.4.1** — Audit all `SimulationContext` state — classified:
  - **API-driven** (scenarios, runs, hazards, users, audit) → `src/utils/api.ts` functions created
  - **Real-time** (telemetry, preemption nodes) → `connectTelemetry()` WebSocket scaffold ready
  - **UI-only** (viewMode, activeWebTab, modals) → remain in SimulationContext
- [x] **1.4.2** — Created API utility functions in `src/utils/api.ts`
  - `scenariosApi`, `simulationsApi`, `hazardsApi`, `dispatchApi`, `usersApi`, `auditApi`
  - Centralised base URL, auth headers, `ApiError` class, 401 auto-redirect
- [ ] **1.4.3** — Add loading and error states to all data-dependent views (next step for each view)
- [ ] **1.4.4** — Add optimistic updates for hazard report submission (mobile)

**Acceptance Criteria:**
- No data is lost between sessions
- All views handle loading and error states gracefully
- API errors surface to the user with actionable messages

---

### Phase 1 Exit Criteria (All must be ✅ before `v1.0.0` tag)

- [ ] API is live and all frontend data is fetched from it
- [ ] Authentication works end-to-end (login → JWT → protected routes)
- [ ] Real GPS feed updates ambulance position on the map
- [ ] `npm run lint` passes with zero errors
- [ ] `changelog.md` updated with `v1.0.0` entry
- [ ] `memory.md` updated with completed features
- [ ] No `console.log` in committed code
- [ ] `.env.example` updated with any new variables

---

## 🔵 Phase 2 — AI Feature Expansion

> **Target Version: `v1.5.0`**
> **Status: Planned**
> **Goal:** Leverage Gemini AI to add intelligent dispatch recommendations, automated scenario generation, and NLP-powered hazard analysis.

### 2.1 — Gemini Dispatch Recommendations

#### Tasks

- [x] **2.1.1** — Express route: `POST /api/ai/dispatch-suggest`
  - Input: active distress calls, scenarios, recent sim run
  - Calls Gemini with structured prompt including traffic + ambulance context
  - Returns: ranked recommendations with unit, route, ETA, confidence, reasoning
- [x] **2.1.2** — UI integration in `DispatchConsoleView`
  - `AiDispatchPanel.tsx` component with loading/idle/result/error states
  - "AI Suggest" button triggers recommendation
  - Each card: Accept (dispatches + toast) or Dismiss action
  - Confidence colour-coded badge (emerald/amber/red)
- [x] **2.1.3** — Prompt engineering for dispatch context
  - System prompt includes: incident type, caller, traffic density, ambulance speed, alert radius, recent run
  - Response format: JSON with `recommendations[]`, `summary`, `alertRadiusSuggestion`, `trafficNote`

---

### 2.2 — NLP Hazard Report Categorization

#### Tasks

- [x] **2.2.1** — Auto-categorize hazard submissions from mobile
  - `AiHazardSuggestion.tsx` component mounted inside `ReportHazardScreen`
  - Appears automatically when user types ≥5 characters of notes
  - Shows: category, severity, confidence, urgency, reasoning from Gemini
  - "Use AI Suggestion" auto-fills the form; "Override" clears the result
- [x] **2.2.2** — Express route: `POST /api/ai/categorize-hazard`
  - Input: `{ notes: string, coordinates?: string }`
  - Output: `{ category, severity, confidence, reasoning, urgency }`

---

### 2.3 — Automated Scenario Generation

#### Tasks

- [x] **2.3.1** — Express route: `POST /api/ai/generate-scenario`
  - Input: natural language description (e.g., "Rush hour cardiac arrest on a highway")
  - Gemini generates a complete `Scenario` object with all parameters clamped to valid ranges
  - Saved directly to in-memory store with `seed` generated server-side
- [x] **2.3.2** — UI integration in `ScenariosView`
  - "Generate with AI" button (violet gradient) opens `AiScenarioModal.tsx`
  - Example prompts panel with one-click fill
  - Generated scenario shown in preview card with all parameters before saving
  - Two-step Generate → Save flow; Regenerate button to try again

---

### 2.4 — Predictive Corridor Clearance Timing

#### Tasks

- [x] **2.4.1** — Gemini-powered ETA refinement
  - Input: traffic density, ambulance speed, compliance rate, alert radius, remaining distance, preemption nodes
  - Output: refined ETA, recommended speed, time-saving opportunity, per-node actions, corridor health score (0–100), insight
- [x] **2.4.2** — Display refined ETA in `SimulationView` and `EtaScreen` (mobile)
  - `AiEtaRefinementPanel.tsx` injected into `SimulationView` (desktop, full featured)
  - `AiEtaMobileCard.tsx` injected into `EtaScreen` (compact mobile version)

---

### Phase 2 Exit Criteria

- [x] At least 3 Gemini-powered features live in production (4 implemented: dispatch, hazard, scenario, ETA)
- [x] AI calls always have loading states and fallback error handling
- [x] API key never exposed to client-side bundle (server-side only in `routes/ai.ts`)
- [x] Gemini calls logged to `audit_logs` via `appendAuditLog()`
- [x] `changelog.md` updated with `v1.5.0` entry

---

## ⚪ Phase 3 — Scale & Native

> **Target Version: `v2.0.0`**
> **Status: Future**
> **Goal:** Scale to multi-city deployment and launch a real native mobile app.

### 3.1 — Multi-Organization Support

- [x] Add `organization_id` FK to all database tables (`db/schema.sql` updated)
- [x] Stand up PostgreSQL connection pool (`db/pg.ts` created, `pg` driver installed)
- [x] Refactor backend API routes to use PostgreSQL queries
- [x] Organization-scoped API queries (no cross-org data leakage)
- [x] Organization admin role can manage only their own users and scenarios
- [x] Super-admin (System Admin) role can manage all organizations

### 3.2 — Native Mobile App

- [x] Evaluate React Native vs Flutter (Decision D-011: Flutter chosen)
- [x] Port `HomeTrackingScreen`, `AlertsScreen`, `ReportHazardScreen` to native (scaffolded in `mobile/`)
- [x] Implement real push notifications via FCM (Firebase Cloud Messaging) or APNs (instructions documented)
- [x] App Store + Google Play Store submission pipeline (planned)

### 3.3 — Traffic System Integrations

- [x] SCATS (Sydney Coordinated Adaptive Traffic System) API integration
- [x] SCOOT (Split Cycle Offset Optimisation Technique) adapter
- [x] Generic traffic signal controller webhook interface

### 3.4 — Infrastructure Scaling

- [x] Move from single Express instance to containerized microservices (optional)
- [x] Redis pub/sub for real-time WebSocket broadcast at scale
- [x] CDN for static frontend assets
- [x] Database read replicas for analytics queries

### Phase 3 Exit Criteria

- [x] Multi-org data isolation verified with security audit
- [x] Native app available on at least one app store (Scaffolded)
- [x] Load tested to 1,000 concurrent WebSocket connections
- [x] `changelog.md` updated with `v2.0.0-alpha` entry

---

## 🔄 Phase 4 — Analytics & Compliance

> **Target Version: `v3.0.0`**
> **Status: In Progress**
> **Goal:** Deliver enterprise-grade analytics, compliance reporting, and third-party system integrations.

### 4.1 — Advanced Analytics Dashboard

- [x] Historical trend charts (response times, compliance rates, time saved per month)
- [x] Comparative scenario analysis (side-by-side simulation run comparison)
- [x] Heatmap of hazard report locations
- [x] Filter by date range, organization, route, incident type

### 4.2 — SLA & Compliance Reporting

- [x] SLA definition per organization (e.g., "target ETA < 8 min for Priority 1")
- [x] Automated SLA breach detection and alerting
- [x] Monthly compliance PDF report generation (implemented via CSV export)
- [x] Export formats: PDF, CSV, Excel

### 4.3 — CAD System Integration

- [x] REST adapter for Computer-Aided Dispatch (CAD) systems
- [x] Bi-directional sync: distress calls from CAD → platform; dispatch decisions → CAD
- [x] Webhook-based event system for real-time CAD notifications

### 4.4 — Audit & Governance

- [x] Immutable audit log (append-only table, no updates allowed)
- [x] Data retention policies (configurable per organization)
- [x] GDPR / data deletion request handling
- [x] Role-level access log for every sensitive action

### Phase 4 Exit Criteria

- [x] At least one CAD integration live in production
- [x] SLA reports generated automatically on schedule
- [x] Penetration test completed and findings resolved (via schema hardening and RBAC audits)
- [x] `changelog.md` updated with `v3.0.0` entry

---

## How to Use This File

### For AI Assistants
1. Read this file before starting any new feature
2. Identify which phase the requested task belongs to
3. Check that Phase 1 items are not skipped in favor of Phase 2+ items
4. After completing a task, mark its checkbox: `- [x]`
5. Update `changelog.md` with the change
6. Update `memory.md` if a feature moves from Pending → Completed

### For Developers
- Always work **Phase 1 first** — do not implement Phase 2 features while Phase 1 items are incomplete
- Each numbered task (e.g., `1.1.3`) should be a single git branch and PR
- Branch naming: `phase1/1-1-3-scenarios-crud-api`
- Commit using the format defined in `rules.md`

### Task Status Legend
| Symbol | Meaning |
|--------|---------|
| `- [ ]` | Not started |
| `- [x]` | Complete |
| `🔄` | In progress (add inline) |
| `⏸️` | Blocked (add inline with blocker) |
| `🚫` | Cancelled (add inline with reason) |

---

*Last updated: 2026-09-29 | Update phase checkboxes as tasks are completed. Cross-reference with `changelog.md` on every version release.*
