import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { HomeTrackingScreen } from './HomeTrackingScreen';
import { AlertsScreen } from './AlertsScreen';
import { ReportHazardScreen } from './ReportHazardScreen';
import { EtaScreen } from './EtaScreen';
import { SettingsScreen } from './SettingsScreen';
import { Logo } from '../common/Logo';

export const MobileApp: React.FC = () => {
  const { activeMobileTab, setActiveMobileTab, isBroadcastActive, setShowAboutModal } =
    useSimulation();

  const tabTitles: Record<string, string> = {
    'home-tracking': 'Home Tracking',
    alerts: 'Alerts',
    'report-hazard': 'Report Hazard',
    eta: 'ETA & Signals',
    settings: 'Settings',
  };

  const navTabs = [
    { id: 'home-tracking', label: 'Tracking', icon: 'navigation' },
    { id: 'alerts', label: 'Alerts', icon: 'warning', badge: isBroadcastActive },
    { id: 'report-hazard', label: 'Report', icon: 'report' },
    { id: 'eta', label: 'ETA', icon: 'schedule' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full">
      {/* Smartphone Device Shell */}
      <div className="w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-4 border-slate-800 flex flex-col relative select-none">
        {/* Hardware Silent Switch & Volume button notches */}
        <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l"></div>
        <div className="absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l"></div>
        <div className="absolute -right-1 top-28 w-1 h-16 bg-slate-700 rounded-r"></div>

        {/* Screen Bezel & Display Window */}
        <div className="w-full h-full bg-[#f8f9ff] rounded-[38px] overflow-hidden flex flex-col relative">
          {/* iOS / Phone Status Bar with Dynamic Island */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-800 z-30 shrink-0 bg-[#f8f9ff]/90 backdrop-blur-md">
            <span>9:41</span>
            {/* Dynamic Island / Speaker Pill */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
              {isBroadcastActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[13px]">
              <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[14px]">wifi</span>
              <span className="material-symbols-outlined text-[16px]">battery_full</span>
            </div>
          </div>

          {/* App Header */}
          <header className="h-12 px-4 flex items-center justify-between border-b border-[#e5eeff] bg-white/80 backdrop-blur-md shrink-0 z-20">
            <div className="flex items-center gap-2">
              <Logo size="sm" showText={false} isPulsing={isBroadcastActive} />
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {tabTitles[activeMobileTab] || 'AmbuAlert'}
              </h1>
            </div>

            <button
              onClick={() => setShowAboutModal(true)}
              className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center hover:opacity-90"
              title="Profile / About"
            >
              <span className="material-symbols-outlined text-[15px]">person</span>
            </button>
          </header>

          {/* Scrollable Screen Content */}
          <main className="flex-1 overflow-y-auto relative">
            {activeMobileTab === 'home-tracking' && <HomeTrackingScreen />}
            {activeMobileTab === 'alerts' && <AlertsScreen />}
            {activeMobileTab === 'report-hazard' && <ReportHazardScreen />}
            {activeMobileTab === 'eta' && <EtaScreen />}
            {activeMobileTab === 'settings' && <SettingsScreen />}
          </main>

          {/* Bottom Mobile Tab Bar */}
          <nav className="h-16 bg-white/95 backdrop-blur-xl border-t border-[#e5eeff] flex items-center justify-around px-2 z-20 shrink-0">
            {navTabs.map((tab) => {
              const isActive = activeMobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMobileTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-red-600 font-bold bg-red-50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  <span className="text-[10px] tracking-tight">{tab.label}</span>

                  {tab.badge && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Home Indicator bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
