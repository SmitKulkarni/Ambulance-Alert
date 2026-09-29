/**
 * scripts/gps-simulator.ts
 * -------------------------
 * Development GPS feed simulator.
 * Replays a realistic ambulance route and broadcasts telemetry
 * frames via the Express WebSocket server.
 *
 * Usage (from project root):
 *   npx tsx scripts/gps-simulator.ts
 *
 * The simulator loops continuously. Stop with Ctrl+C.
 * In production, replace this with a real GPS hardware bridge.
 */

import WebSocket from 'ws';

const SERVER_WS = process.env.WS_URL || 'ws://localhost:4000/ws/telemetry';

// ─── Route waypoints: City Center → General Hospital ─────────────────────────
// Real-world-like coordinates for a fictional urban route
const ROUTE_WAYPOINTS = [
  { lat: 34.0550, lng: -118.2500, street: 'City Center Plaza'        },
  { lat: 34.0535, lng: -118.2480, street: 'Riverside Blvd (Km 1.0)'  },
  { lat: 34.0522, lng: -118.2460, street: 'Riverside Blvd (Km 2.1)'  },
  { lat: 34.0512, lng: -118.2445, street: 'Riverside Blvd (Km 3.0)'  },
  { lat: 34.0505, lng: -118.2437, street: 'Riverside Blvd (Km 4.2)'  },
  { lat: 34.0495, lng: -118.2420, street: 'Central Ave Intersection'  },
  { lat: 34.0480, lng: -118.2400, street: 'Market Street (Km 5.8)'    },
  { lat: 34.0465, lng: -118.2380, street: 'Park Junction'             },
  { lat: 34.0450, lng: -118.2365, street: 'Park Junction (Km 7.2)'    },
  { lat: 34.0440, lng: -118.2352, street: 'Hospital Approach Rd'      },
  { lat: 34.0430, lng: -118.2340, street: 'General Hospital Gate'     },
];

const TOTAL_WAYPOINTS = ROUTE_WAYPOINTS.length;
const AMBULANCE_ID = 'KA-01-AB-1234';
const TICK_INTERVAL_MS = 1500; // emit a frame every 1.5 seconds

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function headingDeg(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const dy = to.lat - from.lat;
  const dx = to.lng - from.lng;
  const rad = Math.atan2(dx, dy);
  return ((rad * 180) / Math.PI + 360) % 360;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ─── Total route distance ──────────────────────────────────────────────────────
const totalRouteKm = ROUTE_WAYPOINTS.slice(0, -1).reduce(
  (sum, wp, i) => sum + haversineKm(wp, ROUTE_WAYPOINTS[i + 1]),
  0
);

async function main() {
  console.log(`[GPS Sim] Connecting to ${SERVER_WS}…`);

  const ws = new WebSocket(SERVER_WS);

  ws.on('open', () => {
    console.log('[GPS Sim] Connected. Broadcasting telemetry…');
    startBroadcast(ws);
  });

  ws.on('error', (err) => {
    console.error('[GPS Sim] WS error:', err.message);
    console.log('[GPS Sim] Retrying in 5s…');
    setTimeout(main, 5000);
  });

  ws.on('close', () => {
    console.log('[GPS Sim] Connection closed. Retrying in 5s…');
    setTimeout(main, 5000);
  });
}

function startBroadcast(ws: WebSocket) {
  let segmentIndex = 0;      // which segment of the route we're on
  let segmentProgress = 0;   // 0–1 within the current segment
  const STEP = 0.08;         // how much to advance per tick

  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      clearInterval(interval);
      return;
    }

    const from = ROUTE_WAYPOINTS[segmentIndex];
    const to   = ROUTE_WAYPOINTS[Math.min(segmentIndex + 1, TOTAL_WAYPOINTS - 1)];

    const currentLat = lerp(from.lat, to.lat, segmentProgress);
    const currentLng = lerp(from.lng, to.lng, segmentProgress);
    const heading    = headingDeg(from, to);

    // Overall route progress 0–100
    const completedSegs = segmentIndex / (TOTAL_WAYPOINTS - 1);
    const segContrib    = segmentProgress / (TOTAL_WAYPOINTS - 1);
    const progressPercent = Math.min(100, (completedSegs + segContrib) * 100);

    // Remaining distance
    const travelledKm   = (progressPercent / 100) * totalRouteKm;
    const remainingKm   = Math.max(0, +(totalRouteKm - travelledKm).toFixed(3));
    const speedKph      = 55 + Math.round(Math.random() * 15); // 55–70 km/h
    const etaMinutes    = remainingKm > 0 ? +((remainingKm / speedKph) * 60).toFixed(1) : 0;

    const frame = {
      ambulanceId: AMBULANCE_ID,
      lat: +currentLat.toFixed(6),
      lng: +currentLng.toFixed(6),
      speedKph,
      headingDeg: +heading.toFixed(1),
      progressPercent: +progressPercent.toFixed(1),
      currentStreet: from.street,
      distanceRemainingKm: remainingKm,
      etaMinutes,
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(frame));
    console.log(`[GPS Sim] → ${frame.currentStreet} | ${frame.progressPercent}% | ETA ${frame.etaMinutes}m`);

    // Advance position
    segmentProgress += STEP;
    if (segmentProgress >= 1) {
      segmentProgress = 0;
      segmentIndex++;
      if (segmentIndex >= TOTAL_WAYPOINTS - 1) {
        // Loop back to start
        console.log('[GPS Sim] Route complete — restarting loop.');
        segmentIndex = 0;
      }
    }
  }, TICK_INTERVAL_MS);
}

main().catch(console.error);
