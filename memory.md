# 🧠 Project Memory — Ambulance Alert

> This file is the long-term memory of the Ambulance Alert project. It is the first file any AI assistant or new developer should read. It is kept evergreen — update it whenever a significant change is made.

---

## 1. Project Overview

**Ambulance Alert** is an AI-powered emergency traffic management and simulation platform. It enables emergency service operators to simulate, monitor, and optimize ambulance corridors in real time. The platform also provides a companion mobile experience for motorists, delivering advance alerts when an ambulance is approaching.

### Mission Statement
> *"Smarter Alerts. Faster Ambulances. Safer Communities."*

### Audiences
| Audience | Interface | Role |
|----------|-----------|------|
| System Admins & Analysts | Web Dashboard | Full platform control |
| Traffic Operators / Dispatchers | Web Dashboard (Dispatch Console) | Real-time dispatch |
| Emergency Planners | Web Dashboard (Scenarios & Reports) | Planning & analysis |
| Decision Makers | Web Dashboard (Reports, read-only) | Reporting & oversight |
| Motorists / Citizens | Mobile App (simulated) | Receive advance alerts |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Language | TypeScript | 7.x |
| Styling | TailwindCSS | 4.x (via `@tailwindcss/vite`) |
| Animations | Motion (fka Framer Motion) | 12.x |
| Icons | Lucide React | 0.546.x |
| Icons (Material) | Google Material Symbols | CDN |
| AI SDK | `@google/genai` | 2.4.x |
| State Management | React Context API | Built-in |
| Server (scaffolded) | Express.js | 4.x |
| Runtime | Node.js | LTS |
| Deployment | Google Cloud Run | — |
| Environment | `dotenv` | 17.x |

### Key Config Files
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config, Tailwind plugin, `@` path alias |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies, scripts |
| `.env.example` | Environment variable template |
| `index.html` | Vite HTML entry, Google Fonts, Material Symbols CDN |

---

## 3. Features Completed

### Web Dashboard
- [x] **Top Brand Banner** — Logo, tagline, view mode toggle
- [x] **Global Header** — System status indicators, simulation controls, alerts, sound toggle, view mode switcher
- [x] **Sidebar Navigation** — Tab-based routing for all web views
- [x] **Dashboard View** — KPI cards, recent simulation runs table, quick stats
- [x] **Simulation View** — Active scenario configuration, simulation controls (start/pause/reset), speed multiplier (1x/2x/5x), ambulance telemetry, signal preemption nodes panel, advance alert broadcast panel
- [x] **Live Map View** — SVG/canvas-based corridor map (`CorridorGisMap`), real-time ambulance position, preemption node overlays, hazard overlays
- [x] **Dispatch Console View** — PTT (Push-to-Talk) interface, active distress calls with audio playback, corridor override toggles, zone selector
- [x] **Scenarios View** — Scenario list with status badges, create/view scenario detail, filter and sort
- [x] **Reports View** — Historical simulation runs analysis, charts, export-ready tables (doubles as Analytics tab)
- [x] **Users & Roles View** — User account management table with RBAC role display
- [x] **System Settings View** — Platform configuration, audit log display
- [x] **About Modal** — Platform information overlay

### Mobile App (Simulated)
- [x] **MobileApp Shell** — Bottom tab navigation, drawer menu
- [x] **Home Tracking Screen** — Real-time ambulance proximity, advance alert banner, ETA countdown, map mini-view
- [x] **ETA Screen** — Detailed ETA and route information
- [x] **Alerts Screen** — Push notification history, active alerts
- [x] **Report Hazard Screen** — Citizen hazard reporting form (category, severity, location, notes, photo flag)
- [x] **Settings Screen** — Mobile app preferences
- [x] **Simulation Results Modal** — Post-simulation summary overlay for mobile

### Cross-Cutting
- [x] **Three View Modes** — `web`, `mobile`, `dual` (side-by-side)
- [x] **Global SimulationContext** — Shared state across all components
- [x] **Sound Manager** (`src/utils/audio.ts`) — Web Audio API beeps/tones for alerts; mutable
- [x] **Notification Toast System** — In-app toast messages via `showNotificationToast`
- [x] **Hazard Report Sync** — Mobile hazard reports appear in web admin view
- [x] **Signal Preemption Nodes** — Real-time node status with countdown timers

