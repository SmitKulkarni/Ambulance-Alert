# 📦 Changelog — Ambulance Alert

> All notable changes to this project are documented here.
> Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
> Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Changes staged for the next release.

### Planned
- Real-time mobile GPS tracking optimization
- Expanded native mobile app screens

---

## [3.0.0] — 2026-09-29

> **Phase 4: Analytics & Compliance** — Delivered enterprise-grade analytics, SLA reporting, CAD integration, and stringent audit governance.

### Added
- **Advanced Analytics API (`routes/reports.ts`)**:
  - `/trends` endpoint for monthly historical averages (response time, compliance, time saved).
  - `/compare` endpoint for side-by-side simulation analysis.
  - `/hazards-heatmap` endpoint for visualizing geographical hazard hotspots.
- **SLA & Compliance Reporting**:
  - Organization-level configurable `sla_target_eta_min` schema enforcement.
  - SLA breach detection API calculation and monitoring.
  - `/export` endpoint for exporting simulation compliance data directly to CSV.
- **Computer-Aided Dispatch (CAD) Integration (`routes/cad.ts`)**:
  - `/webhook` receiver for automatic CAD distress call ingestion.
  - `/dispatch-sync` REST adapter to push platform dispatch actions back to CAD.
- **Audit & Governance Hardening**:
  - PostgreSQL trigger added to completely lock `system_audit_logs` (immutable/append-only).
  - Data retention configuration added per organization.
  - GDPR Hard-Delete / Anonymization endpoint (`DELETE /api/users/:id/gdpr`) to purge PII while maintaining foreign key integrity for historical run data.

---

## [2.0.0-alpha] — 2026-09-29

> **Phase 3.1: Scale & Native** — Complete migration from in-memory state to PostgreSQL with multi-organization support.

### Added
- **Multi-Tenant Architecture**: `organization_id` foreign keys cascaded across all primary tables for complete data isolation.
- **PostgreSQL Pool**: `db/pg.ts` configured for async query execution via the `pg` driver.
- **Backend API Migration**: Fully migrated 6 Express API route files (`auth.ts`, `users.ts`, `scenarios.ts`, `simulations.ts`, `hazards.ts`, `dispatch.ts`) from synchronous in-memory store to asynchronous PostgreSQL queries.
- **Organization-Scoped API**: All GET, POST, PATCH, and DELETE operations automatically enforce `organization_id` isolation based on the user's JWT payload.
- **RBAC Refinements**: Organization Admins are restricted to modifying entities within their own organization, while System Admins maintain global oversight where applicable.
- **Audit Logging**: `appendAuditLog` now performs non-blocking, fire-and-forget inserts into the `system_audit_logs` table.

---

## [1.5.0] — 2026-09-29

> **Phase 2: AI Feature Expansion** — Gemini AI integration across dispatch, hazard reporting, scenario generation, and ETA prediction.

### Added

#### Backend (Express API)
- `routes/ai.ts` — 4 new Gemini-powered API routes:
  - `POST /api/ai/dispatch-suggest` — Ranked unit dispatch recommendations with confidence scores, reasoning, and route suggestions
  - `POST /api/ai/categorize-hazard` — NLP classification of free-text hazard notes → category + severity + urgency
  - `POST /api/ai/generate-scenario` — Natural language → full Scenario object with all parameters auto-generated
  - `POST /api/ai/refine-eta` — Predictive corridor ETA refinement with per-node timing actions and corridor health score (0–100)
- All AI routes authenticate via JWT, log every call to the audit log, and handle Gemini JSON fence stripping

#### Web Dashboard UI
- `AiDispatchPanel.tsx` — Mounted in `DispatchConsoleView` right panel; confidence-coloured recommendation cards with Accept/Dismiss actions
- `AiScenarioModal.tsx` — Full-screen modal in `ScenariosView`; example prompt buttons, animated skeleton, two-step Generate → Save flow
- `AiEtaRefinementPanel.tsx` — Injected in `SimulationView`; corridor health bar, per-node refinements, AI insight block, 3-metric tile row

