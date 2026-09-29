# 📋 Decision Log — Ambulance Alert

> This document records every important technical and product decision made during the development of the Ambulance Alert platform. It serves as a persistent AI and team reference to avoid re-litigating settled choices.

---

## Table of Contents

| # | Decision | Date | Impact |
|---|----------|------|--------|
| D-001 | [React + Vite as Frontend Framework](#d-001-react--vite-as-frontend-framework) | 2026-09-01 | High |
| D-002 | [TypeScript as the Primary Language](#d-002-typescript-as-the-primary-language) | 2026-09-01 | High |
| D-003 | [TailwindCSS v4 for Styling](#d-003-tailwindcss-v4-for-styling) | 2026-09-01 | High |
| D-004 | [React Context API for Global State](#d-004-react-context-api-for-global-state) | 2026-09-02 | High |
| D-005 | [Dual View Mode (Web + Mobile Simulation)](#d-005-dual-view-mode-web--mobile-simulation) | 2026-09-05 | High |
| D-006 | [Gemini AI Integration via `@google/genai`](#d-006-gemini-ai-integration-via-googlegenai) | 2026-09-10 | High |
| D-007 | [Lucide React for Iconography](#d-007-lucide-react-for-iconography) | 2026-09-01 | Low |
| D-008 | [Motion Library for Animations](#d-008-motion-library-for-animations) | 2026-09-08 | Medium |
| D-009 | [Role-Based Access Control (RBAC) Architecture](#d-009-role-based-access-control-rbac-architecture) | 2026-09-12 | High |
| D-010 | [Client-Side Only Simulation (No Backend DB)](#d-010-client-side-only-simulation-no-backend-db) | 2026-09-03 | High |
| D-011 | [Flutter for Native Mobile App](#d-011-flutter-for-native-mobile-app) | 2026-09-29 | High |
| D-012 | [PostgreSQL Migration for Multi-Organization](#d-012-postgresql-migration-for-multi-organization) | 2026-09-29 | High |

---

## D-001: React + Vite as Frontend Framework

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-01 |
| **Status** | ✅ Accepted |

### Context / Problem
The project needed a fast, modern frontend framework capable of handling real-time simulation state, complex UI components across web and mobile views, and rapid development iteration.

### Decision Taken
Use **React 19** with **Vite 8** as the build tool and development server.

### Reasoning
- Vite provides near-instant HMR and fast cold starts compared to CRA or webpack
- React 19 has the widest ecosystem support and team familiarity
- Vite's plugin system allows easy integration with TailwindCSS v4 and TypeScript
- `@vitejs/plugin-react` enables fast refresh out of the box

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Next.js | Server-side rendering unnecessary; adds complexity for a simulation SPA |
| Create React App | Slow builds, deprecated by React team |
| Angular | Steeper learning curve; overkill for this use case |
| Svelte/SvelteKit | Smaller ecosystem for UI component libraries |

### Impact
- All components are React functional components with hooks
- Build output is a static SPA deployable on any CDN or Cloud Run
- Dev server runs on port `3000` with `--host 0.0.0.0` for container compatibility

---

## D-002: TypeScript as the Primary Language

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-01 |
| **Status** | ✅ Accepted |

### Context / Problem
The project involves complex data models (Scenarios, SimulationRuns, HazardReports, PreemptionNodes, etc.) that need type safety to prevent runtime errors and improve developer experience.

### Decision Taken
Use **TypeScript 7** with strict type checking. All source files use `.ts` / `.tsx` extensions. Types are centralized in `src/types.ts`.

### Reasoning
- Central `types.ts` ensures a single source of truth for all data models
- Catches interface mismatches at compile time rather than runtime
- IDE autocompletion significantly speeds up development
- `tsc --noEmit` used as the lint step in CI

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| JavaScript only | Loss of type safety; harder to maintain complex state shapes |
| JSDoc types | Inferior DX compared to native TypeScript |

### Impact
- `src/types.ts` is the canonical type registry — always update it when adding new data models
- Run `npm run lint` (`tsc --noEmit`) before committing

---

## D-003: TailwindCSS v4 for Styling

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-01 |
| **Status** | ✅ Accepted |

### Context / Problem
The UI requires a utility-first, consistent design system that can be iterated on rapidly while maintaining visual coherence across 15+ components.

### Decision Taken
Use **TailwindCSS v4** via the `@tailwindcss/vite` Vite plugin. No separate `tailwind.config.js` is required in v4.

### Reasoning
- TailwindCSS v4 uses a new CSS-first config model — simpler to set up
- Utility classes eliminate the need for custom CSS files for most styling
- Works seamlessly with Vite via the official plugin
- Design tokens are expressed inline, ensuring no unused CSS in production builds

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Vanilla CSS modules | More verbose; harder to maintain consistency |
| Styled-components | Runtime CSS-in-JS overhead; poor Vite integration |
| Material UI | Heavy bundle; generic look not suitable for emergency SaaS |

### Impact
- Use Tailwind utility classes exclusively for styling — avoid inline `style={}` unless for dynamic values
- Custom colors use Tailwind arbitrary values (e.g., `bg-[#0b1c30]`, `text-[#eff4ff]`)
- Primary brand palette: navy `#0b1c30`, off-white `#f8f9ff`, accent blue `#eff4ff`, border `#e5eeff`

---

## D-004: React Context API for Global State

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-02 |
| **Status** | ✅ Accepted |

### Context / Problem
The application needs to share simulation state, telemetry data, hazard reports, user lists, and UI navigation state across deeply nested components without prop drilling.

### Decision Taken
Use **React Context API** with a single `SimulationContext` provider wrapping the entire app. All shared state lives in `src/context/SimulationContext.tsx`.

### Reasoning
- Avoids the complexity of Redux/Zustand for a single-page simulation app
- Context API is sufficient for the current state complexity
- Keeps the codebase simpler and more approachable
- The `useSimulation()` hook provides a clean consumer interface

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Redux Toolkit | Overkill for the current scale; adds boilerplate |
| Zustand | Good alternative but adding an extra dependency wasn't justified |
| Jotai/Recoil | Atomic state model is excessive for this use case |

### Impact
- Every component consumes context via `const { ... } = useSimulation()`
- All global state mutations happen through context-provided setter functions
- If state complexity grows significantly, evaluate migrating to Zustand

---

## D-005: Dual View Mode (Web + Mobile Simulation)

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-05 |
| **Status** | ✅ Accepted |

### Context / Problem
The platform serves two distinct audiences: (1) Admin/Analyst users on a web dashboard and (2) end-user motorists on a mobile app. Both needed to be demonstrable in a single deployable artifact.

### Decision Taken
Implement three **view modes** (`dual`, `web`, `mobile`) toggled from the header. In `dual` mode, both views render side-by-side (8-col web, 4-col mobile). In `web` or `mobile` mode, only the respective view is shown.

### Reasoning
- Allows a single deployment to demonstrate the full end-to-end product story
- Eliminates the need for a separate mobile app build for demos
- Shared `SimulationContext` ensures the web and mobile views stay in sync

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Separate web and mobile apps | Double the deployment complexity for demo purposes |
| Only web view | Fails to demonstrate the citizen-facing product |

### Impact
- `viewMode` state in `SimulationContext` drives layout rendering in `App.tsx`
- Mobile components live under `src/components/mobile/`
- Web components live under `src/components/web/`

---

## D-006: Gemini AI Integration via `@google/genai`

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-10 |
| **Status** | ✅ Accepted |

### Context / Problem
The platform needs AI-powered features such as intelligent dispatch recommendations, scenario analysis, and natural language report generation.

### Decision Taken
Integrate **Google Gemini AI** using the `@google/genai` SDK (v2.4.0+). The API key is injected at runtime via `GEMINI_API_KEY` environment variable.

### Reasoning
- Native SDK with full TypeScript support
- Gemini models excel at structured output for analysis tasks
- API key managed via environment variables / AI Studio secrets panel — never hardcoded
- Aligns with Google Cloud Run deployment target

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| OpenAI GPT | Requires separate billing; not aligned with platform infrastructure |
| Anthropic Claude | Same concern; also lacks native structured output at time of decision |
| Local LLM | Infrastructure complexity; latency concerns for real-time dispatch |

### Impact
- `GEMINI_API_KEY` must be set in environment before AI features work
- AI calls should always include error handling and loading states
- Never log or expose API keys in console output or UI

---

## D-007: Lucide React for Iconography

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-01 |
| **Status** | ✅ Accepted |

### Context / Problem
Needed a consistent, lightweight, tree-shakeable icon library for use across all components.

### Decision Taken
Use **Lucide React** (v0.546.0+) for all programmatic icons. Google **Material Symbols** (loaded via CDN in `index.html`) is used for Material-style icons in specific UI areas.

### Reasoning
- Lucide React is tree-shakeable — only imported icons are bundled
- Clean, modern aesthetic consistent with the design system
- Material Symbols CDN covers icons not available in Lucide

### Impact
- Import icons individually: `import { AlertCircle } from 'lucide-react'`
- Do not import the entire icon library
- For Material icons, use `<span className="material-symbols-outlined">icon_name</span>`

---

## D-008: Motion Library for Animations

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | ✅ Accepted |

### Context / Problem
The platform needs smooth, performant animations for simulation progress, alert notifications, map overlays, and UI transitions to convey real-time urgency.

### Decision Taken
Use the **Motion** library (`motion` v12+, successor to Framer Motion) for component-level animations.

### Reasoning
- Production-grade animation library with excellent React integration
- Declarative API integrates cleanly with existing component structure
- Handles complex enter/exit animations without imperative DOM manipulation

### Impact
- Use `motion.div` and related primitives for animated elements
- Keep animations subtle and purposeful — avoid purely decorative animation
- Respect `prefers-reduced-motion` where possible

---

## D-009: Role-Based Access Control (RBAC) Architecture

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-12 |
| **Status** | ✅ Accepted |

### Context / Problem
The platform serves users with very different permissions: system admins, dispatch operators, traffic analysts, and read-only decision makers.

### Decision Taken
Define six `UserRole` types in `src/types.ts`: `System Admin`, `Organization Admin`, `Traffic Analyst`, `Emergency Planner`, `Transportation Researcher`, `Decision Maker / Viewer`. Role-based UI rendering is handled at the component level.

### Reasoning
- Clear role taxonomy aligns with real-world emergency management org structures
- Keeps role logic in the type system (enforced by TypeScript)
- UI-level RBAC is appropriate for the current simulation/demo phase

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Permission-based system | More granular but overkill for 6 roles |
| No RBAC | Violates product requirements for multi-tenant SaaS |

### Impact
- `UserRole` type must be referenced whenever user permissions are checked
- `UsersRolesView` component manages user list display
- Future: integrate server-side role validation when backend is added

---

## D-010: Client-Side Only Simulation (No Backend DB)

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-03 |
| **Status** | ✅ Accepted |

### Context / Problem
Initial version required rapid development and deployment without standing up a database or API server. All simulation data needed to be available immediately without authentication.

### Decision Taken
All simulation data is **generated and managed client-side** within `SimulationContext`. Seeded mock data provides realistic scenario runs, hazard reports, preemption nodes, and distress calls.

### Reasoning
- Reduces infrastructure complexity for v1/demo
- Allows immediate deployment to Cloud Run as a static SPA
- Simulation logic can be made deterministic using optional `seed` values

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| PostgreSQL + REST API | Needed for production but over-engineered for current demo stage |
| Firebase Realtime DB | Lock-in concern; adds auth complexity |
| LocalStorage persistence | Adds complexity without meaningful benefit for demo |

### Impact
- All data resets on page refresh — this is expected behavior for v1
- When backend is added, `SimulationContext` setters will be replaced with API calls
- Express server (`express` package present) is scaffolded for future API endpoints

---

## D-011: Flutter for Native Mobile App

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-29 |
| **Status** | ✅ Accepted |

### Context / Problem
Phase 3 requires porting the mobile simulation web views to a real native mobile app for App Store and Google Play Store submission, with real push notifications (FCM/APNs). We needed to choose between React Native and Flutter.

### Decision Taken
Use **Flutter** for the native mobile application.

### Reasoning
- Chosen by the user after an explicit prompt during Phase 3 initialization.
- Flutter provides excellent performance and consistent UI across platforms.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| React Native | User preferred Flutter, despite React Native offering more code reuse with the existing React frontend. |

### Impact
- A new Flutter codebase will be initialized in a separate directory or repository.
- Re-implementation of `HomeTrackingScreen`, `AlertsScreen`, and `ReportHazardScreen` in Dart.

---

## D-012: PostgreSQL Migration for Multi-Organization

| Field | Detail |
|-------|--------|
| **Date** | 2026-09-29 |
| **Status** | ✅ Accepted |

### Context / Problem
Phase 3 requires multi-organization support (organization-scoped API queries, no cross-org data leakage). We needed to decide whether to migrate to PostgreSQL now or temporarily update the in-memory store.

### Decision Taken
**Migrate to PostgreSQL now**.

### Reasoning
- Chosen by the user during Phase 3 initialization.
- In-memory store was always an interim solution; doing the migration now sets a solid foundation for `organization_id` foreign keys and true multi-tenant scaling.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| In-memory store updates | Rejected by user. Would create throwaway work that would need to be re-done later for PostgreSQL. |

### Impact
- We will replace `db/store.ts` with actual `pg` queries.
- We will stand up a PostgreSQL database and execute the schema from `db/schema.sql` (plus modifications for `organization_id`).

---

*Last updated: 2026-09-29 | Maintained by: AI Coding Assistant + Project Team*
