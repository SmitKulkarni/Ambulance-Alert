import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const ReportsView: React.FC = () => {
  const { showNotificationToast } = useSimulation();
  const [activeTab, setActiveTab] = useState<'metrics' | 'comparison' | 'audit'>('metrics');
  const [reportFilter, setReportFilter] = useState('');

  const reports = [
    {
      id: 'rep-1',
      name: 'Simulation Report - City Center',
      type: 'PDF',
      typeColor: 'bg-red-100 text-red-800',
      icon: 'picture_as_pdf',
      iconColor: 'text-red-600',
      date: '10 Apr 2025, 14:32',
      size: '2.4 MB',
    },
    {
      id: 'rep-2',
      name: 'Corridor Performance Report',
      type: 'PDF',
      typeColor: 'bg-red-100 text-red-800',
      icon: 'picture_as_pdf',
      iconColor: 'text-red-600',
      date: '09 Apr 2025, 09:15',
      size: '4.1 MB',
    },
    {
      id: 'rep-3',
      name: 'Driver Response Analysis',
      type: 'EXCEL',
      typeColor: 'bg-emerald-100 text-emerald-800',
      icon: 'table_chart',
      iconColor: 'text-emerald-600',
      date: '08 Apr 2025, 08:00',
      size: '1.8 MB',
    },
    {
      id: 'rep-4',
      name: 'System Usage Report',
      type: 'PDF',
      typeColor: 'bg-red-100 text-red-800',
      icon: 'picture_as_pdf',
      iconColor: 'text-red-600',
      date: '07 Apr 2025, 07:30',
      size: '850 KB',
    },
    {
      id: 'rep-5',
      name: 'Historical Data Export',
      type: 'CSV',
      typeColor: 'bg-amber-100 text-amber-800',
      icon: 'csv',
      iconColor: 'text-amber-600',
      date: '06 Apr 2025, 06:00',
      size: '12.6 MB',
    },
  ];

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(reportFilter.toLowerCase())
  );

  const handleDownload = (name: string, type: string) => {
    showNotificationToast(`Downloading ${name} (${type})...`);
    // Simulated instant file download
    const blob = new Blob([`AmbuAlert Corridor Data Export\nReport: ${name}\nGenerated: ${new Date().toISOString()}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.${type.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Top Bar / Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span className="font-bold uppercase tracking-wider">System Intelligence</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Analytics & Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Performance Analytics & Generated Reports
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 border border-slate-200 transition-all shadow-xs">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>Last 7 Days</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <button
            onClick={() => handleDownload('AmbuAlert_Full_Report_Bundle', 'PDF')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export All Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#dce9ff] text-xs font-semibold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'metrics'
              ? 'border-slate-950 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">show_chart</span>
          <span>Performance Metrics</span>
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'comparison'
              ? 'border-slate-950 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          <span>Comparison Analysis</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-slate-950 text-slate-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          <span>System Logs & Audit</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Simulations
            </span>
            <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[18px]">science</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">48</span>
            <span className="text-xs text-emerald-600 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +12%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg. Ambulance Travel Time
            </span>
            <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">8.4 min</span>
            <span className="text-xs text-emerald-600 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> -18%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Time Saved (Alert vs Normal)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">2.6 min</span>
            <span className="text-xs text-emerald-600 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +24%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Improvement Rate
            </span>
            <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">22%</span>
            <span className="text-xs text-emerald-600 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +4.5%
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart & Efficiency Breakdown Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Travel Time Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ambulance Travel Time Trend</h2>
              <p className="text-xs text-slate-500">
                Comparing Normal Traffic vs. With Advance Alerts across operational hours
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span className="text-slate-500">Normal Traffic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-950"></span>
                <span className="text-slate-900">With Alerts</span>
              </div>
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div className="relative h-64 w-full flex items-end pt-8 pb-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-slate-200 w-full"></div>
              <div className="border-b border-slate-200 w-full"></div>
              <div className="border-b border-slate-200 w-full"></div>
              <div className="border-b border-slate-200 w-full"></div>
            </div>

            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 600 200"
            >
              {/* Normal Traffic Line (Dashed) */}
              <path
                d="M 20,60 Q 150,90 280,70 T 450,40 T 580,70"
                fill="none"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth="2.5"
              />
              {/* With Alerts Line (Solid Black) */}
              <path
                d="M 20,110 Q 150,140 280,150 T 450,165 T 580,175"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3.5"
              />
              {/* Interactive Data Points */}
              <circle cx="150" cy="140" r="5" fill="#0f172a" className="cursor-pointer hover:scale-150 transition-transform" />
              <circle cx="280" cy="150" r="5" fill="#0f172a" className="cursor-pointer hover:scale-150 transition-transform" />
              <circle cx="450" cy="165" r="5" fill="#0f172a" className="cursor-pointer hover:scale-150 transition-transform" />
            </svg>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 font-mono px-2">
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
              <span>12:00</span>
              <span>13:00</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak congestion hours show maximum time delta (up to 4.2 min saved).</span>
            <span
              onClick={() => showNotificationToast('Detailed statistical interval breakdown loaded.')}
              className="text-slate-900 font-bold cursor-pointer hover:underline"
            >
              View detailed data breakdown →
            </span>
          </div>
        </div>

        {/* Corridor Efficiency Panel (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Corridor Efficiency</h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time signal preemption success rates across active municipal sectors.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">City Center Corridor</span>
                  <span className="font-bold text-emerald-600">96.4%</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-950 h-full rounded-full" style={{ width: '96.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">North Expressway Route</span>
                  <span className="font-bold text-emerald-600">91.8%</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-950 h-full rounded-full" style={{ width: '91.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">East-West Arterial</span>
                  <span className="font-bold text-emerald-600">88.2%</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-950 h-full rounded-full" style={{ width: '88.2%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#eff4ff] flex items-center gap-3 border border-[#dce9ff]">
            <span className="material-symbols-outlined text-slate-900 text-[22px]">verified</span>
            <div className="text-xs">
              <p className="font-bold text-slate-900">AI Model Confidence: High</p>
              <p className="text-slate-500 text-[11px]">
                Calibrated on 1,420 historical emergency dispatches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated System Reports Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Generated System Reports</h2>
            <p className="text-xs text-slate-500">
              Exportable audit trails, simulation summaries, and driver response analytics.
            </p>
          </div>

          <div className="flex items-center bg-[#eff4ff] px-3.5 py-1.5 rounded-xl w-64 border border-[#dce9ff]">
            <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">search</span>
            <input
              type="text"
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              placeholder="Filter reports..."
              className="bg-transparent border-none outline-none text-xs w-full text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-5">Report Name</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Generated On</th>
                <th className="py-3 px-5">File Size</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className={`material-symbols-outlined text-[20px] ${report.iconColor}`}>
                      {report.icon}
                    </span>
                    <span>{report.name}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.typeColor}`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500">{report.date}</td>
                  <td className="py-3 px-5 text-slate-500">{report.size}</td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => handleDownload(report.name, report.type)}
                      className="text-slate-900 hover:underline font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Simulation Disclaimer Footer */}
        <div className="p-4 bg-[#eff4ff] border-t border-[#dce9ff] flex items-start gap-3 text-xs text-slate-600">
          <span className="material-symbols-outlined text-[20px] text-slate-900 shrink-0 mt-0.5">
            info
          </span>
          <div>
            <span className="font-bold text-slate-900">Official Simulation Disclaimer:</span> All
            telemetry, travel time reductions, and clearance metrics are generated via real-time AI
            predictive models combined with municipal IoT sensor feeds. Actual emergency dispatch
            times may vary based on environmental conditions and driver compliance rates.
          </div>
        </div>
      </div>
    </div>
  );
};
