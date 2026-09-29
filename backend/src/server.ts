import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { scenariosRouter } from './routes/scenarios.js';
import { simulationsRouter } from './routes/simulations.js';
import { hazardsRouter } from './routes/hazards.js';
import { dispatchRouter } from './routes/dispatch.js';
import { usersRouter } from './routes/users.js';
import { auditRouter } from './routes/audit.js';
import { aiRouter } from './routes/ai.js';
import { trafficRouter } from './routes/traffic.js';
import { reportsRouter } from './routes/reports.js';
import { cadRouter } from './routes/cad.js';
import { authenticateToken } from './middleware/auth.js';
import { connectMongo } from './db/mongo.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.APP_URL || '*', credentials: true }));
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Public routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Protected routes ─────────────────────────────────────────────────────────
app.use('/api/scenarios', authenticateToken, scenariosRouter);
app.use('/api/simulations', authenticateToken, simulationsRouter);
app.use('/api/hazards', authenticateToken, hazardsRouter);
app.use('/api/dispatch', authenticateToken, dispatchRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/audit', authenticateToken, auditRouter);
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/cad', authenticateToken, cadRouter);
app.use('/api/ai', aiRouter); // auth handled inside aiRouter

// ─── External Webhooks (No JWT Auth) ──────────────────────────────────────────
app.use('/api/traffic', trafficRouter);
app.use('/api/cad/webhook', cadRouter); // Overwrite auth for webhook specifically

// ─── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── WebSocket Server — GPS Telemetry ─────────────────────────────────────────
// Clients connect to ws://<host>:4000/ws/telemetry
// They receive { ambulanceId, lat, lng, speedKph, headingDeg, progressPercent, timestamp }
// Production: replace the broadcast loop below with a real GPS feed / hardware bridge
export const wss = new WebSocketServer({ server: httpServer, path: '/ws/telemetry' });

wss.on('connection', (ws) => {
  console.log('[WS] Client connected — telemetry channel');

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });
});

/**
 * Broadcast a GPS telemetry frame to all connected WebSocket clients.
 * Called by the GPS simulator or a real GPS bridge.
 */
export function broadcastTelemetry(payload: TelemetryFrame) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

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

// ─── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.SERVER_PORT || '4000', 10);

connectMongo().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[Server] HTTP + WS listening on port ${PORT}`);
    console.log(`[Server] Health: http://localhost:${PORT}/health`);
    console.log(`[Server] WS Telemetry: ws://localhost:${PORT}/ws/telemetry`);
  });
});
