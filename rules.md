# 📜 Project Rules — Ambulance Alert

> This document defines the laws of this codebase. Every AI assistant and every developer must follow these rules without exception. Deviating from these rules without an explicit decision log entry in `decisions.md` is not permitted.

---

## Table of Contents

1. [Coding Standards](#1-coding-standards)
2. [Folder Structure Rules](#2-folder-structure-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [UI/UX Consistency Rules](#4-uiux-consistency-rules)
5. [Git Commit Rules](#5-git-commit-rules)
6. [Security & Environment Variable Rules](#6-security--environment-variable-rules)
7. [Functional Safety Rules](#7-functional-safety-rules)

---

## 1. Coding Standards

### TypeScript
- ✅ **All files must use TypeScript** — `.ts` for logic, `.tsx` for React components
- ✅ **No `any` type** — always define explicit types or interfaces; use `unknown` and narrow if truly necessary
- ✅ **All new data models must be added to `src/types.ts`** — never define ad-hoc types inside components
- ✅ **Use TypeScript's `interface` for object shapes**, `type` for unions and aliases
- ✅ **Export types explicitly**: `export interface Foo {}` not `export type Foo = {}`
- ❌ **Never use `@ts-ignore`** — fix the type error instead
- ❌ **Never use non-null assertion (`!`)** unless the value is provably non-null and a comment explains why

```typescript
// ✅ Correct
interface SimConfig {
  alertRadius: number;
  driverCompliance: number;
}

// ❌ Wrong
const config: any = { alertRadius: 500 };
```

### React Components
- ✅ **Use functional components exclusively** — no class components
- ✅ **One component per file** — file name must match the exported component name
- ✅ **Destructure props** in the function signature, not inside the function body
- ✅ **Use named exports** for all components: `export const MyComponent: React.FC = () => {}`
- ✅ **The root `App.tsx` uses a default export** — this is the only exception to the named export rule
- ✅ **Always type component props**: `React.FC<{ propName: PropType }>`
- ❌ **Never mutate state directly** — always use setter functions from hooks or context
- ❌ **No `useEffect` with missing dependency arrays** — always include all referenced variables

```typescript
// ✅ Correct
export const AlertCard: React.FC<{ title: string; severity: string }> = ({ title, severity }) => {
  return <div>{title}</div>;
};

// ❌ Wrong
function AlertCard(props) {
  const title = props.title;
  return <div>{title}</div>;
}
```

### State Management
- ✅ **All shared/global state goes through `SimulationContext`** in `src/context/SimulationContext.tsx`
- ✅ **Local UI-only state** (toggle open/close, hover, etc.) can use `useState` locally in the component
- ✅ **Consume context with the `useSimulation()` hook** — never consume `SimulationContext` directly
- ❌ **Never pass context state down as props** — consumers should call `useSimulation()` themselves
- ❌ **Never import from `SimulationContext` in files outside `src/`**

### General Code Quality
- ✅ Run `npm run lint` (`tsc --noEmit`) before every commit — all type errors must be resolved
- ✅ Keep functions under **50 lines** — split larger functions into helpers
- ✅ Use **early returns** to reduce nesting
- ✅ Add a comment for any logic that is non-obvious
- ❌ No commented-out code left in production — use git history instead
- ❌ No `console.log` statements in committed code — use proper error handling

---

## 2. Folder Structure Rules

```
Ambulance-Alert/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components used by both web and mobile
│   │   ├── mobile/          # Mobile app screens and components
│   │   └── web/             # Web dashboard views
│   ├── context/
│   │   └── SimulationContext.tsx   # SINGLE global context file
│   ├── utils/               # Pure utility functions (no React, no context)
│   ├── types.ts             # ALL shared TypeScript types and interfaces
│   ├── App.tsx              # Root layout and routing
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Global CSS / Tailwind directives
├── decisions.md             # Technical decision log
├── rules.md                 # This file — project rules
├── memory.md                # Long-term project memory
├── changelog.md             # Version history
├── .env.example             # Template for required environment variables
├── .gitignore               # Git ignore rules
├── index.html               # Vite HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Rules
- ✅ **`src/components/common/`** — components used in both web and mobile views (Header, Sidebar, Logo, modals)
- ✅ **`src/components/web/`** — all web-only dashboard views (`*View.tsx` suffix)
- ✅ **`src/components/mobile/`** — all mobile screens (`*Screen.tsx` suffix)
- ✅ **`src/utils/`** — stateless helper functions only; no React imports allowed in utils
- ✅ **New context files** require a decision log entry before creation
- ❌ **Do not create nested `components/` folders** beyond the existing `common/`, `web/`, `mobile/` split
- ❌ **Do not place components in `src/` root** — all components belong in subdirectories
- ❌ **Do not create a `pages/` directory** — this is not a Next.js project; views live in `components/web/`

---

## 3. Naming Conventions

### Files
| Type | Convention | Example |
|------|-----------|---------|
| React Component | `PascalCase.tsx` | `DashboardView.tsx` |
| Utility / Hook | `camelCase.ts` | `audio.ts` |
| Context | `PascalCaseContext.tsx` | `SimulationContext.tsx` |
| Type definitions | `types.ts` (singular, root) | `types.ts` |
| Config files | `kebab-case` | `vite.config.ts` |

### Components
| Type | Convention | Example |
|------|-----------|---------|
| Web View | `[Name]View` | `DashboardView`, `LiveMapView` |
| Mobile Screen | `[Name]Screen` | `AlertsScreen`, `EtaScreen` |
| Shared Component | `[Name]` (descriptive) | `Header`, `Sidebar`, `AboutModal` |
| Modal | `[Name]Modal` | `AboutModal`, `SimulationResultsModal` |

### Variables & Functions
```typescript
// ✅ camelCase for variables and functions
const alertRadius = 500;
function startSimulation() {}

// ✅ PascalCase for types, interfaces, enums
interface HazardReport {}
type UserRole = 'System Admin' | ...;

// ✅ SCREAMING_SNAKE_CASE for true constants
const MAX_ALERT_RADIUS_METERS = 2000;
const DEFAULT_AMBULANCE_SPEED_KPH = 60;

// ✅ 'is' / 'has' / 'can' prefix for boolean variables
const isSimRunning = true;
const hasPhoto = false;
const isBroadcastActive = true;
```

### CSS / Tailwind
- ✅ Use Tailwind utility classes
- ✅ Arbitrary values in brackets for brand colors: `bg-[#0b1c30]`
- ✅ Group related classes: layout → spacing → color → typography → interaction

---

## 4. UI/UX Consistency Rules

### Design System
The platform uses a defined brand palette. **Never deviate without a design decision:**

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#f8f9ff` | Page / main background |
| Surface | `#ffffff` | Cards, panels, modals |
| Border | `#e5eeff` | Dividers, card borders |
| Accent Light | `#eff4ff` | Highlighted panels, tabs |
| Primary Text | `#0b1c30` | All body text |
| Accent Blue | `#dce9ff` | Secondary borders, chips |
| Emergency Red | `#dc2626` | Alerts, critical status |
| Success Green | `#16a34a` | Resolved, safe status |
| Warning Amber | `#d97706` | Warnings, delays |

### Typography
- ✅ **Primary font: `Inter`** — loaded via Google Fonts in `index.html`
- ✅ **Font sizes via Tailwind**: `text-xs`, `text-sm`, `text-base`, `text-lg`, etc.
- ✅ **Headers use `font-bold`**; body text uses `font-normal` or `font-medium`
- ❌ Do not use system fonts (Arial, Helvetica) — always use the defined font stack

### Layout
- ✅ **Web views** use a sidebar + main content layout
- ✅ **Mobile views** use bottom tab navigation with `MobileApp` as the shell
- ✅ Cards use `rounded-2xl` or `rounded-3xl` with `shadow-sm` and `border border-[#e5eeff]`
- ✅ All interactive elements must have hover states (e.g., `hover:bg-[#eff4ff]`)
- ✅ Status badges follow this pattern: pill-shaped `rounded-full px-2 py-0.5 text-xs font-semibold`

### Status Color Mapping
```
Active / Running  → Green  (bg-green-100, text-green-700)
Queued / Standby  → Blue   (bg-blue-100, text-blue-700)
Critical / Failed → Red    (bg-red-100, text-red-700)
Warning / Delay   → Amber  (bg-amber-100, text-amber-700)
Completed         → Slate  (bg-slate-100, text-slate-700)
```

### Icons
- ✅ Lucide React for all new icons
- ✅ Material Symbols for legacy/existing icon usage via `<span className="material-symbols-outlined">`
- ✅ Icon size: `text-[16px]` to `text-[24px]` range; use Tailwind `size-4` to `size-6` for Lucide

### Accessibility
- ✅ All interactive elements must have `aria-label` or visible label text
- ✅ Color must not be the only way to convey status (pair with text or icon)
- ✅ Buttons must be focusable and keyboard-navigable

---

## 5. Git Commit Rules

### Commit Message Format
```
<type>(<scope>): <short summary>

[optional body]

[optional footer: refs #issue]
```

### Types
| Type | When to Use |
|------|------------|
| `feat` | Adding a new feature or screen |
| `fix` | Bug fix |
| `ui` | Visual/layout change with no logic change |
| `refactor` | Code restructuring with no behavior change |
| `chore` | Dependency updates, config changes |
| `docs` | Changes to `.md` files or comments only |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |

### Scope (use the affected area)
`context`, `web`, `mobile`, `common`, `types`, `utils`, `config`, `ai`

### Examples
```
feat(mobile): add hazard severity filter to ReportHazardScreen
fix(context): prevent simulation from running past 100% progress
ui(web): update DashboardView KPI cards to new color palette
docs(memory): update API endpoints section
chore: bump @google/genai to 2.5.0
refactor(context): extract simulation tick logic to separate function
```

### Rules
- ✅ **Summary line ≤ 72 characters**
- ✅ **Use imperative mood**: "add feature" not "added feature"
- ✅ **Reference issues in footer**: `refs #42` or `closes #42`
- ❌ **Never commit directly to `main`** — use feature branches
- ❌ **Never commit with failing type checks** — run `npm run lint` first
- ❌ **Do not commit `.env` files** — only `.env.example` is committed

---

## 6. Security & Environment Variable Rules

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini AI API key |
| `APP_URL` | ✅ Yes | Hosting URL for self-referential links |

### Rules
- ✅ **All secrets must be in `.env`** — never hardcoded in source files
- ✅ **`.env.example`** must be kept up-to-date with all required variable names and dummy values
- ✅ **`.env` must be listed in `.gitignore`** — verify before every commit
- ✅ **Access env vars via `import.meta.env.VITE_*`** in Vite (client-side) or `process.env.*` in Express (server-side)
- ❌ **Never log environment variable values** — even in development
- ❌ **Never expose `GEMINI_API_KEY` to client-side code** — route AI calls through an Express endpoint if needed
- ❌ **Never use `VITE_GEMINI_API_KEY`** — Vite prefixed vars are exposed in the browser bundle

### Code Security
- ❌ No `dangerouslySetInnerHTML` usage — always sanitize or use safe React patterns
- ❌ No user-supplied strings rendered as HTML
- ✅ Validate all user inputs at the component level before passing to context or API

---

## 7. Functional Safety Rules

> These rules exist to protect the integrity of the simulation platform.

- ✅ **Never break existing simulation functionality** unless the task explicitly requests a change to simulation behavior
- ✅ **`SimulationContext.tsx` is the most critical file** — any changes must be tested against all three view modes (`dual`, `web`, `mobile`)
- ✅ **Preserve all existing type definitions in `types.ts`** — only add, never remove without explicit request
- ✅ **All new features must degrade gracefully** — if AI or data is unavailable, show a meaningful fallback state
- ✅ **Audio features** (`src/utils/audio.ts`) must respect `soundMuted` state from context
- ❌ **Never remove or rename context properties** without updating all consumers
- ❌ **Never change the `UserRole` union type** without updating the `UsersRolesView` component and RBAC logic
- ❌ **Never hard-delete simulation runs or scenarios** — mark as `status: 'Failed'` instead

---

*Last updated: 2026-09-29 | These rules are enforced by all AI assistants working on this project.*
