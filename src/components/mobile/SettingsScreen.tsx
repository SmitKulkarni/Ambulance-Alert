import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const SettingsScreen: React.FC = () => {
  const {
    alertRadius,
    setAlertRadius,
    setShowAboutModal,
    showNotificationToast,
  } = useSimulation();

  const [pushAlerts, setPushAlerts] = useState(true);
  const [language, setLanguage] = useState('en');

  const formatRadius = (val: number) => {
    return val >= 1000 ? `${(val / 1000).toFixed(1)}km` : `${val}m`;
  };

  const handleLogout = () => {
    showNotificationToast('Dispatch session terminated safely.');
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fadeIn pb-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 flex items-center gap-3.5 border border-[#e5eeff] shadow-xs">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm">
            JD
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-900 truncate">John Doe</h2>
          <p className="text-[11px] text-slate-500 truncate">Senior Dispatch Controller</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.2 rounded-full bg-[#eff4ff] text-slate-700 text-[10px] font-bold border border-[#dce9ff]">
              Corridor Alpha
            </span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              On Duty
            </span>
          </div>
        </div>

        <button
          onClick={() => showNotificationToast('Profile edit modal opened.')}
          className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-slate-700 hover:bg-[#dce9ff] transition-colors border border-[#dce9ff]"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      </div>

      {/* Operational Preferences Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Operational Preferences
        </h3>

        <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-slate-900 flex items-center justify-center border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Emergency Push Alerts</div>
                <div className="text-[10px] text-slate-500">Instant route preemption overrides</div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !pushAlerts;
                setPushAlerts(next);
                showNotificationToast(next ? 'Push alerts enabled' : 'Push alerts silenced');
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                pushAlerts ? 'bg-slate-950 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-xs"></div>
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Corridor Alert Radius Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-slate-900 flex items-center justify-center border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[18px]">radar</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Corridor Alert Radius</div>
                  <div className="text-[10px] text-slate-500">Proximity trigger threshold</div>
                </div>
              </div>

              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded">
                {formatRadius(alertRadius)}
              </span>
            </div>

            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={alertRadius}
              onChange={(e) => setAlertRadius(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
              <span>100m</span>
              <span>1km</span>
              <span>2km</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Interface Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-slate-900 flex items-center justify-center border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[18px]">language</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Interface Language</div>
                <div className="text-[10px] text-slate-500">Dispatch telemetry localization</div>
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                showNotificationToast(`Language set to ${e.target.options[e.target.selectedIndex].text}`);
              }}
              className="bg-[#eff4ff] border border-[#dce9ff] text-slate-900 text-xs font-bold py-1.5 px-2.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* System & Support Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          System & Support
        </h3>

        <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-xs overflow-hidden flex flex-col divide-y divide-slate-100 text-xs">
          <button
            onClick={() => showNotificationToast('Contacting 24/7 Municipal EMS Hotline: +1 (800) 555-AMBU')}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-slate-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">help</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">Help & Support</div>
                <div className="text-[10px] text-slate-500">Dispatcher manual & hotline</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>

          <button
            onClick={() => setShowAboutModal(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-slate-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">info</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">About AmbuAlert</div>
                <div className="text-[10px] text-slate-500">v4.8.2-stable (Build 9042)</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-slate-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">dns</span>
              </div>
              <div>
                <div className="font-bold text-slate-900">Server Node Connection</div>
                <div className="text-[10px] text-emerald-600 font-bold">Connected (US-East • 14ms)</div>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* Logout Session Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span>Log Out Session</span>
      </button>
    </div>
  );
};
