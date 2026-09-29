import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CorridorGisMap } from '../common/CorridorGisMap';
import { soundManager } from '../../utils/audio';

export const AlertsScreen: React.FC = () => {
  const {
    ambulanceId,
    distanceRemainingKm,
    etaMinutes,
    showNotificationToast,
    isBroadcastActive,
  } = useSimulation();

  const handleBroadcastAudio = () => {
    soundManager.playEmergencyAlert();
    showNotificationToast('Audio siren advisory playing on connected vehicle speakers.');
  };

  const handleShareRoute = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Emergency Corridor KA-01-AB-1234',
        text: 'Ambulance approaching on active preemption route. Please yield right of way.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      showNotificationToast('Emergency route link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fadeIn pb-6">
      {/* High-Priority Banner Alert */}
      <div
        className={`w-full p-4 rounded-2xl shadow-lg relative overflow-hidden flex items-start gap-3.5 transition-all ${
          isBroadcastActive
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-slate-900 text-white'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">warning</span>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded-full">
              Advance Alert
            </span>
            <span className="text-[10px] font-mono text-red-100 font-semibold">Live Feed</span>
          </div>
          <p className="text-xs font-semibold text-white mt-1 leading-snug">
            Ambulance approaching in your area. Please move to the side and give way immediately.
          </p>
        </div>
      </div>

      {/* Live GIS Map with HUD Drawer */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md bg-slate-950 border border-[#dce9ff] relative">
        <CorridorGisMap heightClass="h-72" showLayersControl={false} showControls={true} compact={true} />

        {/* Floating Preemption Active Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-[10px] font-black font-mono text-slate-900 tracking-wider">
            PREEMPTION ACTIVE
          </span>
        </div>

        {/* Bottom Map Card Drawer */}
        <div className="p-3.5 bg-white border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">ambulance</span>
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900">Ambulance {ambulanceId}</h2>
                <p className="text-[10px] text-slate-500">Critical Trauma Unit • En Route to City General</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
              Priority 1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-[#eff4ff] p-2.5 rounded-xl flex items-center gap-2 border border-[#dce9ff]">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-900 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block leading-tight">Est. Time Arrival</span>
                <span className="text-sm font-black text-slate-900">{etaMinutes} min</span>
              </div>
            </div>

            <div className="bg-[#eff4ff] p-2.5 rounded-xl flex items-center gap-2 border border-[#dce9ff]">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-900 shadow-xs">
                <span className="material-symbols-outlined text-[16px]">route</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block leading-tight">Distance Away</span>
                <span className="text-sm font-black text-slate-900">{distanceRemainingKm} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Corridor Junctions */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-900 px-1">Upcoming Corridor Junctions</h3>

        <div className="bg-white p-3 rounded-xl border border-[#e5eeff] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-[18px]">traffic</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Junction 4: Brigade Road Crossing</h4>
              <p className="text-[10px] text-slate-500">Signal cleared to Green in 45s</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Preempted
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#e5eeff] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">traffic</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Junction 5: Residency Road</h4>
              <p className="text-[10px] text-slate-500">Queuing normal • Standby mode</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            Synced
          </span>
        </div>
      </div>

      {/* Action Bar / Quick Override */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleBroadcastAudio}
          className="flex-1 bg-slate-950 text-white py-3 px-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 hover:bg-slate-900 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">volume_up</span>
          <span>Broadcast Audio Alert</span>
        </button>

        <button
          onClick={handleShareRoute}
          className="bg-white text-slate-800 py-3 px-4 rounded-xl font-bold text-xs shadow-xs border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">share_location</span>
          <span>Share Route</span>
        </button>
      </div>
    </div>
  );
};
