import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AiEtaMobileCard } from './AiEtaMobileCard';

export const EtaScreen: React.FC = () => {
  const {
    etaMinutes,
    distanceRemainingKm,
    etaSeconds,
    ambulanceProgressPercent,
    triggerSignalOverride,
    setActiveMobileTab,
    showNotificationToast,
  } = useSimulation();

  return (
    <div className="flex flex-col gap-4 p-4 animate-fadeIn pb-6">
      {/* Live Status Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#eff4ff] border border-[#dce9ff] p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-[11px] font-black font-mono text-red-600 uppercase tracking-wider">
              Active Emergency Corridor
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-xs border border-slate-200">
            Unit A-402
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Estimated Time of Arrival</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl font-black text-slate-900">{etaMinutes}</h2>
              <span className="text-sm font-bold text-slate-500">min</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 font-medium">Distance Remaining</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-2xl font-black text-slate-900">{distanceRemainingKm}</span>
              <span className="text-xs font-bold text-slate-500">km</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#dce9ff] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${ambulanceProgressPercent}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px] text-slate-700">navigation</span>
            <span>Route: 5th Ave Corridor Override</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {Math.round(ambulanceProgressPercent)}% Complete
          </span>
        </div>
      </div>

      {/* Map Thumbnail Preview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Live GIS Telemetry</h3>
          <button
            onClick={() => setActiveMobileTab('alerts')}
            className="text-[11px] text-slate-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Expand Map</span>
            <span className="material-symbols-outlined text-[14px]">open_in_full</span>
          </button>
        </div>

        <div
          className="w-full h-40 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-end p-4 bg-slate-900"
          style={{
            backgroundImage: `radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)`,
          }}
        >
          {/* Animated SVG street lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <line x1="20" y1="40" x2="360" y2="40" stroke="#94a3b8" strokeWidth="2" />
            <line x1="20" y1="90" x2="360" y2="90" stroke="#3b82f6" strokeWidth="3" />
            <line x1="120" y1="10" x2="120" y2="150" stroke="#94a3b8" strokeWidth="2" />
            <line x1="260" y1="10" x2="260" y2="150" stroke="#ef4444" strokeWidth="3" />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

          <div className="relative z-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">Approaching Intersection</p>
                <p className="text-[10px] text-slate-300">Broadway & 42nd St</p>
              </div>
            </div>

            <button
              onClick={() => setActiveMobileTab('alerts')}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-[11px] shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>View on Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Signal Status Matrix */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-900">Upcoming Signal Status</h3>

        {/* Primary Next Signal: J-12 */}
        <div className="rounded-2xl bg-white p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-xs">
                J-12
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Broadway & 42nd St</h4>
                <p className="text-[10px] text-slate-500">Next intersection in 350m</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              <span>Preempted</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-center">
            <div className="p-2 bg-white rounded-lg shadow-xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Phase</span>
              <span className="text-xs font-bold text-emerald-600">Green</span>
            </div>
            <div className="p-2 bg-white rounded-lg shadow-xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Countdown</span>
              <span className="text-xs font-mono font-black text-red-600">{etaSeconds}s</span>
            </div>
            <div className="p-2 bg-white rounded-lg shadow-xs">
              <span className="text-[10px] text-slate-400 block font-semibold">Priority</span>
              <span className="text-xs font-bold text-slate-900">Active</span>
            </div>
          </div>
        </div>

        {/* Queued Signals */}
        <div className="rounded-xl bg-white p-3 border border-[#e5eeff] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
              J-13
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Broadway & 45th St</p>
              <p className="text-[10px] text-slate-500">ETA 2 min • 850m away</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Queued
          </span>
        </div>

        <div className="rounded-xl bg-white p-3 border border-[#e5eeff] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
              J-14
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Broadway & 48th St</p>
              <p className="text-[10px] text-slate-500">ETA 4 min • 1.4km away</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Queued
          </span>
        </div>
      </div>

      {/* AI ETA Refinement Card — Phase 2.4 (mobile) */}
      <AiEtaMobileCard />

      {/* Manual Emergency Signal Override Button */}
      <button
        onClick={() => {
          triggerSignalOverride('node-402');
          showNotificationToast('Emergency Signal Override pulse sent to Node J-12.');
        }}
        className="w-full py-3.5 rounded-xl bg-slate-950 text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">bolt</span>
        <span>Trigger Emergency Signal Override</span>
      </button>
    </div>
  );
};
