import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Logo } from './Logo';

export const AboutModal: React.FC = () => {
  const { showAboutModal, setShowAboutModal } = useSimulation();

  if (!showAboutModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 flex flex-col gap-4 animate-scaleUp">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <Logo size="sm" showText={true} />
          <button
            onClick={() => setShowAboutModal(false)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Mission-critical AI emergency traffic management & simulation platform designed for high-density municipal control centers and connected vehicle networks.
        </p>

        <div className="bg-[#eff4ff] p-3.5 rounded-2xl flex flex-col gap-2 text-xs border border-[#dce9ff]">
          <div className="flex justify-between">
            <span className="text-slate-500">Version</span>
            <span className="font-bold text-slate-900">4.8.2-stable (Build 9042)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">GIS Engine</span>
            <span className="font-bold text-slate-900">Mapbox GL v3.2 / Custom GIS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Security Protocol</span>
            <span className="font-bold text-slate-900">TLS 1.3 / FIPS 140-2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Algorithm</span>
            <span className="font-bold text-slate-900">Preemption Engine v2.4</span>
          </div>
        </div>

        <button
          onClick={() => setShowAboutModal(false)}
          className="w-full py-2.5 bg-slate-950 text-white font-bold text-xs rounded-xl hover:bg-slate-900 shadow-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
