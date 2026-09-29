import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/web/DashboardView';
import { SimulationView } from './components/web/SimulationView';
import { LiveMapView } from './components/web/LiveMapView';
import { DispatchConsoleView } from './components/web/DispatchConsoleView';
import { ScenariosView } from './components/web/ScenariosView';
import { ReportsView } from './components/web/ReportsView';
import { UsersRolesView } from './components/web/UsersRolesView';
import { SystemSettingsView } from './components/web/SystemSettingsView';
import { MobileApp } from './components/mobile/MobileApp';
import { SimulationResultsModal } from './components/mobile/SimulationResultsModal';
import { AboutModal } from './components/common/AboutModal';
import { Logo } from './components/common/Logo';

const MainLayout: React.FC = () => {
  const { viewMode, activeWebTab } = useSimulation();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-['Inter',sans-serif]">
      {/* Top Brand Banner matching Image 1 Header */}
      <div className="bg-white border-b border-[#e5eeff] px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="lg" showText={true} />
          <div className="hidden md:block pl-3 border-l border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              Smarter Alerts. Faster Ambulances. Safer Communities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 bg-[#eff4ff] px-3 py-1 rounded-full border border-[#dce9ff]">
            AI-Powered Emergency Traffic Management & Simulation Platform
          </span>
        </div>
      </div>

      {/* Global Operational Header */}
      <Header />

      {/* App Body Container based on viewMode */}
      {viewMode === 'web' && (
        <div className="flex-1 flex min-h-[calc(100vh-112px)]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#f8f9ff]">
            {activeWebTab === 'dashboard' && <DashboardView />}
            {activeWebTab === 'simulation' && <SimulationView />}
            {activeWebTab === 'live-map' && <LiveMapView />}
            {activeWebTab === 'dispatch-console' && <DispatchConsoleView />}
            {activeWebTab === 'scenarios' && <ScenariosView />}
            {activeWebTab === 'reports' && <ReportsView />}
            {activeWebTab === 'analytics' && <ReportsView />}
            {activeWebTab === 'users-and-roles' && <UsersRolesView />}
            {activeWebTab === 'system-settings' && <SystemSettingsView />}
          </main>
        </div>
      )}

      {viewMode === 'mobile' && (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f4fc]">
          <MobileApp />
        </div>
      )}

      {viewMode === 'dual' && (
        <div className="flex-1 p-4 lg:p-6 max-w-[1780px] mx-auto w-full">
          {/* Dual Experience Headers */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Web Application (8 Cols in Dual View) */}
            <div className="xl:col-span-8 flex flex-col bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Web Application (Admin & Authoritative Roles)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Dashboard, simulation management, analytics, reports and system controls.
                    </p>
                  </div>
                </div>

                {/* Inline Quick Tab Switcher for Web in Dual Mode */}
                <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-[#dce9ff]">
                  <NavTabButton tab="dashboard" label="Dashboard" icon="dashboard" />
                  <NavTabButton tab="simulation" label="Simulation" icon="science" />
                  <NavTabButton tab="live-map" label="Live Map" icon="map" />
                  <NavTabButton tab="dispatch-console" label="Dispatch" icon="headset_mic" />
                  <NavTabButton tab="reports" label="Reports" icon="description" />
                </div>
              </div>

              {/* Scrollable Web Sub-content */}
              <div className="max-h-[820px] overflow-y-auto bg-[#f8f9ff]">
                {activeWebTab === 'dashboard' && <DashboardView />}
                {activeWebTab === 'simulation' && <SimulationView />}
                {activeWebTab === 'live-map' && <LiveMapView />}
                {activeWebTab === 'dispatch-console' && <DispatchConsoleView />}
                {activeWebTab === 'scenarios' && <ScenariosView />}
                {activeWebTab === 'reports' && <ReportsView />}
                {activeWebTab === 'analytics' && <ReportsView />}
                {activeWebTab === 'users-and-roles' && <UsersRolesView />}
                {activeWebTab === 'system-settings' && <SystemSettingsView />}
              </div>
            </div>

            {/* Right Column: Mobile Application (4 Cols in Dual View) */}
            <div className="xl:col-span-4 flex flex-col bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">smartphone</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Mobile Application (Normal Users / Customers)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Real-time alerts, ambulance tracking, and safety information.
                  </p>
                </div>
              </div>

              {/* Mobile Device Mockup */}
              <div className="p-3 bg-[#f0f4fc] flex items-center justify-center">
                <MobileApp />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <SimulationResultsModal />
      <AboutModal />
    </div>
  );
};

const NavTabButton: React.FC<{ tab: string; label: string; icon: string }> = ({
  tab,
  label,
  icon,
}) => {
  const { activeWebTab, setActiveWebTab } = useSimulation();
  const isActive = activeWebTab === tab;

  return (
    <button
      onClick={() => setActiveWebTab(tab)}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
        isActive ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <span className="material-symbols-outlined text-[15px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// ─── Auth Gate ────────────────────────────────────────────────────────────────
// Shows a loading spinner while checking the stored token,
// then routes to LoginView or the main app based on auth state.
const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center font-['Inter',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[40px] text-red-600 animate-pulse">local_hospital</span>
          <p className="text-sm text-slate-500 font-medium">Loading AmbuAlert…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <SimulationProvider>
      <MainLayout />
    </SimulationProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
