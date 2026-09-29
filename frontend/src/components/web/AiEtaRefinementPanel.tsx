/**
 * src/components/web/AiEtaRefinementPanel.tsx
 * ----------------------------------------------
 * Phase 2.4 — Gemini predictive corridor ETA refinement panel.
 * Renders inside SimulationView alongside the GIS map.
 * Calls POST /api/ai/refine-eta with current simulation parameters.
 */

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { aiApi, EtaRefinementResponse, ApiError } from '../../utils/api';

export const AiEtaRefinementPanel: React.FC = () => {
  const {
    trafficDensity,
    ambulanceSpeed,
    driverCompliance,
    alertRadius,
  } = useSimulation();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EtaRefinementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock preemption node data (wired from real telemetry in Phase 3)
  const mockNodes = [
    { name: 'Signal Node 5th & Grand', status: 'Green', distanceMeters: 200, etaSeconds: 14 },
    { name: 'Signal Node Broadway & 14th', status: 'Red', distanceMeters: 580, etaSeconds: 42 },
    { name: 'Signal Node State St Overpass', status: 'Green', distanceMeters: 920, etaSeconds: 67 },
    { name: 'Signal Node Hospital Gate', status: 'Yellow', distanceMeters: 1400, etaSeconds: 102 },
  ];

  const handleRefine = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiApi.refineEta({
        trafficDensity,
        ambulanceSpeed,
        complianceRate: driverCompliance,
        alertRadius,
        distanceRemainingKm: 2.5,
        preemptionNodes: mockNodes,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ETA refinement failed.');
    } finally {
      setLoading(false);
    }
  };

  const healthColor = (score: number) => {
    if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Optimal' };
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Moderate' };
    return { bar: 'bg-red-500', text: 'text-red-700', label: 'Needs Attention' };
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[17px]">timeline</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              AI Corridor ETA Refinement
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">GEMINI</span>
            </h3>
            <p className="text-xs text-slate-500">Predictive per-node clearance timing</p>
          </div>
        </div>

        <button
          id="ai-refine-eta-btn"
          onClick={handleRefine}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
            <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Refining…</>
          ) : (
            <><span className="material-symbols-outlined text-[14px]">auto_awesome</span> Refine ETA</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700">
          <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="flex flex-col gap-3">
          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-medium block">Refined ETA</span>
              <span className="text-lg font-black text-slate-900">{result.refinedEtaMinutes.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">min</span>
            </div>
            <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-medium block">Rec. Speed</span>
              <span className="text-lg font-black text-slate-900">{result.recommendedSpeedKph}</span>
              <span className="text-[10px] text-slate-400 font-medium">km/h</span>
            </div>
            <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-medium block">Time Save</span>
              <span className={`text-lg font-black ${result.timeSavingOpportunityMin > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                +{result.timeSavingOpportunityMin.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">min</span>
            </div>
          </div>

          {/* Corridor health */}
          <div className="bg-white border border-[#e5eeff] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">Corridor Health Score</span>
              <span className={`text-[11px] font-bold ${healthColor(result.corridorHealthScore).text}`}>
                {result.corridorHealthScore}/100 — {healthColor(result.corridorHealthScore).label}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${healthColor(result.corridorHealthScore).bar}`}
                style={{ width: `${result.corridorHealthScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Confidence: {result.confidencePercent}%</p>
          </div>

          {/* Per-node refinements */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Per-Node Actions</span>
            <div className="flex flex-col gap-1.5">
              {result.nodeRefinements.map((n) => (
                <div key={n.name} className="flex items-center justify-between bg-[#eff4ff] border border-[#dce9ff] rounded-xl px-3 py-2">
                  <span className="text-[11px] font-medium text-slate-700 truncate max-w-[55%]">{n.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-900">{n.refinedEtaSec}s</span>
                    <span className="text-[10px] text-violet-600 font-semibold">{n.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-violet-500 flex-shrink-0 mt-0.5">psychology</span>
            <div>
              <p className="text-[11px] font-semibold text-slate-800 mb-0.5">{result.insight}</p>
              <p className="text-[10px] text-slate-500">{result.speedAdjustmentReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Idle */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center py-4 gap-2 text-slate-400">
          <span className="material-symbols-outlined text-[32px]">timeline</span>
          <p className="text-xs font-medium">Click "Refine ETA" for AI-powered corridor timing</p>
        </div>
      )}
    </div>
  );
};
