import { query } from './src/db/pg.js';

async function clearDemoData() {
  console.log('Clearing demo data...');
  try {
    await query(`
      TRUNCATE 
        gps_telemetry,
        distress_calls,
        hazard_reports,
        simulation_runs,
        scenarios,
        system_audit_logs,
        users,
        organizations
      CASCADE;
    `);
    console.log('Demo data successfully cleared from PostgreSQL.');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    process.exit(0);
  }
}

clearDemoData();
