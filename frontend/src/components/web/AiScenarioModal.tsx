/**
 * src/components/web/AiScenarioModal.tsx
 * ----------------------------------------
 * Phase 2.3 — AI Scenario Generator modal.
 * User types a natural language description → Gemini generates a full Scenario.
 * Shows preview with parameters before saving to the scenario library.
 */

import React, { useState } from 'react';
import { aiApi, GeneratedScenarioResponse, ApiError } from '../../utils/api';
import { Scenario } from '@shared/types';

interface Props {
  onSave: (scenario: Scenario) => void;
  onClose: () => void;
}

const EXAMPLES = [
  'Rush hour cardiac arrest on a busy downtown highway with heavy traffic',
  'Late night accident on a suburban arterial road, moderate traffic, hospital 4km away',
  'Flash mob causing obstruction near a shopping district during peak hours',
  'Multi-vehicle collision on a bridge approach with critical weather conditions',
];

const densityColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const AiScenarioModal: React.FC<Props> = ({ onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedScenarioResponse | null>(null);

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError('Please enter at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiApi.generateScenario(description.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Scenario generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const scenario: Scenario = {
      ...result.scenario,
      status: 'Draft',
      createdAt: new Date().toLocaleString(),
    };
    onSave(scenario);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="px-6 py-5 border-b border-[#e5eeff] bg-gradient-to-r from-violet-50 to-blue-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Generate Scenario with AI</h2>
              <p className="text-[11px] text-slate-500">Describe a scenario in plain language — Gemini will configure it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg hover:bg-white/70 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Describe the scenario
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(null); }}
              placeholder="e.g. Rush hour cardiac arrest on a busy downtown highway with heavy traffic and limited alternate routes…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#dce9ff] text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick examples:</span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setDescription(ex); setError(null); }}
                    className="text-[11px] px-2.5 py-1 bg-[#eff4ff] border border-[#dce9ff] text-slate-600 rounded-lg hover:bg-white hover:border-violet-300 transition"
                  >
                    {ex.slice(0, 45)}…
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-violet-600 font-semibold">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Gemini is generating your scenario…
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Generated scenario preview */}
          {result && !loading && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <h3 className="text-sm font-bold text-slate-900">Generated Scenario Preview</h3>
              </div>

              <div className="bg-[#eff4ff] rounded-2xl border border-[#dce9ff] p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#0b1c30] leading-tight">{result.scenario.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${densityColors[result.scenario.trafficDensity]}`}>
                    {result.scenario.trafficDensity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{result.scenario.routeProfile}</p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'From', value: result.scenario.startNode, icon: 'location_on' },
                    { label: 'To', value: result.scenario.destinationNode, icon: 'local_hospital' },
                    { label: 'Alert Radius', value: `${result.scenario.alertRadius}m`, icon: 'cell_tower' },
                    { label: 'Speed', value: `${result.scenario.ambulanceSpeed} km/h`, icon: 'speed' },
                    { label: 'Driver Compliance', value: `${result.scenario.driverCompliance}%`, icon: 'people' },
                    { label: 'Seed', value: String(result.scenario.seed), icon: 'tag' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white rounded-xl px-3 py-2 border border-[#dce9ff] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">{icon}</span>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">{label}</span>
                        <span className="text-xs font-bold text-slate-800 leading-tight">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Reasoning */}
                <div className="bg-white rounded-xl border border-violet-100 p-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-violet-500 flex-shrink-0 mt-0.5">psychology</span>
                  <p className="text-[11px] text-slate-600 italic">{result.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-[#e5eeff] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#dce9ff] text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={() => { setResult(null); setDescription(''); }}
                className="px-4 py-2 rounded-xl border border-[#dce9ff] text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Regenerate
              </button>
            )}
            <button
              id="ai-scenario-generate-btn"
              onClick={result ? handleSave : handleGenerate}
              disabled={loading || (!result && description.trim().length < 10)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {result ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save to Library
                </>
              ) : loading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Generating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  Generate Scenario
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
