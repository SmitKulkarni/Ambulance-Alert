import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { activeWebTab, setActiveWebTab, isBroadcastActive } = useSimulation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'simulation', label: 'Simulation', icon: 'science' },
    { id: 'live-map', label: 'Live Map', icon: 'map', badge: isBroadcastActive ? 'Active' : undefined },
    { id: 'dispatch-console', label: 'Dispatch & Voice Console', icon: 'headset_mic', badge: 'Live' },
    { id: 'scenarios', label: 'Scenarios', icon: 'route' },
    { id: 'reports', label: 'Reports', icon: 'description' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'users-and-roles', label: 'Users & Roles', icon: 'group' },
    { id: 'system-settings', label: 'System Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 bg-[#eff4ff] border-r border-[#dce9ff] flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#dce9ff]/60 flex items-center justify-between">
        <Logo size="md" showText={true} isPulsing={isBroadcastActive} />
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeWebTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveWebTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-slate-950 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-[#dce9ff]/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.badge === 'Active'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[#dce9ff]/80 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ADM
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Admin Console</span>
            <span className="text-[10px] text-slate-500 truncate">System Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