#### Mobile App
- `AiHazardSuggestion.tsx` — Auto-appears in `ReportHazardScreen` when ≥5 chars typed; confirms → auto-fills form fields
- `AiEtaMobileCard.tsx` — Compact ETA refinement card injected in `EtaScreen`; health bar + insight text

#### API Client
- `src/utils/api.ts` — `aiApi` object with 4 typed functions: `dispatchSuggest`, `categorizeHazard`, `generateScenario`, `refineEta`
- Exported TypeScript interfaces: `DispatchSuggestionResponse`, `HazardCategorizationResponse`, `GeneratedScenarioResponse`, `EtaRefinementResponse`

### Security
- `GEMINI_API_KEY` used exclusively server-side; never included in client bundle
- All AI calls validated and authenticated before reaching Gemini

---

## [1.0.0] — 2026-09-29

> **Phase 1: Production Hardening** — Express REST API, JWT authentication, WebSocket GPS, in-memory data store.

### Added

#### Backend (Express + WebSocket)
- `server.ts` — Express + `ws` hybrid server on port 4000 with CORS, rate-limiting, and health endpoint
- `db/store.ts` — In-memory `Map`-based data store seeded with mock data (drop-in replacement for PostgreSQL)
- `db/schema.sql` — Full PostgreSQL schema: 6 tables (`users`, `scenarios`, `simulation_runs`, `hazard_reports`, `distress_calls`, `system_audit_logs`, `gps_telemetry`) with FK constraints and indexes
- `middleware/auth.ts` — `authenticateToken`, `requireRole`, `signToken` (JWT, bcrypt)
- `routes/auth.ts` — Login (bcrypt verify → JWT), logout (audit log), `/me`
- `routes/scenarios.ts` — Full CRUD; soft-delete pattern (status → Draft)
- `routes/simulations.ts` — Run + paginated history; computed metrics (travel time, time saved %, compliance)
- `routes/hazards.ts` — Submit + status lifecycle (Active → Dispatched → Resolved)
- `routes/dispatch.ts` — Distress calls, unit dispatch (with duplicate guard), corridor override PATCH
- `routes/users.ts` — User CRUD with bcrypt hashing; passwordHash stripped from all responses
- `routes/audit.ts` — Paginated, filterable audit log
- `scripts/gps-simulator.ts` — 11-waypoint GPS broadcaster; computes heading/speed/ETA; loops + auto-reconnects

#### Frontend
- `src/utils/api.ts` — Centralised typed fetch client for all 7 API groups + WebSocket `connectTelemetry()`
- `src/context/AuthContext.tsx` — JWT session management, token rehydration on mount via `/api/auth/me`
- `src/components/auth/LoginView.tsx` — Branded login page with demo credential one-click buttons
- `App.tsx` — `AuthGate` component: spinner while checking token → `LoginView` or `SimulationProvider`

#### Config
- `tsconfig.server.json` — Separate TypeScript config for Node.js server (no DOM lib)
- `.env.example` — Updated with `JWT_SECRET`, `JWT_EXPIRES_IN`, `SERVER_PORT`, `VITE_API_URL`
- `package.json` — Added `npm run server` (tsx watch) and `npm run gps:sim` scripts

---

## [0.9.0] — 2026-09-29

> **Initial Platform Release** — Full simulation platform with web dashboard, mobile simulation, and AI integration scaffold.

### Added

#### Web Dashboard
- `DashboardView` — KPI cards, recent simulation runs table, quick-action buttons
- `SimulationView` — Full simulation control panel with scenario config, speed multiplier, ambulance telemetry, signal preemption nodes, and advance alert broadcast panel
- `LiveMapView` — SVG corridor map (`CorridorGisMap`) with ambulance position, preemption node overlays, and hazard markers
- `DispatchConsoleView` — PTT interface, active distress call management with audio playback simulation, corridor override toggles
- `ScenariosView` — Scenario management list with status badges, scenario creation workflow
- `ReportsView` — Historical simulation analytics, run comparison tables (shared with Analytics tab)
- `UsersRolesView` — User account management with RBAC role display and status management
- `SystemSettingsView` — Platform configuration and system audit log viewer

