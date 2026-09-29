/**
 * src/components/mobile/AiHazardSuggestion.tsx
 * -----------------------------------------------
 * Phase 2.2 — NLP hazard categorization UI for the mobile hazard report form.
 * Appears after the user types notes — shows AI-suggested category and severity.
 * The user can confirm (auto-fills the form) or override manually.
 */

import React, { useState, useRef } from 'react';
import { aiApi, HazardCategorizationResponse, ApiError } from '../../utils/api';

interface Props {
  notes: string;
  coordinates?: string;
  onConfirm: (category: string, severity: string) => void;
}

const urgencyColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const categoryIcons: Record<string, string> = {
  'Accident': 'car_crash',
  'Road Obstruction': 'construction',
  'Flooding': 'flood',
  'Stalled EMS': 'emergency',
};

export const AiHazardSuggestion: React.FC<Props> = ({ notes, coordinates, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HazardCategorizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnalyse = async () => {
    if (notes.trim().length < 5) {
      setError('Please enter more details to analyse.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setConfirmed(false);

    try {
      const data = await aiApi.categorizeHazard(notes.trim(), coordinates);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    setConfirmed(true);
    onConfirm(result.category, result.severity);
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">smart_toy</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">AI Hazard Analyser</span>
            <p className="text-[10px] text-slate-500 leading-tight">Auto-classify from your description</p>
          </div>
        </div>
        <button
          id="ai-hazard-analyse-btn"
          onClick={handleAnalyse}
          disabled={loading || notes.trim().length < 5}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[11px] font-bold flex items-center gap-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {loading ? (
            <><span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span> Analysing</>
          ) : (
            <><span className="material-symbols-outlined text-[13px]">auto_awesome</span> Analyse</>
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
      {loading && (
        <div className="h-12 bg-white/60 rounded-xl animate-pulse" />
      )}

      {/* Suggestion result */}
      {result && !loading && (
        <div className="flex flex-col gap-2.5">
          <div className="bg-white rounded-xl border border-violet-100 p-3 flex flex-col gap-2">
            {/* Category + severity row */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-violet-600">
                {categoryIcons[result.category] || 'warning'}
              </span>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">{result.category}</span>
                <span className="text-[10px] text-slate-500">{result.severity}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgencyColors[result.urgency] || 'bg-slate-100 text-slate-700'}`}>
                  {result.urgency.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Reasoning */}
            <p className="text-[10px] text-slate-500 italic border-t border-slate-100 pt-1.5">
              "{result.reasoning}"
            </p>
          </div>

          {/* Action buttons */}
          {!confirmed ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-xl bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition"
              >
                ✓ Use AI Suggestion
              </button>
              <button
                onClick={() => setResult(null)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition"
              >
                Override
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Category &amp; severity applied
            </div>
          )}
        </div>
      )}
    </div>
  );
};
