import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Scenario } from '@shared/types';
import { AiScenarioModal } from './AiScenarioModal';

export const ScenariosView: React.FC = () => {
  const {
    scenariosList,
    addScenario,
    setScenarioName,
    setAlertRadius,
    setDriverCompliance,
    setAmbulanceSpeed,
    setTrafficDensity,
    setActiveWebTab,
    showNotificationToast,
  } = useSimulation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [newScen, setNewScen] = useState<Partial<Scenario>>({
    name: 'Westside Medical Express Corridor',
    routeProfile: 'West Downtown Arterial',
    startNode: 'Node W2',
    destinationNode: 'Node H (Hospital)',
    alertRadius: 600,
    driverCompliance: 80,
    ambulanceSpeed: 65,
    trafficDensity: 'medium',
    status: 'Draft',
  });

  const handleDuplicate = (sc: Scenario) => {
    const copy: Scenario = {
      ...sc,
      id: `sc-${Date.now()}`,
      name: `${sc.name} (Copy)`,
      status: 'Draft',
      createdAt: 'Just now',
      seed: Math.floor(Math.random() * 90000) + 10000,
    };
    addScenario(copy);
  };

  const handleLoadAndRun = (sc: Scenario) => {
    setScenarioName(sc.name);
    setAlertRadius(sc.alertRadius);
    setDriverCompliance(sc.driverCompliance);
    setAmbulanceSpeed(sc.ambulanceSpeed);
    setTrafficDensity(sc.trafficDensity);
    setActiveWebTab('simulation');
    showNotificationToast(`Loaded scenario: ${sc.name}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScen.name) return;

    const created: Scenario = {
      id: `sc-${Date.now()}`,
      name: newScen.name,
      routeProfile: newScen.routeProfile || 'Custom Route Profile',
      startNode: newScen.startNode || 'Node A',
      destinationNode: newScen.destinationNode || 'Node H',
      alertRadius: Number(newScen.alertRadius) || 500,
      driverCompliance: Number(newScen.driverCompliance) || 75,
      ambulanceSpeed: Number(newScen.ambulanceSpeed) || 60,
      trafficDensity: (newScen.trafficDensity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
      status: 'Queued',
      createdAt: 'Just now',
      seed: Math.floor(Math.random() * 90000) + 10000,
    };

    addScenario(created);
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs">
            <span className="material-symbols-outlined text-[16px]">route</span>
            <span className="font-bold uppercase tracking-wider">Scenario Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scenario Library & Experiment Snapshots
          </h1>
          <p className="text-sm text-slate-600">
            Create, duplicate, and execute repeatable deterministic emergency corridor simulation runs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="ai-generate-scenario-btn"
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Generate with AI</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Scenario</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenariosList.map((sc) => (
          <div
            key={sc.id}
            className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-[#eff4ff] text-slate-700 px-2 py-0.5 rounded border border-[#dce9ff]">
                  Seed: #{sc.seed || 48921}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sc.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sc.status === 'Running'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sc.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{sc.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{sc.routeProfile}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Alert Radius</span>
                  <span className="font-bold text-slate-800">{sc.alertRadius}m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Driver Compliance</span>
                  <span className="font-bold text-slate-800">{sc.driverCompliance}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Speed</span>
                  <span className="font-bold text-slate-800">{sc.ambulanceSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Traffic Density</span>
                  <span className="font-bold text-slate-800 capitalize">{sc.trafficDensity}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleLoadAndRun(sc)}
                className="flex-1 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Run / Edit</span>
              </button>
              <button
                onClick={() => handleDuplicate(sc)}
                className="p-2 rounded-xl bg-[#eff4ff] text-slate-700 hover:bg-[#dce9ff] transition-colors border border-[#dce9ff]"
                title="Duplicate Scenario (FR-SCN-07)"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Define New Simulation Scenario</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scenario Name</label>
                <input
                  type="text"
                  required
                  value={newScen.name}
                  onChange={(e) => setNewScen({ ...newScen, name: e.target.value })}
                  className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Route Corridor Profile</label>
                <input
                  type="text"
                  value={newScen.routeProfile}
                  onChange={(e) => setNewScen({ ...newScen, routeProfile: e.target.value })}
                  className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alert Radius (meters)</label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={newScen.alertRadius}
                    onChange={(e) => setNewScen({ ...newScen, alertRadius: Number(e.target.value) })}
                    className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Compliance Rate (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={newScen.driverCompliance}
                    onChange={(e) =>
                      setNewScen({ ...newScen, driverCompliance: Number(e.target.value) })
                    }
                    className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ambulance Speed (km/h)</label>
                  <input
                    type="number"
                    min="20"
                    max="120"
                    value={newScen.ambulanceSpeed}
                    onChange={(e) =>
                      setNewScen({ ...newScen, ambulanceSpeed: Number(e.target.value) })
                    }
                    className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Traffic Density</label>
                  <select
                    value={newScen.trafficDensity}
                    onChange={(e) =>
                      setNewScen({
                        ...newScen,
                        trafficDensity: e.target.value as 'low' | 'medium' | 'high' | 'critical',
                      })
                    }
                    className="w-full bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] text-sm text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-900 shadow-sm"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Scenario Generator Modal — Phase 2.3 */}
      {showAiModal && (
        <AiScenarioModal
          onSave={(scenario) => {
            addScenario(scenario);
            showNotificationToast(`AI-generated scenario "${scenario.name}" added to library.`);
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
};
