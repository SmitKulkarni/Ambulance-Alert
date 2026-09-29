-- =============================================================================
-- db/schema.sql
-- Ambulance Alert — PostgreSQL Schema (v1.0.0)
-- Run this when migrating from in-memory store to a real PostgreSQL database.
-- Usage: psql -U <user> -d <database> -f db/schema.sql
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ── Organizations (Phase 3.1) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT UNIQUE NOT NULL,
  sla_target_eta_min   INTEGER NOT NULL DEFAULT 8,
  data_retention_days  INTEGER NOT NULL DEFAULT 90,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN (
                   'System Admin', 'Organization Admin', 'Traffic Analyst',
                   'Emergency Planner', 'Transportation Researcher', 'Decision Maker / Viewer'
                 )),
  department     TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  last_active    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ── Scenarios ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  route_profile       TEXT NOT NULL DEFAULT '',
  start_node          TEXT NOT NULL DEFAULT '',
  destination_node    TEXT NOT NULL DEFAULT '',
  alert_radius        INTEGER NOT NULL DEFAULT 500 CHECK (alert_radius BETWEEN 100 AND 2000),
  driver_compliance   INTEGER NOT NULL DEFAULT 70  CHECK (driver_compliance BETWEEN 10 AND 100),
  ambulance_speed     INTEGER NOT NULL DEFAULT 60  CHECK (ambulance_speed BETWEEN 20 AND 120),
  traffic_density     TEXT NOT NULL DEFAULT 'medium' CHECK (traffic_density IN ('low','medium','high','critical')),
  status              TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Completed','Running','Queued','Draft')),
  seed                INTEGER,
  created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_status     ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);

-- ── Simulation Runs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_runs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scenario_id          UUID REFERENCES scenarios(id) ON DELETE SET NULL,
  name                 TEXT NOT NULL,
  route                TEXT NOT NULL DEFAULT '',
  mode                 TEXT NOT NULL CHECK (mode IN ('Advance Alert', 'Normal Traffic')),
  status               TEXT NOT NULL DEFAULT 'Queued' CHECK (status IN ('Completed','Running','Queued','Failed')),
  travel_time_min      NUMERIC(6,2) NOT NULL DEFAULT 0,
  clearance_time_min   NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_delay_min      NUMERIC(6,2) NOT NULL DEFAULT 0,
  time_saved_min       NUMERIC(6,2) NOT NULL DEFAULT 0,
  time_saved_percent   NUMERIC(5,2) NOT NULL DEFAULT 0,
  driver_response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  alert_radius         INTEGER NOT NULL DEFAULT 0,
  compliance_rate      NUMERIC(5,2) NOT NULL DEFAULT 0,
  started_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sim_runs_scenario  ON simulation_runs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sim_runs_status    ON simulation_runs(status);
CREATE INDEX IF NOT EXISTS idx_sim_runs_created   ON simulation_runs(created_at DESC);

-- ── Hazard Reports ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hazard_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category       TEXT NOT NULL CHECK (category IN ('Accident','Road Obstruction','Flooding','Stalled EMS')),
  location_name  TEXT NOT NULL,
  coordinates    TEXT NOT NULL DEFAULT '',
  severity       TEXT NOT NULL CHECK (severity IN ('Minor Delay','Lane Restricted','Critical Blocking')),
  notes          TEXT NOT NULL DEFAULT '',
  has_photo      BOOLEAN NOT NULL DEFAULT FALSE,
  status         TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Resolved','Dispatched')),
  reported_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hazards_status  ON hazard_reports(status);
CREATE INDEX IF NOT EXISTS idx_hazards_created ON hazard_reports(created_at DESC);

-- ── Distress Calls ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS distress_calls (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  caller         TEXT NOT NULL,
  incident_type  TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  audio_duration TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Dispatched')),
  dispatched_to  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distress_status  ON distress_calls(status);
CREATE INDEX IF NOT EXISTS idx_distress_created ON distress_calls(created_at DESC);

-- ── System Audit Logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  resource   TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL CHECK (status IN ('SUCCESS','WARNING','FAILED')),
  details    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON system_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON system_audit_logs(action);

-- Make system_audit_logs append-only
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON system_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_modification
BEFORE UPDATE OR DELETE ON system_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- ── GPS Telemetry (time-series) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gps_telemetry (
  id                    BIGSERIAL PRIMARY KEY,
  organization_id       UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ambulance_id          TEXT NOT NULL,
  lat                   DOUBLE PRECISION NOT NULL,
  lng                   DOUBLE PRECISION NOT NULL,
  speed_kph             NUMERIC(5,2) NOT NULL DEFAULT 0,
  heading_deg           NUMERIC(5,2) NOT NULL DEFAULT 0,
  progress_percent      NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_street        TEXT NOT NULL DEFAULT '',
  distance_remaining_km NUMERIC(6,3) NOT NULL DEFAULT 0,
  eta_minutes           NUMERIC(5,2) NOT NULL DEFAULT 0,
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gps_ambulance ON gps_telemetry(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_gps_recorded  ON gps_telemetry(recorded_at DESC);

-- Optional: auto-delete GPS telemetry older than 7 days to keep table lean
-- (Uncomment and set up pg_cron when needed)
-- SELECT cron.schedule('cleanup-old-gps', '0 2 * * *',
--   'DELETE FROM gps_telemetry WHERE recorded_at < NOW() - INTERVAL ''7 days''');
