import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CorridorGisMap } from '../common/CorridorGisMap';

export const DashboardView: React.FC = () => {
  const {
    recentRuns,
    isBroadcastActive,
    toggleBroadcastOverride,
    setActiveWebTab,
    setShowResultsModal,
    showNotificationToast,
  } = useSimulation();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Welcome Banner & System Status */}
      <div className="bg-[#eff4ff] p-6 rounded-2xl border border-[#dce9ff] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-slate-950 text-white text-[11px] font-bold rounded-full tracking-wider uppercase">
              SYSTEM ACTIVE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ID: ADM-9021 • Municipal Traffic Control Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome, Admin</h1>
          <p className="text-sm text-slate-600">
            Emergency Traffic Management Dashboard — All corridors operating under AI preemption protocols.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">System Load</span>
            <span className="text-lg font-bold text-slate-900">14.2% Optimal</span>
          </div>
          <button
            onClick={toggleBroadcastOverride}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
              isBroadcastActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{isBroadcastActive ? 'Override Active' : 'Emergency Override'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Simulations */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Simulations
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-950">48</div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>12% vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Avg. Ambulance Travel Time */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Ambulance Travel Time
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-950">8.4 min</div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              <span>18% vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Time Saved (Alert vs Normal) */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Time Saved (Alert vs Normal)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-950">2.6 min</div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>24% vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Driver Response Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Driver Response Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-950">78%</div>
            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>15% vs last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Map & Simulation Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Corridor View (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[20px]">near_me</span>
              <h2 className="text-base font-bold text-slate-900">Live Corridor View</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#eff4ff] text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-[#dce9ff]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Central Corridor
              </span>
              <button
                onClick={() => setActiveWebTab('live-map')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Fullscreen GIS Map"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <CorridorGisMap heightClass="h-[380px]" showLayersControl={true} />
        </div>

        {/* Simulation Comparison Bar Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Simulation Comparison</h2>
              <span className="text-xs text-slate-400 font-medium">Live Test</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Normal traffic corridor baseline vs. AI advance preemption.
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-950 rounded-xs inline-block"></span>
                <span className="text-slate-700">Normal Traffic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block"></span>
                <span className="text-slate-700">With Advance Alerts</span>
              </div>
            </div>
          </div>

          {/* Precision Comparison Bar Graphic */}
          <div className="flex items-end justify-between gap-3 pt-6 pb-2 px-1 border-b border-slate-100">
            {/* Group 1: Travel Time */}
            <div className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs font-bold text-slate-900">12.8 / 8.4</span>
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  className="w-1/2 bg-slate-950 rounded-t-sm transition-all duration-500"
                  style={{ height: '100%' }}
                  title="Normal: 12.8 min"
                ></div>
                <div
                  className="w-1/2 bg-emerald-600 rounded-t-sm transition-all duration-500"
                  style={{ height: '65%' }}
                  title="With Alerts: 8.4 min"
                ></div>
              </div>
              <span className="text-[11px] text-slate-500 text-center font-medium mt-1">
                Travel Time (min)
              </span>
            </div>

            {/* Group 2: Clearance Time */}
            <div className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs font-bold text-slate-900">6.2 / 3.1</span>
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  className="w-1/2 bg-slate-950 rounded-t-sm transition-all duration-500"
                  style={{ height: '48%' }}
                  title="Normal: 6.2 min"
                ></div>
                <div
                  className="w-1/2 bg-emerald-600 rounded-t-sm transition-all duration-500"
                  style={{ height: '24%' }}
                  title="With Alerts: 3.1 min"
                ></div>
              </div>
              <span className="text-[11px] text-slate-500 text-center font-medium mt-1">
                Clearance Time
              </span>
            </div>

            {/* Group 3: Total Delay */}
            <div className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs font-bold text-slate-900">5.6 / 2.7</span>
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  className="w-1/2 bg-slate-950 rounded-t-sm transition-all duration-500"
                  style={{ height: '44%' }}
                  title="Normal: 5.6 min"
                ></div>
                <div
                  className="w-1/2 bg-emerald-600 rounded-t-sm transition-all duration-500"
                  style={{ height: '21%' }}
                  title="With Alerts: 2.7 min"
                ></div>
              </div>
              <span className="text-[11px] text-slate-500 text-center font-medium mt-1">
                Total Delay (min)
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-700 bg-[#eff4ff] p-3 rounded-xl flex items-center justify-between border border-[#dce9ff]">
            <span className="font-medium">AI Preemption Efficiency</span>
            <span className="font-bold text-emerald-700">+41.2% Faster</span>
          </div>
        </div>
      </div>

      {/* Recent Simulations Table */}
      <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Simulations</h2>
            <p className="text-xs text-slate-500">Real-time execution log of traffic corridor runs.</p>
          </div>
          <button
            onClick={() => setActiveWebTab('reports')}
            className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>View All Logs</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created At</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">{run.id}</td>
                  <td className="py-3 px-3 text-slate-800">{run.route}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        run.mode === 'Advance Alert'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {run.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        run.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : run.status === 'Running'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{run.createdAt}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setShowResultsModal(true)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                        title="View KPI Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() =>
                          showNotificationToast(`Exporting snapshot for ${run.id} (PDF)...`)
                        }
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                        title="Download Run Data"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
