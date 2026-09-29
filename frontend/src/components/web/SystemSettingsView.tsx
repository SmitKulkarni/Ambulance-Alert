import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const SystemSettingsView: React.FC = () => {
  const { auditLogs, showNotificationToast } = useSimulation();

  const [gisRefreshRate, setGisRefreshRate] = useState('1000ms');
  const [telemetryEncryption, setTelemetryEncryption] = useState(true);
  const [automaticPreemption, setAutomaticPreemption] = useState(true);
  const [v2xBeaconFrequency, setV2xBeaconFrequency] = useState('10Hz');

  const handleSaveSettings = () => {
    showNotificationToast('System settings saved and applied across municipal cluster.');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs">
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span className="font-bold uppercase tracking-wider">System Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Settings & Real-Time Audit Log
          </h1>
          <p className="text-sm text-slate-600">
            Configure emergency preemption protocols, telemetry encryption, and inspect tamper-evident audit events.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-900">tune</span>
            <span>Preemption & Telemetry Controls</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]">
              <div>
                <p className="font-bold text-slate-900">Autonomous Green Wave Engagement</p>
                <p className="text-slate-500 text-[11px]">
                  Automatically switch downstream traffic signals to green when ambulance is within 500m
                </p>
              </div>
              <input
                type="checkbox"
                checked={automaticPreemption}
                onChange={(e) => setAutomaticPreemption(e.target.checked)}
                className="w-4 h-4 accent-slate-950 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]">
              <div>
                <p className="font-bold text-slate-900">V2X Radio & Telemetry Encryption</p>
                <p className="text-slate-500 text-[11px]">
                  AES-256 GCM encryption on all emergency broadcast frequencies
                </p>
              </div>
              <input
                type="checkbox"
                checked={telemetryEncryption}
                onChange={(e) => setTelemetryEncryption(e.target.checked)}
                className="w-4 h-4 accent-slate-950 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]">
              <div>
                <p className="font-bold text-slate-900">GIS Radar Refresh Rate</p>
                <p className="text-slate-500 text-[11px]">Frequency of IoT municipal sensor sync</p>
              </div>
              <select
                value={gisRefreshRate}
                onChange={(e) => setGisRefreshRate(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-lg border border-[#dce9ff] text-slate-900 font-medium outline-none cursor-pointer"
              >
                <option value="500ms">500 ms (High Performance)</option>
                <option value="1000ms">1000 ms (Standard)</option>
                <option value="2000ms">2000 ms (Low Bandwidth)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff]">
              <div>
                <p className="font-bold text-slate-900">V2X Beacon Transmission Frequency</p>
                <p className="text-slate-500 text-[11px]">Direct DSRC / C-V2X roadside pulse</p>
              </div>
              <select
                value={v2xBeaconFrequency}
                onChange={(e) => setV2xBeaconFrequency(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-lg border border-[#dce9ff] text-slate-900 font-medium outline-none cursor-pointer"
              >
                <option value="5Hz">5 Hz</option>
                <option value="10Hz">10 Hz (SAE J2735)</option>
                <option value="20Hz">20 Hz (High Frequency)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operational Server Status Panel (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-900">dns</span>
            <span>Cluster Health & Network Metrics</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff]">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Cluster</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">US-East (Zone 1)</span>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected (14ms latency)
              </span>
            </div>

            <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff]">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">IoT Municipal Nodes</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">486 Signals</span>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 mt-1">
                100% Operational
              </span>
            </div>

            <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff]">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">API Security</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">TLS 1.3 / FIPS 140-2</span>
              <span className="text-slate-500 font-medium text-[11px] mt-1 block">Certified</span>
            </div>

            <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff]">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Simulation Engine</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">v2.4 (Deterministic)</span>
              <span className="text-slate-500 font-medium text-[11px] mt-1 block">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table (FR-ADM-02) */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tamper-Evident System Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Immutable record of security events, preemption overrides, and configuration modifications.
            </p>
          </div>
          <span className="text-xs bg-[#eff4ff] text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-[#dce9ff]">
            Compliant with ISO 27001
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Actor</th>
                <th className="py-3 px-5">Action Event</th>
                <th className="py-3 px-5">Resource Target</th>
                <th className="py-3 px-5">Result</th>
                <th className="py-3 px-5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-5 font-bold text-slate-900">{log.actor}</td>
                  <td className="py-3 px-5">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-700">{log.resource}</td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-[11px] max-w-xs truncate">
                    {log.details}
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
