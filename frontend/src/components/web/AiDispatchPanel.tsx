/**
 * src/components/web/AiDispatchPanel.tsx
 * ----------------------------------------
 * Phase 2.1 — Gemini AI Dispatch Recommendation panel.
 * Renders inside DispatchConsoleView above the distress call log.
 * Calls POST /api/ai/dispatch-suggest and displays ranked results.
 */

import React, { useState } from 'react';
import { aiApi, DispatchSuggestionResponse, DispatchRecommendation, ApiError } from '../../utils/api';

interface Props {
  onAccept?: (rec: DispatchRecommendation) => void;
}

export const AiDispatchPanel: React.FC<Props> = ({ onAccept }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DispatchSuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDismissed(new Set());
    setAccepted(new Set());

    try {
      const data = await aiApi.dispatchSuggest();
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'AI suggestion failed. Ensure the server is running and GEMINI_API_KEY is set.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (rec: DispatchRecommendation) => {
    setAccepted(prev => new Set(prev).add(rec.callId));
    onAccept?.(rec);
  };

  const handleDismiss = (callId: string) => {
    setDismissed(prev => new Set(prev).add(callId));
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (c >= 0.6) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const visibleRecs = result?.recommendations.filter(r => !dismissed.has(r.callId)) ?? [];

  return (
    <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4 p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Gemini AI Dispatch Advisor
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">BETA</span>
            </h3>
            <p className="text-xs text-slate-500">AI-powered unit assignment recommendations</p>
          </div>
        </div>

        <button
          id="ai-dispatch-suggest-btn"
          onClick={handleSuggest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Analysing…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              AI Suggest
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="flex flex-col gap-3">
          {/* Summary banner */}
          <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl px-4 py-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-violet-600 flex-shrink-0 mt-0.5">insights</span>
            <div>
              <p className="text-xs font-semibold text-slate-800">{result.summary}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{result.trafficNote} · Suggested alert radius: {result.alertRadiusSuggestion}m</p>
            </div>
          </div>

          {/* Recommendation cards */}
          {visibleRecs.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">All recommendations reviewed.</p>
          )}

          {visibleRecs.map((rec) => {
            const isAccepted = accepted.has(rec.callId);
            return (
              <div
                key={rec.callId}
                className={`rounded-xl border p-3.5 transition-all ${isAccepted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#dce9ff]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                      {rec.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rec.unit}</span>
                    <span className="text-[10px] text-slate-500">→ {rec.route}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceColor(rec.confidence)}`}>
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">{rec.etaMinutes}m ETA</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic mb-2.5">"{rec.reasoning}"</p>

                {!isAccepted ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(rec)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition"
                    >
                      ✓ Accept &amp; Dispatch
                    </button>
                    <button
                      onClick={() => handleDismiss(rec.callId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Unit dispatched
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Idle state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-5 gap-2 text-slate-400">
          <span className="material-symbols-outlined text-[36px]">psychology</span>
          <p className="text-xs font-medium">Click "AI Suggest" to get ranked dispatch recommendations</p>
          <p className="text-[11px]">Powered by Gemini AI · Results are advisory only</p>
        </div>
      )}
    </div>
  );
};
