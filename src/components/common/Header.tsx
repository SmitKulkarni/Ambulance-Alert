import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    isBroadcastActive,
    toggleBroadcastOverride,
    soundMuted,
    setSoundMuted,
    lastNotification,
    showNotificationToast,
  } = useSimulation();

  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, title: 'Preemption Tier 1 Active', time: '1m ago', type: 'alert' },
    { id: 2, title: 'Corridor KA-01-AB-1234 Cleared', time: '4m ago', type: 'info' },
    { id: 3, title: 'New Hazard Report on I-95 North', time: '8m ago', type: 'warning' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showNotificationToast(`Filtering view for "${searchQuery}"...`);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#e5eeff] px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-[#eff4ff] px-3.5 py-1.5 rounded-xl w-72 lg:w-96 border border-[#dce9ff]/60 focus-within:border-slate-800 transition-colors">
        <span className="material-symbols-outlined text-[#76777d] text-[20px]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search corridors, signals, units..."
          className="bg-transparent border-none outline-none text-sm w-full text-[#0b1c30] placeholder:text-[#76777d]"
        />
      </form>

      {/* Center Toast Banner (if any active) */}
      {lastNotification && (
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span>{lastNotification}</span>
        </div>
      )}

      {/* Right Controls: View Switcher, Mute, Override, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Experience Mode Switcher (Dual View, Admin Only, Mobile Only) */}
        <div className="flex items-center bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'dual'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Split Dual View (Admin + Mobile App side by side)"
          >
            <span className="material-symbols-outlined text-[15px]">view_column</span>
            <span className="hidden sm:inline">Dual View</span>
          </button>
          <button
            onClick={() => setViewMode('web')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'web'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Desktop Admin Console Only"
          >
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span className="hidden sm:inline">Admin Web</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'mobile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Motorist Mobile App Only"
          >
            <span className="material-symbols-outlined text-[15px]">smartphone</span>
            <span className="hidden sm:inline">Mobile App</span>
          </button>
        </div>

        {/* Audio Sound Toggle */}
        <button
          onClick={() => setSoundMuted(!soundMuted)}
          className={`p-2 rounded-xl border transition-all ${
            soundMuted
              ? 'border-slate-200 text-slate-400 bg-slate-100'
              : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
          title={soundMuted ? 'Unmute Dispatch Audio' : 'Mute Dispatch Audio'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {soundMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>

        {/* Emergency Override Button */}
        <button
          onClick={toggleBroadcastOverride}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
            isBroadcastActive
              ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400/40'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isBroadcastActive ? 'warning' : 'bolt'}
          </span>
          <span>{isBroadcastActive ? 'Override Active' : 'Emergency Override'}</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-[#eff4ff] hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-800">Operational Alerts</span>
                <span className="text-[10px] text-slate-400">Live Grid</span>
              </div>
              <div className="divide-y divide-slate-100 mt-1 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 flex items-start gap-2 hover:bg-slate-50 rounded px-1 cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Admin Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-[#eff4ff] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden md:flex flex-col text-left text-xs leading-tight">
              <span className="font-semibold text-slate-900">Admin</span>
              <span className="text-[10px] text-slate-500">System Controller</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">John Doe</p>
                <p className="text-slate-400 text-[10px]">admin@ambualert.gov</p>
              </div>
              <button
                onClick={() => {
                  showNotificationToast('Logged in as Municipal Traffic Control Center');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                <span>Security Credentials</span>
              </button>
              <button
                onClick={() => {
                  showNotificationToast('Session locked. Re-authentication active.');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Log Out Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
