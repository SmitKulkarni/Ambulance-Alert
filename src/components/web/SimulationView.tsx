import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CorridorGisMap } from '../common/CorridorGisMap';

export const SimulationView: React.FC = () => {
  const {
    scenarioName,
    setScenarioName,
    alertRadius,
    setAlertRadius,
    driverCompliance,
    setDriverCompliance,
    ambulanceSpeed,
    setAmbulanceSpeed,
    trafficDensity,
    setTrafficDensity,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    isSimRunning,
    simProgress,
    showNotificationToast,
    setShowResultsModal,
  } = useSimulation();

  const [isRunningLocal, setIsRunningLocal] = useState(false);
  const [localProgress, setLocalProgress] = useState(45);

  const handleRunSimulation = () => {
    setIsRunningLocal(true);
    startSimulation();
    showNotificationToast('Initiating corridor preemption sequence...');

    // Progress tick
    let p = 45;
    const interval = setInterval(() => {
      p += 12;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsRunningLocal(false);
          setShowResultsModal(true);
          showNotificationToast(
            'Simulation successfully executed! Clearance efficiency improved by 41.2%.'
          );
        }, 600);
      }
      setLocalProgress(p);
    }, 450);
  };

  const handleAbort = () => {
    setIsRunningLocal(false);
    pauseSimulation();
    showNotificationToast('Simulation aborted by operator.');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#eff4ff] p-6 rounded-2xl border border-[#dce9ff] gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Simulation Engine v2.4
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Simulation Configuration & Run Management
          </h1>
          <p className="text-sm text-slate-600">
            Configure parameters, test corridor preemption algorithms, and evaluate real-time emergency routing performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAlertRadius(750);
              setDriverCompliance(85);
              setAmbulanceSpeed(70);
              setTrafficDensity('high');
              showNotificationToast('Loaded Preset: Rush-Hour Major Artery (750m / 85% compliance)');
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Load Preset</span>
          </button>
          <button
            onClick={() => {
              showNotificationToast(`Configuration snapshot for "${scenarioName}" saved to database.`);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-950 text-[20px]">tune</span>
                <span>General Parameters</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-slate-700 text-[11px] font-semibold border border-[#dce9ff]">
                Active Profile
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* Scenario Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="bg-[#eff4ff] px-3.5 py-2 rounded-xl text-sm text-slate-900 outline-none border border-[#dce9ff] focus:border-slate-800"
                />
              </div>

              {/* Alert Radius */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Alert Radius (meters)</label>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {alertRadius} m
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={alertRadius}
                  onChange={(e) => setAlertRadius(Number(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>100m</span>
                  <span>1000m</span>
                  <span>2000m</span>
                </div>
              </div>

              {/* Driver Compliance Rate */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Driver Compliance Rate (%)</label>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {driverCompliance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={driverCompliance}
                  onChange={(e) => setDriverCompliance(Number(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% (Low)</span>
                  <span>50%</span>
                  <span>100% (Strict)</span>
                </div>
              </div>

              {/* Ambulance Speed */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Ambulance Speed (km/h)</label>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {ambulanceSpeed} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="5"
                  value={ambulanceSpeed}
                  onChange={(e) => setAmbulanceSpeed(Number(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20 km/h</span>
                  <span>60 km/h</span>
                  <span>120 km/h</span>
                </div>
              </div>

              {/* Traffic Density */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Traffic Density</label>
                <select
                  value={trafficDensity}
                  onChange={(e) =>
                    setTrafficDensity(e.target.value as 'low' | 'medium' | 'high' | 'critical')
                  }
                  className="bg-[#eff4ff] px-3.5 py-2 rounded-xl text-sm text-slate-900 outline-none border border-[#dce9ff] focus:border-slate-800 cursor-pointer"
                >
                  <option value="low">Low (Off-peak flow)</option>
                  <option value="medium">Medium (Standard Urban Flow)</option>
                  <option value="high">High (Rush Hour Peak)</option>
                  <option value="critical">Critical Gridlock</option>
                </select>
              </div>
            </div>

            {/* Run Simulation Button & Execution Progress State */}
            <div className="flex flex-col gap-3 pt-2">
              {!isRunningLocal ? (
                <button
                  onClick={handleRunSimulation}
                  className="w-full py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>Run Simulation</span>
                </button>
              ) : (
                <div className="flex flex-col bg-[#eff4ff] p-4 rounded-xl gap-2.5 border border-[#dce9ff] animate-fadeIn">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                      <span>Executing Corridor Preemption...</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">{localProgress}%</span>
                  </div>

                  <div className="w-full bg-[#dce9ff] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-950 h-full rounded-full transition-all duration-300"
                      style={{ width: `${localProgress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>
                      Node {Math.min(9, Math.ceil((localProgress / 100) * 9))} / 9 Cleared
                    </span>
                    <button
                      onClick={handleAbort}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Abort / Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">Estimated Travel</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1">4.2 min</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                <span>-34% vs normal</span>
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">Signal Preempts</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1">12 Nodes</span>
              <span className="text-xs font-semibold text-blue-600 mt-1">
                Corridor Green Wave
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map Preview & Live Telemetry (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-[20px]">map</span>
                <h2 className="text-base font-bold text-slate-900">
                  Route Preview & Geofence Matrix
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>Live Radar Active</span>
              </span>
            </div>

            {/* Simulated GIS Canvas */}
            <div className="flex-1 min-h-[460px]">
              <CorridorGisMap heightClass="h-full min-h-[460px]" showLayersControl={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Historical Simulation Runs Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Simulation Runs</h3>
            <p className="text-xs text-slate-500">Audit-backed reproducible test executions.</p>
          </div>
          <button
            onClick={() => setShowResultsModal(true)}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>Open Comparison Modal</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">SIM ID</th>
                <th className="py-2.5 px-3">Route Profile</th>
                <th className="py-2.5 px-3">Alert Radius</th>
                <th className="py-2.5 px-3">Compliance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-900">SIM-4091</td>
                <td className="py-3 px-3 text-slate-800">City Center → Hospital</td>
                <td className="py-3 px-3">500 m</td>
                <td className="py-3 px-3">70%</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Completed
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => setShowResultsModal(true)}
                    className="text-slate-500 hover:text-slate-950 p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-900">SIM-4090</td>
                <td className="py-3 px-3 text-slate-800">East Zone → Trauma Center</td>
                <td className="py-3 px-3">750 m</td>
                <td className="py-3 px-3">85%</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Completed
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => setShowResultsModal(true)}
                    className="text-slate-500 hover:text-slate-950 p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