### Phase 1 & 2 & 3.1 Integrations
- [x] **Backend API** — Express server endpoints for all routes
- [x] **Database Integration** — PostgreSQL schema with multi-tenant `organization_id` isolation
- [x] **Authentication** — JWT-based login with role-based access control (RBAC)
- [x] **AI Features** — Gemini-powered dispatch suggestions, hazard categorization, scenario generation, and ETA refinement
- [x] **Audit Logging** — All system actions and AI operations logged to PostgreSQL

---

## 4. Pending Features

### High Priority
- [ ] **Real-time Ambulance GPS** — WebSocket or SSE connection to live GPS feed
- [ ] **Native Mobile App** — Flutter implementation for real mobile deployment

### Medium Priority
- [ ] **Scenario Persistence** — Save/load scenarios from database
- [ ] **Export Reports** — CSV / PDF export for simulation run analytics
- [ ] **Push Notifications (Mobile)** — Real browser push notification integration
- [ ] **Multi-Ambulance Support** — Track more than one unit simultaneously
- [ ] **Route Optimization** — AI-generated optimal corridor routing

### Low Priority / Future
- [ ] **Dark Mode** — Full dark theme support
- [ ] **Offline Mode (Mobile)** — Service worker caching for mobile alerts
- [ ] **Internationalization (i18n)** — Multi-language support
- [ ] **Unit Tests** — Vitest test suite for context logic and utilities
- [ ] **E2E Tests** — Playwright tests for critical user flows
- [ ] **Native Mobile App** — React Native or Flutter implementation

---

## 5. API Endpoints

> **Status: Fully Implemented (PostgreSQL + Express).** All routes are protected by JWT authentication and RBAC roles. Data is scoped by `organization_id`.

### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/logout         # Session invalidation
GET    /api/auth/me             # Current user info
```

### Scenarios
```
GET    /api/scenarios           # List all scenarios
POST   /api/scenarios           # Create new scenario
GET    /api/scenarios/:id       # Get scenario detail
PUT    /api/scenarios/:id       # Update scenario
DELETE /api/scenarios/:id       # Soft-delete scenario
```

### Simulation Runs
```
POST   /api/simulations/run     # Start a simulation run
GET    /api/simulations         # List historical runs
GET    /api/simulations/:id     # Get run detail + results
```

### Hazard Reports
```
GET    /api/hazards             # List active hazards
POST   /api/hazards             # Submit hazard report (mobile)
PATCH  /api/hazards/:id/status  # Update hazard status
```

### Dispatch
```
GET    /api/dispatch/calls      # Active distress calls
POST   /api/dispatch/dispatch   # Dispatch unit to call
GET    /api/dispatch/corridors  # Corridor override states
PATCH  /api/dispatch/corridors/:name # Toggle corridor override
```

### Users & Roles (Admin only)
```
GET    /api/users               # List all users
POST   /api/users               # Create user
PATCH  /api/users/:id           # Update user or suspend
DELETE /api/users/:id           # Remove user
```

### AI Features
```
POST   /api/ai/analyze-scenario # Gemini scenario analysis
POST   /api/ai/dispatch-suggest # Gemini dispatch recommendation
```

---

## 6. Data Schema Summary

> Current state: All data models are backed by PostgreSQL tables (see `db/schema.sql`) and accessed via the Express backend. The TypeScript interfaces below represent the frontend consumption shape.

### `Scenario`
```typescript
{
  id: string;
  name: string;
  routeProfile: string;
  startNode: string;
  destinationNode: string;
  alertRadius: number;       // 100–2000 meters
  driverCompliance: number;  // 10–100%
  ambulanceSpeed: number;    // 20–120 km/h
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Completed' | 'Running' | 'Queued' | 'Draft';
  createdAt: string;         // ISO date string
  seed?: number;             // Optional deterministic seed
}
```

### `SimulationRun`
```typescript
{
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
```

### `PreemptionNode`
```typescript
{
  id: string;
  code: string;              // e.g. "Node #402"
  name: string;              // Street name
  status: 'Preempted' | 'Green Wave' | 'Standby' | 'Queued';
  distanceMeters: number;
  etaSeconds: number;
  phase: 'Green' | 'Amber' | 'Red';
  countdownSec: number;
}
```

### `HazardReport`
```typescript
{
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
```

### `DistressCall`
```typescript
{
  id: string;
  caller: string;
  incidentType: string;
  summary: string;
  timeAgo: string;
  audioDuration: string;
  status: 'Active' | 'Dispatched';
  isAudioPlaying?: boolean;
}
```

### `UserAccount`
```typescript
{
  id: string;
  name: string;
  email: string;
  role: UserRole;  // 'System Admin' | 'Organization Admin' | ...
  department: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}
```

### `SystemAuditLog`
```typescript
{
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}
```

---

## 7. Important Business Logic

### Simulation Tick
- Simulation runs via a `setInterval` in `SimulationContext`
- Progress increments each tick based on `simSpeedMultiplier` (1x, 2x, 5x)
- At 100% progress, simulation completes, results modal is shown, and a new `SimulationRun` is added to `recentRuns`
- Signal countdown timers (`countdownSec` on `PreemptionNode`) decrement independently

### Alert Radius & Compliance
- `alertRadius` (100–2000m): determines how far ahead motorists receive alerts
- `driverCompliance` (10–100%): % of motorists who respond to the alert
- `timeSavedPercent` is derived from these two factors in simulation results

### Advance Alert Broadcast
- `isBroadcastActive` can be toggled by operators — disabling it stops advance alerts
- `alertCountdownSec` counts down to the next broadcast cycle
- `connectedMotorists` shows the number of drivers receiving alerts in the corridor

### Signal Preemption
- Each `PreemptionNode` represents a traffic signal on the ambulance route
- `triggerSignalOverride(nodeId?)` forces a node to Preempted state
- Status flows: `Queued → Standby → Green Wave → Preempted`

### Hazard Sync
- Mobile users submit hazards via `addHazardReport()`
- The context propagates to both `ReportHazardScreen` (confirmation) and `LiveMapView` + `DashboardView` (overlays)

### Audio
- `soundManager` in `src/utils/audio.ts` uses the Web Audio API
- Plays beeps for: simulation start, alert broadcast, PTT activation, signal override
- All sounds respect `soundMuted` state from context

---

## 8. Known Issues

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| KI-001 | Data resets on page refresh | Medium | Expected in v1; requires backend for persistence |
| KI-002 | `CorridorGisMap.tsx` is 30KB+ | Low | Consider splitting map logic into sub-components |
| KI-003 | Simulation timer can drift at high speeds | Low | `setInterval` is not frame-accurate; acceptable for demo |
| KI-004 | No real GPS integration | High | Current ambulance position is simulated; needs real WebSocket feed for production |
| KI-005 | Audio may not play without user gesture | Low | Browser autoplay policy requires first user interaction |
| KI-006 | Mobile view is a simulation, not a native app | Medium | Not installable; no actual push notification capability |
| KI-007 | No auth guard on any view | High | All views are publicly accessible; needs auth layer before production |

---

## 9. Future Roadmap

### Phase 1 — Production Hardening (Next)
- Backend Express API with PostgreSQL
- User authentication (JWT or session-based)
- Real-time ambulance GPS via WebSocket
- Data persistence for scenarios and runs

### Phase 2 — AI Feature Expansion
- Gemini-powered dispatch recommendations
- NLP-based hazard report categorization
- Automated simulation scenario generation
- Predictive corridor clearance timing

### Phase 3 — Scale & Native
- Multi-city / multi-organization support
- Native mobile app (React Native)
- Real push notifications to motorist devices
- Integration with city traffic management systems (SCATS/SCOOT)

### Phase 4 — Analytics & Compliance
- Historical trend analysis dashboard
- SLA reporting for emergency response times
- Regulatory compliance report generation
- Third-party integrations (CAD systems, hospital dispatch)

---

*Last updated: 2026-09-29 | Update this file after every significant feature addition, architectural change, or discovered issue.*
