import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CorridorGisMap, MapLayersState } from '../common/CorridorGisMap';

export const LiveMapView: React.FC = () => {
  const {
    ambulanceId,
    currentStreet,
    distanceRemainingKm,
    etaMinutes,
    isBroadcastActive,
    toggleBroadcastOverride,
    resendBroadcastAlert,
    alertCountdownSec,
    connectedMotorists,
    broadcastMessage,
    preemptionNodes,
    triggerSignalOverride,
    isSimRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    simProgress,
    alertRadius,
    setAlertRadius,
    showNotificationToast,
  } = useSimulation();

  // Controlled Map Layers State
  const [mapLayers, setMapLayers] = useState<MapLayersState>({
    trafficHeatmap: true,
    emergencyRoutes: true,
    infrastructureStatus: true,
    alertGeofence: true,
  });

  const [activePreset, setActivePreset] = useState<string>('all');
  // State for the Dynamic Legend Overlay (Expanded by default, can be collapsed/minimized)
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  const [legendFilterTab, setLegendFilterTab] = useState<'all' | 'heatmap' | 'routes' | 'infrastructure'>('all');

  const toggleLayer = (layerKey: keyof MapLayersState) => {
    setMapLayers((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      const labels: Record<keyof MapLayersState, string> = {
        trafficHeatmap: 'Traffic Heatmap',
        emergencyRoutes: 'Emergency Routes',
        infrastructureStatus: 'Infrastructure Status',
        alertGeofence: 'Alert Geofence',
      };
      showNotificationToast(
        `${labels[layerKey]} layer ${next[layerKey] ? 'ENABLED' : 'HIDDEN'}.`
      );
      return next;
    });
    setActivePreset('custom');
  };

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'all') {
      setMapLayers({
        trafficHeatmap: true,
        emergencyRoutes: true,
        infrastructureStatus: true,
        alertGeofence: true,
      });
      showNotificationToast('Map preset applied: All GIS Layers Enabled.');
    } else if (presetKey === 'traffic') {
      setMapLayers({
        trafficHeatmap: true,
        emergencyRoutes: true,
        infrastructureStatus: false,
        alertGeofence: false,
      });
      showNotificationToast('Map preset applied: Traffic Congestion Flow View.');
    } else if (presetKey === 'infrastructure') {
      setMapLayers({
        trafficHeatmap: false,
        emergencyRoutes: true,
        infrastructureStatus: true,
        alertGeofence: false,
      });
      showNotificationToast('Map preset applied: Municipal Infrastructure Audit.');
    } else if (presetKey === 'emergency') {
      setMapLayers({
        trafficHeatmap: false,
        emergencyRoutes: true,
        infrastructureStatus: false,
        alertGeofence: true,
      });
      showNotificationToast('Map preset applied: Emergency Rapid Corridor Only.');
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeCount = [
    mapLayers.trafficHeatmap,
    mapLayers.emergencyRoutes,
    mapLayers.infrastructureStatus,
    mapLayers.alertGeofence,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Top Bar / Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <span>Live GIS View</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Corridor KA-01-AB-1234</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Active Emergency Tracking
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-100 text-red-900 px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 shadow-xs">
            <span className="material-symbols-outlined text-[18px] text-red-600">warning</span>
            <span>Active Preemption Protocol: Tier 1</span>
          </div>

          <button
            onClick={toggleBroadcastOverride}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
              isBroadcastActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">radio</span>
            <span>Broadcast Override</span>
          </button>
        </div>
      </div>

      {/* DEDICATED MAP LAYERS & DISPLAY CONTROLS PANEL */}
      <div className="bg-white rounded-2xl p-5 border border-[#dce9ff] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  GIS Map Layers & Telemetry Controls
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#eff4ff] text-slate-800 border border-[#dce9ff]">
                  {activeCount} / 4 Layers Visible
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toggle telemetry layers to inspect congestion bottlenecks, preemption corridors, and municipal equipment.
              </p>
            </div>
          </div>

          {/* Quick Presets Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff] self-start sm:self-center">
            <button
              onClick={() => applyPreset('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePreset === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => applyPreset('traffic')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePreset === 'traffic'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Traffic Flow
            </button>
            <button
              onClick={() => applyPreset('infrastructure')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePreset === 'infrastructure'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Infrastructure
            </button>
            <button
              onClick={() => applyPreset('emergency')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePreset === 'emergency'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Emergency Only
            </button>
          </div>
        </div>

        {/* 3 Main Requested Layer Cards + Geofence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Layer Card 1: Traffic Heatmap */}
          <div
            onClick={() => toggleLayer('trafficHeatmap')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              mapLayers.trafficHeatmap
                ? 'bg-red-50/70 border-red-300 shadow-xs ring-1 ring-red-200'
                : 'bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    mapLayers.trafficHeatmap
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">traffic</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Traffic Heatmap</h3>
                  <span className="text-[10px] text-slate-500">Live Congestion Density</span>
                </div>
              </div>

              {/* Status Switch Indicator */}
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  mapLayers.trafficHeatmap ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-xs"></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Displays real-time arterial bottleneck clusters, speed heatspots, and critical congestion delays.
            </p>

            <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-red-200/50">
              <span className="text-slate-500">Peak Slowdown:</span>
              <span className="font-mono text-red-700 font-bold">14 km/h Gridlock</span>
            </div>
          </div>

          {/* Layer Card 2: Emergency Routes */}
          <div
            onClick={() => toggleLayer('emergencyRoutes')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              mapLayers.emergencyRoutes
                ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-200'
                : 'bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    mapLayers.emergencyRoutes
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">alt_route</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Emergency Routes</h3>
                  <span className="text-[10px] text-slate-500">Corridor & Bypass Paths</span>
                </div>
              </div>

              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  mapLayers.emergencyRoutes ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-xs"></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Highlights primary preemption corridor path and alternative diversion bypasses for emergency transit.
            </p>

            <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-blue-200/50">
              <span className="text-slate-500">Primary Path:</span>
              <span className="font-mono text-blue-700 font-bold">Corridor KA-01 (Saved 4.4m)</span>
            </div>
          </div>

          {/* Layer Card 3: Infrastructure Status */}
          <div
            onClick={() => toggleLayer('infrastructureStatus')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              mapLayers.infrastructureStatus
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                : 'bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    mapLayers.infrastructureStatus
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Infrastructure Status</h3>
                  <span className="text-[10px] text-slate-500">Signals, V2X RSUs & CCTV</span>
                </div>
              </div>

              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  mapLayers.infrastructureStatus ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-xs"></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Shows real-time status of traffic signal controllers, 5.9GHz V2X Roadside Units, and municipal CCTV sensors.
            </p>

            <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-emerald-200/50">
              <span className="text-slate-500">Hardware Status:</span>
              <span className="font-mono text-emerald-800 font-bold">486 Nodes (99.8% Online)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Map & GIS Canvas & Timeline (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Map Container */}
          <div className="relative rounded-2xl overflow-hidden border border-[#dce9ff] shadow-sm bg-slate-950">
            {/* The GIS Vector Map with controlled layer state */}
            <CorridorGisMap
              heightClass="h-[520px]"
              showLayersControl={true}
              showLegend={false} // Handled by our dedicated Dynamic Symbology Legend Overlay
              layers={mapLayers}
              onToggleLayer={toggleLayer}
            />

            {/* DYNAMIC SYMBOLOGY LEGEND OVERLAY (Floating on GIS Map) */}
            <div className="absolute top-3 left-14 z-30 max-w-sm w-[340px] pointer-events-auto">
              <div className="bg-slate-950/92 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 shadow-2xl text-white flex flex-col gap-2.5 transition-all">
                {/* Header with Expand/Collapse & Active Layers Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-400 text-[18px]">
                      map_search
                    </span>
                    <span className="text-xs font-bold tracking-tight">
                      Symbology & Cartography Legend
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Active Layer Pill Badges */}
                    <div className="flex items-center gap-1">
                      {mapLayers.trafficHeatmap && (
                        <span
                          className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                          title="Traffic Heatmap Active"
                        ></span>
                      )}
                      {mapLayers.emergencyRoutes && (
                        <span
                          className="w-2 h-2 rounded-full bg-sky-400"
                          title="Emergency Routes Active"
                        ></span>
                      )}
                      {mapLayers.infrastructureStatus && (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-400"
                          title="Infrastructure Status Active"
                        ></span>
                      )}
                    </div>

                    <button
                      onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                      title={isLegendExpanded ? 'Collapse Legend' : 'Expand Legend'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isLegendExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Subtitle / Active State Summary */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span>Dynamic symbols synchronized to active layers</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeCount} of 4 visible
                  </span>
                </div>

                {/* Expanded Detailed Symbology Content */}
                {isLegendExpanded && (
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 text-xs">
                    {/* Filter Pills inside Legend */}
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
                      <button
                        onClick={() => setLegendFilterTab('all')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          legendFilterTab === 'all'
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setLegendFilterTab('heatmap')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          legendFilterTab === 'heatmap'
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Heatmap
                      </button>
                      <button
                        onClick={() => setLegendFilterTab('routes')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          legendFilterTab === 'routes'
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Routes
                      </button>
                      <button
                        onClick={() => setLegendFilterTab('infrastructure')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          legendFilterTab === 'infrastructure'
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Infrastructure
                      </button>
                    </div>

                    {/* SECTION 1: TRAFFIC HEATMAP SYMBOLOGY (Rendered when trafficHeatmap is active) */}
                    {mapLayers.trafficHeatmap &&
                      (legendFilterTab === 'all' || legendFilterTab === 'heatmap') && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-red-900/40 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-bold text-red-400">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">traffic</span>
                              <span>Traffic Heatmap Symbology</span>
                            </span>
                            <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800">
                              Active
                            </span>
                          </div>

                          {/* Item 1: Severe Congestion / Gridlock */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">Critical Gridlock</span>
                                <span className="font-mono text-red-400 text-[10px] font-bold">&lt; 15 km/h</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Severe queue. Requires immediate corridor signal preemption.
                              </p>
                            </div>
                          </div>

                          {/* Item 2: Moderate Congestion */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-amber-500/25 border border-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">Moderate Congestion</span>
                                <span className="font-mono text-amber-300 text-[10px] font-bold">15 - 35 km/h</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Density bottleneck triggering advance motorist push advisories.
                              </p>
                            </div>
                          </div>

                          {/* Item 3: Free Flow Arterial */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-4 h-1.5 bg-emerald-500 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">Free-Flowing Corridor</span>
                                <span className="font-mono text-emerald-400 text-[10px] font-bold">&gt; 50 km/h</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Optimal transit flow with standard green wave compliance.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* SECTION 2: EMERGENCY ROUTES SYMBOLOGY (Rendered when emergencyRoutes is active) */}
                    {mapLayers.emergencyRoutes &&
                      (legendFilterTab === 'all' || legendFilterTab === 'routes') && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-blue-900/40 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">alt_route</span>
                              <span>Emergency Routes Symbology</span>
                            </span>
                            <span className="text-[9px] bg-blue-950 text-sky-300 px-1.5 py-0.2 rounded border border-blue-800">
                              Active
                            </span>
                          </div>

                          {/* Primary Route */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-4 h-2 bg-gradient-to-r from-sky-400 to-blue-600 rounded-sm shadow-xs"></div>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">Primary Corridor Path</span>
                              <p className="text-[10px] text-slate-400">
                                Solid illuminated cyan & blue line with animated directional wave pulses.
                              </p>
                            </div>
                          </div>

                          {/* Bypass Route */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-4 border-b-2 border-dashed border-purple-400"></div>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">Secondary Diversion Bypass</span>
                              <p className="text-[10px] text-slate-400">
                                Dashed purple route. Automatic re-route if primary node is blocked.
                              </p>
                            </div>
                          </div>

                          {/* Ambulance Marker */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                              <span className="material-symbols-outlined text-[12px]">emergency</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">En-Route Emergency Vehicle</span>
                              <p className="text-[10px] text-slate-400">
                                Flashing GPS beacon with real-time ETA & distance remaining callout.
                              </p>
                            </div>
                          </div>

                          {/* Alert Perimeter Geofence */}
                          {mapLayers.alertGeofence && (
                            <div className="flex items-start gap-2.5 text-[11px]">
                              <div className="w-5 h-5 rounded-full border border-dashed border-amber-400 bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              </div>
                              <div className="flex-1">
                                <span className="font-bold text-slate-200">Advance Alert Geofence ({alertRadius}m)</span>
                                <p className="text-[10px] text-slate-400">
                                  Dynamic radial warning perimeter broadcasting to connected drivers.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {/* SECTION 3: INFRASTRUCTURE STATUS SYMBOLOGY (Rendered when infrastructureStatus is active) */}
                    {mapLayers.infrastructureStatus &&
                      (legendFilterTab === 'all' || legendFilterTab === 'infrastructure') && (
                        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-emerald-900/40 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px]">cell_tower</span>
                              <span>Infrastructure Status Symbology</span>
                            </span>
                            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                              Active
                            </span>
                          </div>

                          {/* Green Wave Signal */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">Signal: Green Wave Locked</span>
                              <p className="text-[10px] text-slate-400">
                                Municipal controller synchronized to green phase for ambulance.
                              </p>
                            </div>
                          </div>

                          {/* Preempted Red Signal */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                              !
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">Signal: Preempted Red</span>
                              <p className="text-[10px] text-slate-400">
                                Cross-traffic held at red to clear right-of-way passage.
                              </p>
                            </div>
                          </div>

                          {/* V2X Roadside Unit */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-md bg-sky-900 border border-sky-500 flex items-center justify-center text-sky-300 text-[10px] shrink-0 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">sensors</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">V2X Roadside Unit (RSU)</span>
                              <p className="text-[10px] text-slate-400">
                                5.9 GHz DSRC/C-V2X beacon relaying vehicle preemption telemetry.
                              </p>
                            </div>
                          </div>

                          {/* CCTV Camera */}
                          <div className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-5 h-5 rounded-md bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">videocam</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-200">Municipal CCTV Optical Cam</span>
                              <p className="text-[10px] text-slate-400">
                                Live visual sensor validating physical clearance of intersection lanes.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* EMPTY STATE (When all layers are turned off) */}
                    {!mapLayers.trafficHeatmap &&
                      !mapLayers.emergencyRoutes &&
                      !mapLayers.infrastructureStatus && (
                        <div className="p-4 rounded-xl bg-slate-900 text-center flex flex-col items-center gap-1.5 text-slate-400">
                          <span className="material-symbols-outlined text-[24px] text-slate-500">
                            visibility_off
                          </span>
                          <p className="font-bold text-slate-300 text-[11px]">
                            No Thematic Layers Active
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Toggle 'Traffic Heatmap', 'Emergency Routes', or 'Infrastructure Status'
                            in the controls panel to inspect symbology.
                          </p>
                          <button
                            onClick={() => applyPreset('all')}
                            className="mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Enable All Layers
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live HUD Overlay (Bottom of Map) */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">ambulance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Ambulance {ambulanceId}</span>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      En Route
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Destination: City General Hospital • Priority Level 1
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Estimated ETA</span>
                  <span className="text-xl font-black text-slate-900">{etaMinutes} min</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Distance Left</span>
                  <span className="text-xl font-black text-slate-900">{distanceRemainingKm} km</span>
                </div>
                <button
                  onClick={() =>
                    showNotificationToast('Camera centered on Ambulance ' + ambulanceId)
                  }
                  className="bg-slate-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-xs"
                >
                  Center Unit
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Timeline Scrubber (from Image 11) */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => (isSimRunning ? pauseSimulation() : startSimulation())}
                className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center hover:bg-slate-900 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {isSimRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <div className="flex bg-[#eff4ff] rounded-xl p-1 gap-1 border border-[#dce9ff]">
                {([1, 2, 5] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeedMultiplier(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      simSpeedMultiplier === spd
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full px-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Simulation Timeline</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCountdown(Math.round((simProgress / 100) * 480))} / 08:00
                </span>
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  showNotificationToast(`Timeline seek to ${Math.round(ratio * 8)} min`);
                }}
                className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden cursor-pointer border border-[#dce9ff]"
              >
                <div
                  className="bg-slate-950 h-full rounded-full transition-all duration-300"
                  style={{ width: `${simProgress}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={resetSimulation}
              className="bg-[#eff4ff] text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#dce9ff] border border-[#dce9ff] transition-colors"
            >
              Reset Sim
            </button>
          </div>

          {/* Corridor Signal Preemption Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Corridor Signal Preemption Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time green wave synchronization along the active route
                </p>
              </div>
              <span className="bg-[#eff4ff] text-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-[#dce9ff]">
                5 Nodes Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {preemptionNodes.map((node) => {
                const isRed = node.phase === 'Red';
                const isGreen = node.phase === 'Green' && node.status === 'Green Wave';
                return (
                  <div
                    key={node.id}
                    onClick={() => triggerSignalOverride(node.id)}
                    className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer hover:border-slate-400 transition-all flex flex-col gap-1.5 ${
                      isRed
                        ? 'border-l-4 border-l-red-600'
                        : isGreen
                        ? 'border-l-4 border-l-emerald-500'
                        : 'border-l-4 border-l-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {node.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{node.name}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isRed
                            ? 'bg-red-600 animate-pulse'
                            : isGreen
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      <span
                        className={`text-[11px] font-bold ${
                          isRed
                            ? 'text-red-600'
                            : isGreen
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Advance Alert Banner & Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Advance Alert Broadcast Active Card */}
          <div className="bg-red-600 text-white p-5 rounded-2xl shadow-md flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">priority_high</span>
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Advance Alert Broadcast Active</h3>
                <p className="text-xs text-red-100">
                  Pushing notification to {connectedMotorists.toLocaleString()} connected motorists
                </p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl text-slate-900 flex flex-col gap-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Broadcast Message
              </span>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                "{broadcastMessage}"
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Alert Expires In:</span>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {formatCountdown(alertCountdownSec)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resendBroadcastAlert}
                className="flex-1 bg-white text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-xs active:scale-95"
              >
                Resend Alert
              </button>
              <button
                onClick={() => {
                  const newRadius = alertRadius === 500 ? 750 : 500;
                  setAlertRadius(newRadius);
                  showNotificationToast(`Broadcast radius updated to ${newRadius}m`);
                }}
                className="bg-black/30 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-black/40 transition-colors"
              >
                Modify Radius ({alertRadius}m)
              </button>
            </div>
          </div>

          {/* Vehicle Telemetry Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900">Vehicle Telemetry</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Current Location</span>
                <span className="font-bold text-slate-900">{currentStreet}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Speed</span>
                <span className="font-mono font-bold text-slate-900">68 km/h (Optimized)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Driver Response Rate</span>
                <span className="font-mono font-bold text-emerald-600">88% Compliant</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Corridor Clear Status</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  94% Clear
                </span>
              </div>
            </div>
          </div>

          {/* Motorist Proximity Density */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900">Nearby Motorist Density</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Immediate Zone (0 - 500m)</span>
                <span className="font-bold text-slate-900">342 Vehicles</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-[85%] rounded-full"></div>
              </div>

              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-slate-500">Secondary Zone (500m - 1.5km)</span>
                <span className="font-bold text-slate-900">1,078 Vehicles</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-950 h-full w-[60%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
