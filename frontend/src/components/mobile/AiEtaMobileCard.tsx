/**
 * src/components/mobile/AiEtaMobileCard.tsx
 * -------------------------------------------
 * Phase 2.4 (mobile) — Compact AI ETA Refinement card for EtaScreen.
 * A lightweight version of AiEtaRefinementPanel sized for mobile.
 */

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { aiApi, EtaRefinementResponse, ApiError } from '../../utils/api';

export const AiEtaMobileCard: React.FC = () => {
  const { trafficDensity, ambulanceSpeed, driverCompliance, alertRadius, distanceRemainingKm } =
    useSimulation();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EtaRefinementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        distanceRemainingKm: typeof distanceRemainingKm === 'number' ? distanceRemainingKm : 2.5,
        preemptionNodes: [
          { name: 'Node J-12 (5th & Grand)', status: 'Green', distanceMeters: 200, etaSeconds: 14 },
          { name: 'Node J-13 (Broadway & 45th)', status: 'Red', distanceMeters: 850, etaSeconds: 62 },
          { name: 'Node J-14 (Broadway & 48th)', status: 'Queued', distanceMeters: 1400, etaSeconds: 102 },
        ],
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'AI ETA refinement failed.');
    } finally {
      setLoading(false);
    }
  };

  const healthColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">timeline</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">AI ETA Refinement</span>
            <p className="text-[10px] text-slate-500 leading-tight">Gemini predictive corridor timing</p>
          </div>
        </div>
        <button
          id="ai-refine-eta-mobile-btn"
          onClick={handleRefine}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[11px] font-bold flex items-center gap-1 hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
        >
          {loading ? (
            <><span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span> Refining</>
          ) : (
            <><span className="material-symbols-outlined text-[13px]">auto_awesome</span> Refine</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-[11px] text-red-700">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="h-10 bg-white/60 rounded-xl animate-pulse" />}

      {/* Result */}
      {result && !loading && (
        <div className="flex flex-col gap-2">
          {/* Metric tiles */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-white rounded-xl p-2 text-center border border-violet-100">
              <span className="text-[10px] text-slate-400 font-medium block">ETA</span>
              <span className="text-sm font-black text-slate-900">{result.refinedEtaMinutes.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">min</span>
            </div>
            <div className="bg-white rounded-xl p-2 text-center border border-violet-100">
              <span className="text-[10px] text-slate-400 font-medium block">Speed</span>
              <span className="text-sm font-black text-slate-900">{result.recommendedSpeedKph}</span>
              <span className="text-[10px] text-slate-400">km/h</span>
            </div>
            <div className="bg-white rounded-xl p-2 text-center border border-violet-100">
              <span className="text-[10px] text-slate-400 font-medium block">Save</span>
              <span className={`text-sm font-black ${result.timeSavingOpportunityMin > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                +{result.timeSavingOpportunityMin.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">min</span>
            </div>
          </div>

          {/* Health bar */}
          <div className="bg-white rounded-xl border border-violet-100 p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-600">Corridor Health</span>
              <span className="text-[10px] font-bold text-slate-700">{result.corridorHealthScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${healthColor(result.corridorHealthScore)}`}
                style={{ width: `${result.corridorHealthScore}%` }}
              />
            </div>
          </div>

          {/* Insight */}
          <div className="flex items-start gap-1.5 bg-white/80 rounded-xl border border-violet-100 p-2.5">
            <span className="material-symbols-outlined text-[14px] text-violet-500 flex-shrink-0 mt-0.5">psychology</span>
            <p className="text-[10px] text-slate-600 italic leading-relaxed">{result.insight}</p>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-[11px] text-slate-400 text-center py-1">
          Tap "Refine" for AI-optimised corridor timing
        </p>
      )}
    </div>
  );
};
