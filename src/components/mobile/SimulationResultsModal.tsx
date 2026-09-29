import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const SimulationResultsModal: React.FC = () => {
  const { showResultsModal, setShowResultsModal, setActiveWebTab, showNotificationToast } =
    useSimulation();
  const [tab, setTab] = useState<'summary' | 'details'>('summary');

  if (!showResultsModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col gap-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResultsModal(false)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-700"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h3 className="text-base font-bold text-slate-900">Simulation Results</h3>
          </div>
          <button
            onClick={() => setShowResultsModal(false)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Tabs: Summary vs Details */}
        <div className="flex bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
          <button
            onClick={() => setTab('summary')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'summary'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setTab('details')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'details'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Details
          </button>
        </div>

        {tab === 'summary' ? (
          <div className="flex flex-col gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Performance Comparison</h4>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-900 rounded-xs"></span>
                    <span className="text-slate-500">Normal Traffic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
                    <span className="text-slate-900">With Advance Alerts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] flex flex-col gap-3">
              {/* Travel Time */}
              <div className="flex items-center justify-between pb-2">
                <span className="font-semibold text-slate-600">Travel Time</span>
                <div className="flex items-center gap-4 font-mono font-bold">
                  <span className="text-slate-900">12.8 min</span>
                  <span className="text-emerald-700">8.4 min</span>
                </div>
              </div>

              {/* Clearance Time */}
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-slate-600">Clearance Time</span>
                <div className="flex items-center gap-4 font-mono font-bold">
                  <span className="text-slate-900">6.2 min</span>
                  <span className="text-emerald-700">3.1 min</span>
                </div>
              </div>

              {/* Total Delay */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-slate-600">Total Delay</span>
                <div className="flex items-center gap-4 font-mono font-bold">
                  <span className="text-slate-900">5.6 min</span>
                  <span className="text-emerald-700">2.7 min</span>
                </div>
              </div>
            </div>

            {/* Time Saved Pill Box */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-700">timer</span>
                <span className="font-bold text-xs">Time Saved</span>
              </div>
              <span className="font-mono font-black text-sm text-emerald-700">
                2.6 min (22% faster)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 text-xs text-slate-600 bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff]">
            <div className="flex justify-between">
              <span className="font-semibold">Run ID</span>
              <span className="font-mono font-bold text-slate-900">SIM-4091</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Corridor Nodes</span>
              <span className="font-bold text-slate-900">5 Nodes (3.2 km)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Compliance Rate</span>
              <span className="font-bold text-slate-900">70% Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Preemption Protocol</span>
              <span className="font-bold text-slate-900">Green Wave Tier 1</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Stochastic Seed</span>
              <span className="font-mono font-bold text-slate-900">#48921</span>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setShowResultsModal(false);
            setActiveWebTab('live-map');
            showNotificationToast('Switched to Live Map view.');
          }}
          className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
        >
          View on Map
        </button>
      </div>
    </div>
  );
};
