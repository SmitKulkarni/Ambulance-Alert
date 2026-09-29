# Ambulance Alert

Ambulance Alert is an emergency traffic management and simulation platform. The project is structured as a monorepo containing a React frontend and an Express/PostgreSQL backend.

## Project Structure

- `frontend/` - React 19 + Vite SPA (Dashboard and mobile simulation views)
- `backend/` - Node.js + Express API server (PostgreSQL database)
- `shared/` - Shared TypeScript types between frontend and backend
- `mobile/` - Scaffolding for the Phase 3 native Flutter app

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL (v14+)
- npm (v8+)

## Installation

To install dependencies for both the frontend and backend, you can run the following from the root directory:

```bash
npm run install:all
```

Alternatively, you can install them individually:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Configuration

Both the frontend and backend use `.env` files for configuration.
1. Copy `.env.example` to `frontend/.env` (add any frontend-specific vars here).
2. Copy `.env.example` to `backend/.env`.

Update `backend/.env` with your PostgreSQL database credentials and Gemini API Key:
```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ambulance_alert
JWT_SECRET=super_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

You can start both the frontend and backend simultaneously from the root directory:

```bash
npm run start
```
*(This assumes `npm run start` is configured to run both, or use separate terminal tabs).*

### Starting Separately

**Backend (Port 4000)**
```bash
cd backend
npm run dev
```

**Frontend (Port 3000)**
```bash
cd frontend
npm run dev
```

The frontend uses a Vite proxy to automatically route `/api/*` requests to the backend at `http://localhost:4000`.

## Architecture & Phases

For detailed architectural decisions, roadmap planning, and phase implementations, please review the `.md` documentation files at the root of the project:
- `phase.md` - Master execution plan
- `memory.md` - Technical specs and completed feature memory
- `changelog.md` - Version history
- `decisions.md` - Architectural decision records (ADRs)
