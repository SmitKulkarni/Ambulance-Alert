import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export interface MapLayersState {
  trafficHeatmap: boolean;
  emergencyRoutes: boolean;
  infrastructureStatus: boolean;
  alertGeofence: boolean;
}

interface CorridorGisMapProps {
  heightClass?: string;
  showLayersControl?: boolean;
  showControls?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  compact?: boolean;
  layers?: MapLayersState;
  onToggleLayer?: (key: keyof MapLayersState) => void;
}

export const CorridorGisMap: React.FC<CorridorGisMapProps> = ({
  heightClass = 'h-[440px]',
  showLayersControl = true,
  showControls = true,
  showLegend = true,
  compact = false,
  layers: externalLayers,
  onToggleLayer,
}) => {
  const {
    ambulanceId,
    currentStreet,
    etaMinutes,
    distanceRemainingKm,
    alertRadius,
    isBroadcastActive,
    preemptionNodes,
    ambulanceProgressPercent,
    triggerSignalOverride,
  } = useSimulation();

  // Map state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [internalLayers, setInternalLayers] = useState<MapLayersState>({
    trafficHeatmap: true,
    emergencyRoutes: true,
    infrastructureStatus: true,
    alertGeofence: true,
  });

  const activeLayers = externalLayers || internalLayers;

  const handleToggle = (key: keyof MapLayersState) => {
    if (onToggleLayer) {
      onToggleLayer(key);
    } else {
      setInternalLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // Calculate ambulance position and heading angle on route curve
  // Path: Start Node A (130, 340) -> Curve -> Hospital Node H (700, 130)
  const computeRoutePoint = (progressPercent: number) => {
    const clamped = Math.min(100, Math.max(0, progressPercent)) / 100;
    const x = 130 + clamped * (700 - 130) + Math.sin(clamped * Math.PI) * 25;
    const y = 340 + clamped * (130 - 340) - Math.sin(clamped * Math.PI) * 50;
    return { x, y };
  };

  const pCurrent = computeRoutePoint(ambulanceProgressPercent);
  const pNext = computeRoutePoint(ambulanceProgressPercent + 1);
  const ambX = Math.round(pCurrent.x);
  const ambY = Math.round(pCurrent.y);
  const headingAngle = Math.round(
    (Math.atan2(pNext.y - pCurrent.y, pNext.x - pCurrent.x) * 180) / Math.PI
  );

  const radiusScaled = Math.round((alertRadius / 500) * 85);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-inner bg-[#0b1322] select-none border border-slate-800/60`}
    >
      {/* Background Urban Map Grid (GIS Street Cartography Canvas) */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <defs>
          {/* Headlight beam projection gradient */}
          <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#fef9c3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
          </linearGradient>

          {/* Corridor Glow Gradients */}
          <linearGradient id="corridorGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="bypassGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
          </linearGradient>

          {/* Traffic Heatmap Radial Gradients */}
          <radialGradient id="heatRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#eab308" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heatAmber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#eab308" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#162235" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* Base Cartography Background */}
        <rect width="800" height="500" fill="#080e1a" />
        <rect width="800" height="500" fill="url(#streetGrid)" opacity="0.75" />

        {/* Municipal Parks & Water Features */}
        <rect x="520" y="40" width="130" height="90" rx="16" fill="#062e26" opacity="0.4" />
        <text x="585" y="90" fill="#10b981" opacity="0.5" fontSize="10" fontWeight="bold" textAnchor="middle">
          METRO PARK
        </text>

        <rect x="60" y="380" width="150" height="80" rx="12" fill="#0b2447" opacity="0.4" />
        <text x="135" y="425" fill="#38bdf8" opacity="0.5" fontSize="10" fontWeight="bold" textAnchor="middle">
          CIVIC BASIN
        </text>

        {/* Secondary Arterial Urban Streets */}
        <g stroke="#1a273e" strokeWidth="6" strokeLinecap="round" opacity="0.85">
          <line x1="40" y1="120" x2="760" y2="120" />
          <line x1="40" y1="230" x2="760" y2="230" />
          <line x1="40" y1="340" x2="760" y2="340" />
          <line x1="40" y1="440" x2="760" y2="440" />

          <line x1="140" y1="40" x2="140" y2="470" />
          <line x1="280" y1="40" x2="280" y2="470" />
          <line x1="420" y1="40" x2="420" y2="470" />
          <line x1="560" y1="40" x2="560" y2="470" />
          <line x1="700" y1="40" x2="700" y2="470" />
        </g>

        {/* Major Diagonal Highway Corridors */}
        <g stroke="#152033" strokeWidth="10" strokeLinecap="round" opacity="0.8">
          <path d="M 60 460 Q 300 360 480 200 T 740 60" fill="none" />
          <path d="M 90 60 Q 350 180 500 340 T 720 450" fill="none" />
        </g>

        {/* LAYER 1: TRAFFIC HEATMAP (Live Density & Congestion Heat Blobs) */}
        {activeLayers.trafficHeatmap && (
          <g id="layer-traffic-heatmap" className="transition-opacity duration-300">
            {/* Congestion Hotspot 1: Major Intersect (Riverside Blvd & 4th) */}
            <circle cx="280" cy="340" r="75" fill="url(#heatRed)" />
            <circle cx="280" cy="340" r="35" fill="#ef4444" fillOpacity="0.3" className="animate-pulse" />

            {/* Congestion Hotspot 2: Commercial Core (Market & Broadway) */}
            <circle cx="480" cy="230" r="90" fill="url(#heatRed)" />
            <circle cx="480" cy="230" r="45" fill="#ef4444" fillOpacity="0.25" />

            {/* Moderate Density Hotspot 3: East Expressway On-ramp */}
            <circle cx="560" cy="340" r="65" fill="url(#heatAmber)" />

            {/* Moderate Density Hotspot 4: North Crossing */}
            <circle cx="370" cy="120" r="60" fill="url(#heatAmber)" />

            {/* Road segment congestion heat flows */}
            <line x1="280" y1="340" x2="420" y2="340" stroke="#ef4444" strokeWidth="8" strokeOpacity="0.8" strokeLinecap="round" strokeDasharray="12 4" />
            <line x1="420" y1="230" x2="560" y2="230" stroke="#f59e0b" strokeWidth="7" strokeOpacity="0.75" strokeLinecap="round" strokeDasharray="8 4" />

            {/* Free flow arterial segments */}
            <line x1="140" y1="230" x2="280" y2="230" stroke="#10b981" strokeWidth="5" strokeOpacity="0.6" strokeLinecap="round" />
            <line x1="560" y1="120" x2="700" y2="120" stroke="#10b981" strokeWidth="5" strokeOpacity="0.6" strokeLinecap="round" />

            {/* Live Traffic Speed Callouts */}
            <g transform="translate(315, 325)">
              <rect x="0" y="0" width="70" height="18" rx="4" fill="#0f172a" fillOpacity="0.9" stroke="#ef4444" strokeWidth="1" />
              <text x="35" y="12" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">
                14 km/h Gridlock
              </text>
            </g>

            <g transform="translate(470, 260)">
              <rect x="0" y="0" width="74" height="18" rx="4" fill="#0f172a" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="1" />
              <text x="37" y="12" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">
                28 km/h Congested
              </text>
            </g>
          </g>
        )}

        {/* LAYER 2: EMERGENCY ROUTES (Primary Corridor + Bypass Diversions) */}
        {activeLayers.emergencyRoutes && (
          <g id="layer-emergency-routes" className="transition-opacity duration-300">
            {/* Secondary Diversion / Bypass Route 1 (via North Parkway) */}
            <path
              d="M 130 340 C 130 230, 280 120, 480 120 S 640 120, 700 130"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeDasharray="6 4"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />
            <g transform="translate(380, 105)">
              <rect x="0" y="0" width="86" height="16" rx="4" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
              <text x="43" y="11" fill="#c4b5fd" fontSize="8" fontWeight="bold" textAnchor="middle">
                Bypass Route Alpha
              </text>
            </g>

            {/* Primary Active Emergency Corridor Route (Glowing Vibrant Blue & Cyan) */}
            <path
              d="M 130 340 C 260 340, 360 270, 480 210 S 620 150, 700 130"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="16"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
            <path
              d="M 130 340 C 260 340, 360 270, 480 210 S 620 150, 700 130"
              fill="none"
              stroke="url(#corridorGlow)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Animated Flow Dash for En-Route Direction */}
            <path
              d="M 130 340 C 260 340, 360 270, 480 210 S 620 150, 700 130"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="10 16"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </g>
        )}

        {/* Advance Alert Geofence Radius around Ambulance */}
        {activeLayers.alertGeofence && isBroadcastActive && (
          <g transform={`translate(${ambX}, ${ambY})`} id="layer-geofence">
            <circle
              r={radiusScaled}
              fill="#ef4444"
              fillOpacity="0.14"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="animate-ping origin-center"
              style={{ animationDuration: '3s' }}
            />
            <circle
              r={radiusScaled}
              fill="#ef4444"
              fillOpacity="0.15"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <text
              y={-radiusScaled - 8}
              textAnchor="middle"
              fill="#fcd34d"
              fontSize="11"
              fontFamily="Inter"
              fontWeight="bold"
              className="tracking-wider uppercase drop-shadow-md"
            >
              ALERT RADIUS: {alertRadius}m
            </text>
          </g>
        )}

        {/* LAYER 3: INFRASTRUCTURE STATUS (Signals, V2X Roadside Units, CCTV) */}
        {activeLayers.infrastructureStatus && (
          <g id="layer-infrastructure-status" className="transition-opacity duration-300">
            {/* V2X Roadside Unit (RSU-01) with radio propagation arcs */}
            <g transform="translate(370, 270)" className="cursor-pointer">
              <circle r="20" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-ping" />
              <circle r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="10" y="-12" width="62" height="15" rx="3" fill="#082f49" stroke="#0284c7" strokeWidth="0.8" />
              <text x="41" y="-2" fill="#7dd3fc" fontSize="8" fontWeight="bold" textAnchor="middle">
                V2X RSU-01 (5.9G)
              </text>
            </g>

            {/* V2X Roadside Unit (RSU-02) */}
            <g transform="translate(590, 160)" className="cursor-pointer">
              <circle r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="10" y="-12" width="62" height="15" rx="3" fill="#082f49" stroke="#0284c7" strokeWidth="0.8" />
              <text x="41" y="-2" fill="#7dd3fc" fontSize="8" fontWeight="bold" textAnchor="middle">
                V2X RSU-02 (5.9G)
              </text>
            </g>

            {/* Municipal CCTV Surveillance Camera node */}
            <g transform="translate(240, 120)">
              <circle r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="8" y="-9" width="50" height="14" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
              <text x="33" y="1" fill="#6ee7b7" fontSize="8" fontWeight="bold" textAnchor="middle">
                CAM-12 (Live)
              </text>
            </g>

            {/* Pavement IoT Loop Sensor Array */}
            <g transform="translate(480, 210)">
              <rect x="-8" y="12" width="16" height="6" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
              <text x="0" y="27" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
                LOOP SENSORS
              </text>
            </g>

            {/* Signal Preemption Controllers */}
            {preemptionNodes.map((node, idx) => {
              const nodePositions = [
                { x: 260, y: 340 },
                { x: 370, y: 270 },
                { x: 480, y: 210 },
                { x: 590, y: 160 },
                { x: 700, y: 130 },
              ];
              const pos = nodePositions[idx] || { x: 300, y: 300 };
              const isGreen = node.status === 'Green Wave';
              const isRed = node.phase === 'Red';

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => triggerSignalOverride(node.id)}
                >
                  <circle
                    r="13"
                    fill={isGreen ? '#10b981' : isRed ? '#dc2626' : '#64748b'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="drop-shadow-md group-hover:scale-125 transition-transform"
                  />
                  <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black">
                    {idx + 1}
                  </text>
                  <rect
                    x="-45"
                    y="-32"
                    width="90"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke={isGreen ? '#10b981' : isRed ? '#ef4444' : '#475569'}
                    strokeWidth="1"
                  />
                  <text
                    y="-20"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {node.name.length > 12 ? node.name.slice(0, 10) + '..' : node.name}
                  </text>
                  {/* Phase badge */}
                  <rect
                    x="-30"
                    y="18"
                    width="60"
                    height="14"
                    rx="3"
                    fill={isGreen ? '#064e3b' : isRed ? '#7f1d1d' : '#1e293b'}
                  />
                  <text
                    y="28"
                    textAnchor="middle"
                    fill={isGreen ? '#a7f3d0' : isRed ? '#fecaca' : '#cbd5e1'}
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {node.status}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Waypoints: Node A (Start) and Node H (Hospital) */}
        <g transform="translate(130, 340)">
          <circle r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
          <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
            A
          </text>
          <rect x="-42" y="20" width="84" height="20" rx="4" fill="#1e293b" fillOpacity="0.9" stroke="#334155" strokeWidth="1" />
          <text y="34" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">
            Node A (Start)
          </text>
        </g>

        <g transform="translate(700, 130)">
          <circle r="16" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
          <path d="M -6 -1 H 6 V 1 H -6 Z M -1 -6 H 1 V 6 H -1 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="2" />
          <rect x="-55" y="24" width="110" height="20" rx="4" fill="#1e293b" fillOpacity="0.9" stroke="#334155" strokeWidth="1" />
          <text y="38" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">
            Node H (Hospital)
          </text>
        </g>

        {/* SIMULATED ANIMATED SVG EMERGENCY VEHICLE (AMBULANCE) ON HIGHLIGHTED ROUTE */}
        <g
          transform={`translate(${ambX}, ${ambY})`}
          style={{ transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }}
          className="cursor-pointer"
        >
          {/* Radar Emergency Pulse Aura */}
          <circle
            r="30"
            fill="#ef4444"
            fillOpacity="0.2"
            className="animate-ping"
            style={{ animationDuration: '1.4s' }}
          />

          {/* Heading-Aligned Emergency Vehicle Chassis Group */}
          <g transform={`rotate(${headingAngle})`}>
            {/* Projected Twin Headlight Beam Cones */}
            <polygon
              points="18,-7 76,-26 76,26 18,7"
              fill="url(#headlightBeam)"
              opacity="0.5"
            />

            {/* Vehicle Shadow */}
            <rect
              x="-21"
              y="-11"
              width="42"
              height="22"
              rx="6"
              fill="#000000"
              opacity="0.45"
            />

            {/* 4 Corner Tires */}
            <rect x="-15" y="-12.5" width="8" height="3" rx="1" fill="#0f172a" />
            <rect x="7" y="-12.5" width="8" height="3" rx="1" fill="#0f172a" />
            <rect x="-15" y="9.5" width="8" height="3" rx="1" fill="#0f172a" />
            <rect x="7" y="9.5" width="8" height="3" rx="1" fill="#0f172a" />

            {/* Ambulance Body Chassis */}
            <rect
              x="-19"
              y="-9.5"
              width="38"
              height="19"
              rx="4.5"
              fill="#ffffff"
              stroke="#dc2626"
              strokeWidth="1.5"
            />

            {/* Emergency Crimson Side Stripe */}
            <rect x="-18" y="-3.5" width="36" height="7" fill="#dc2626" />

            {/* Front Cab Hood Profile */}
            <path
              d="M 12 -7.5 L 18 -5.5 L 18 5.5 L 12 7.5 Z"
              fill="#f1f5f9"
              stroke="#dc2626"
              strokeWidth="0.8"
            />

            {/* Front Windshield (Tinted Dark Slate) */}
            <path
              d="M 6 -7 L 12 -5.5 L 12 5.5 L 6 7 Z"
              fill="#0f172a"
            />

            {/* Side Windows */}
            <rect x="-4" y="-8.5" width="7" height="1.8" fill="#1e293b" />
            <rect x="-4" y="6.7" width="7" height="1.8" fill="#1e293b" />

            {/* Rear Patient Compartment Windows */}
            <rect x="-17" y="-6.5" width="2.5" height="13" rx="0.5" fill="#334155" />

            {/* Emergency Red Cross Emblem on Roof */}
            <path
              d="M -10 0 H -4 M -7 -3 V 3"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Roof Emergency Dual-Strobe Lightbar */}
            <rect
              x="-1.5"
              y="-6.5"
              width="4"
              height="13"
              rx="1.5"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="0.6"
            />

            {/* Left Red Strobe (Alternating Fast Strobe) */}
            <circle
              cx="0.5"
              cy="-3.5"
              r="3.5"
              fill="#ef4444"
              className="animate-ping"
              style={{ animationDuration: '0.6s' }}
            />
            <circle
              cx="0.5"
              cy="-3.5"
              r="2.5"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* Right Blue Strobe (Alternating Fast Strobe) */}
            <circle
              cx="0.5"
              cy="3.5"
              r="3.5"
              fill="#38bdf8"
              className="animate-ping"
              style={{ animationDuration: '0.6s', animationDelay: '0.3s' }}
            />
            <circle
              cx="0.5"
              cy="3.5"
              r="2.5"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          </g>

          {/* Upright HUD Telemetry Card with Connecting Stem */}
          <line
            x1="0"
            y1="-10"
            x2="18"
            y2="-24"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <g transform="translate(18, -44)">
            <rect
              width="146"
              height="36"
              rx="6"
              fill="#0f172a"
              fillOpacity="0.95"
              stroke="#38bdf8"
              strokeWidth="1.2"
              className="drop-shadow-lg"
            />
            <text x="8" y="14" fill="#ffffff" fontSize="10" fontWeight="800">
              AMB-01 • {ambulanceId}
            </text>
            <text x="8" y="27" fill="#38bdf8" fontSize="9" fontWeight="600">
              ETA: {etaMinutes}m • {((100 - ambulanceProgressPercent) * 0.05).toFixed(1)} km left
            </text>
            <circle cx="134" cy="18" r="3" fill="#10b981" className="animate-pulse" />
          </g>
        </g>
      </svg>

      {/* Floating HUD Zoom & Reset Controls */}
      {showControls && (
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md text-white hover:bg-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 border border-slate-700/60"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md text-white hover:bg-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 border border-slate-700/60"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-lg bg-slate-900/85 backdrop-blur-md text-white hover:bg-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 border border-slate-700/60"
            title="Reset View"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
          </button>
        </div>
      )}

      {/* On-Map Quick Layers Overlay (when showLayersControl is requested) */}
      {showLayersControl && !compact && (
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-700/50 z-20 text-xs text-slate-200 flex flex-col gap-2 min-w-[190px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
              Active Map Layers
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {[activeLayers.trafficHeatmap, activeLayers.emergencyRoutes, activeLayers.infrastructureStatus].filter(Boolean).length}/3
            </span>
          </div>
          <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Traffic Heatmap</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.trafficHeatmap}
              onChange={() => handleToggle('trafficHeatmap')}
              className="accent-red-600 rounded"
            />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Emergency Routes</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.emergencyRoutes}
              onChange={() => handleToggle('emergencyRoutes')}
              className="accent-blue-600 rounded"
            />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Infrastructure Status</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.infrastructureStatus}
              onChange={() => handleToggle('infrastructureStatus')}
              className="accent-emerald-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Alert Geofence</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.alertGeofence}
              onChange={() => handleToggle('alertGeofence')}
              className="accent-amber-500 rounded"
            />
          </label>
        </div>
      )}

      {/* Floating Bottom HUD / Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-700/60 flex flex-wrap items-center gap-3 text-xs text-slate-200 pointer-events-auto">
            {activeLayers.emergencyRoutes && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span>Primary Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  <span>Bypass Diversion</span>
                </div>
              </>
            )}
            {activeLayers.trafficHeatmap && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Congestion Heatmap</span>
              </div>
            )}
            {activeLayers.infrastructureStatus && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Signal / V2X RSU</span>
              </div>
            )}
            {activeLayers.alertGeofence && isBroadcastActive && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Alert Geofence</span>
              </div>
            )}
          </div>

          {!compact && (
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-700/60 flex items-center gap-3 text-xs text-slate-200 pointer-events-auto">
              <span className="text-slate-400 font-medium">{currentStreet}</span>
              <span className="text-sky-400 font-mono font-bold">
                {distanceRemainingKm} km remaining
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