#### Common Components
- `Header` — Global operational header with system status indicators, simulation controls, alert bell, sound toggle, view mode switcher
- `Sidebar` — Collapsible tab-based navigation for web views
- `Logo` — Animated ambulance alert brand logo component
- `AboutModal` — Platform information modal with tech stack details
- `CorridorGisMap` — SVG-based GIS corridor map with real-time overlays

#### Mobile App (Simulated)
- `MobileApp` — Shell container with bottom tab navigation and slide-out drawer
- `HomeTrackingScreen` — Real-time ambulance proximity alert, countdown banner, mini-map, connected motorists count
- `EtaScreen` — Detailed ETA display, route progress, next waypoints
- `AlertsScreen` — Push alert history with severity color coding
- `ReportHazardScreen` — Citizen hazard reporting: category, location, severity, notes, photo flag
- `SettingsScreen` — Mobile notification and display preferences
- `SimulationResultsModal` — Post-simulation results overlay with key metrics

#### Architecture & Infrastructure
- React 19 + Vite 8 SPA architecture
- TypeScript 7 with strict mode
- TailwindCSS v4 via `@tailwindcss/vite` plugin
- `SimulationContext` — Single global state provider for entire application
- `useSimulation()` hook — Clean consumer interface for all components
- Three view modes: `web`, `mobile`, `dual` (side-by-side)
- `soundManager` in `src/utils/audio.ts` — Web Audio API sound effects
- Toast notification system via `showNotificationToast`
- `src/types.ts` — Centralized TypeScript type registry
- Motion library integration for UI animations
- Lucide React + Google Material Symbols iconography

#### Data & Simulation
- Seeded mock data for scenarios, simulation runs, preemption nodes, distress calls, hazards, user accounts, and audit logs
- Simulation tick engine with configurable speed (1x/2x/5x)
- Signal preemption node lifecycle (`Queued → Standby → Green Wave → Preempted`)
- `alertRadius` (100–2000m) and `driverCompliance` (10–100%) scenario parameters
- Hazard report sync between mobile and web views
- Deterministic simulation seeding via optional `seed` field on `Scenario`

#### Environment & Config
- `.env.example` with `GEMINI_API_KEY` and `APP_URL` templates
- `.gitignore` excluding `.env`, `node_modules`, `dist`
- `vite.config.ts` with `@` path alias and HMR/watch config for AI Studio compatibility
- `tsconfig.json` with strict TypeScript settings
- `npm run lint` (`tsc --noEmit`) for type checking
- Dev server on port `3000` with `--host 0.0.0.0` for container support

#### AI Integration (Scaffold)
- `@google/genai` SDK (v2.4.0) installed and ready
- `GEMINI_API_KEY` environment variable pattern established
- Express.js server scaffolded for future AI API route proxying

#### Documentation
- `decisions.md` — Technical and product decision log (10 decisions documented)
- `rules.md` — Project coding standards and conventions
- `memory.md` — Long-term project memory and architecture reference
- `changelog.md` — This file

### Known Limitations
- All data is in-memory and resets on page refresh (no persistence layer yet)
- No authentication — all views are publicly accessible
- Mobile view is a React simulation, not a native installable app
- No real GPS integration — ambulance position is simulated
- Audio may require user interaction before playing (browser autoplay policy)

---

## Version History Summary

| Version | Date | Summary |
|---------|------|---------|
| [Unreleased] | — | Backend, auth, real GPS, AI dispatch |
| [0.9.0] | 2026-09-29 | Initial full platform release |

---

## Changelog Maintenance Guide

### When to create a new entry
- Every time a feature is added, changed, fixed, or removed
- Before every merge to `main`
- After every dependency version bump that changes behavior

### Entry Template

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- Description of new feature or component

### Changed
- Description of modified behavior or UI

### Fixed
- Description of bug fix (include issue reference if available)

### Removed
- Description of removed feature or code
```

### Versioning Guide
| Change Type | Version Bump |
|-------------|-------------|
| Breaking change | Major (X.0.0) |
| New feature, backward compatible | Minor (0.Y.0) |
| Bug fix or patch | Patch (0.0.Z) |
| Documentation / tooling only | Patch or no bump |

---

*Maintained by: AI Coding Assistant + Project Team | Follow [Keep a Changelog](https://keepachangelog.com) conventions.*
