import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const HomeTrackingScreen: React.FC = () => {
  const { setActiveMobileTab, showNotificationToast, addHazardReport } = useSimulation();

  // Modal State for Quick Hazard Reporting
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    'Accident' | 'Road Obstruction' | 'Flooding' | 'Stalled EMS'
  >('Accident');
  const [severityLevel, setSeverityLevel] = useState<
    'Minor Delay' | 'Lane Restricted' | 'Critical Blocking'
  >('Critical Blocking');
  const [notes, setNotes] = useState('');
  const [isGpsRefreshing, setIsGpsRefreshing] = useState(false);
  const [autoTaggedLocation, setAutoTaggedLocation] = useState({
    street: 'Riverside Blvd & 5th Ave (Corridor Km 4.2)',
    coordinates: '34.0522° N, -118.2437° W',
    accuracy: '±3.2m High Precision',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      id: 'Accident',
      label: 'Accident',
      desc: 'Collision / lanes blocked',
      icon: 'car_crash',
      color: 'bg-red-100 text-red-700',
    },
    {
      id: 'Road Obstruction',
      label: 'Obstruction',
      desc: 'Debris, fallen tree, pothole',
      icon: 'construction',
      color: 'bg-slate-100 text-slate-800',
    },
    {
      id: 'Stalled EMS',
      label: 'Stalled EMS',
      desc: 'Ambulance or rescue vehicle',
      icon: 'emergency',
      color: 'bg-red-600 text-white',
    },
    {
      id: 'Flooding',
      label: 'Flooding',
      desc: 'Standing water on roadway',
      icon: 'flood',
      color: 'bg-blue-100 text-blue-800',
    },
  ] as const;

  const handleRefreshGps = () => {
    setIsGpsRefreshing(true);
    showNotificationToast('Re-scanning GNSS satellite constellation for high-precision lock...');
    setTimeout(() => {
      setAutoTaggedLocation({
        street: 'Broadway & 42nd St (Near Node #402)',
        coordinates: '34.0531° N, -118.2415° W',
        accuracy: '±1.8m RTK Calibrated',
      });
      setIsGpsRefreshing(false);
      showNotificationToast('GPS Location calibrated and auto-tagged.');
    }, 800);
  };

  const handleHazardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addHazardReport({
        category: selectedCategory,
        locationName: autoTaggedLocation.street,
        coordinates: autoTaggedLocation.coordinates,
        severity: severityLevel,
        notes: notes || `${selectedCategory} detected along municipal transit route.`,
        hasPhoto: true,
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      setNotes('');
      showNotificationToast(`Hazard Reported: ${selectedCategory} broadcast to preemption grid!`);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-5 p-4 animate-fadeIn pb-20 relative min-h-full">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#131b2e] text-white p-5 shadow-md">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-red-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[11px] font-bold w-fit border border-red-500/30">
            <span className="material-symbols-outlined text-[16px]">emergency</span>
            <span>Live Traffic Preemption Active</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight leading-snug">
            Help ambulances reach faster with real-time traffic alerts
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Monitor emergency vehicle corridors, optimize municipal signal timings, and reduce critical response latency across the city grid.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => {
                setActiveMobileTab('alerts');
                showNotificationToast('Active corridor telemetry engaged.');
              }}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-red-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">navigation</span>
              <span>Get Started</span>
            </button>

            <button
              onClick={() => {
                setActiveMobileTab('settings');
                showNotificationToast('Logged in as verified motorist.');
              }}
              className="w-full bg-white/10 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/15 active:scale-95 transition-all border border-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>I already have an account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Corridor Telemetry Preview Card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Active Corridor Telemetry</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>Live Feed</span>
          </span>
        </div>

        <div
          onClick={() => setActiveMobileTab('alerts')}
          className="w-full h-44 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-end p-4 cursor-pointer bg-slate-900 group"
        >
          {/* Stylized vector map backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
            style={{
              backgroundImage: `radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)`,
            }}
          >
            {/* Grid street lines */}
            <svg className="w-full h-full opacity-40">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#38bdf8" strokeWidth="3" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#ef4444" strokeWidth="4" />
              <line x1="60" y1="0" x2="60" y2="200" stroke="#64748b" strokeWidth="2" />
              <line
                x1="220"
                y1="0"
                x2="220"
                y2="200"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              <circle cx="220" cy="110" r="10" fill="#ef4444" className="animate-ping" />
              <circle cx="220" cy="110" r="6" fill="#ef4444" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <div className="relative z-10 flex items-center justify-between text-white">
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Route #A-402
              </p>
              <p className="text-sm font-bold text-white">St. Jude's Hospital to Central Hub</p>
            </div>
            <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Priority 1
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">Avg Clearance</span>
            <span className="material-symbols-outlined text-[18px] text-red-600">timer</span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">-4.2m</span>
            <p className="text-[11px] text-slate-500 font-medium">Faster than standard</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">Active Units</span>
            <span className="material-symbols-outlined text-[18px] text-slate-900">ambulance</span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">24</span>
            <p className="text-[11px] text-slate-500 font-medium">Corridors cleared</p>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900">System Status</h3>
          <span className="text-[11px] text-emerald-600 font-bold">All Nodes Normal</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Signal Preemption Node #8B</p>
              <p className="text-[10px] text-slate-500 truncate">
                Automatic clearance sequence engaged
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">AI Traffic Model Synced</p>
              <p className="text-[10px] text-slate-500 truncate">Updated 2m ago</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              OK
            </span>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (FAB) FOR QUICK HAZARD REPORTING */}
      <div className="sticky bottom-2 right-2 self-end z-30 pointer-events-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white pl-3.5 pr-4 py-3 rounded-full shadow-[0_8px_25px_rgba(220,38,38,0.45)] border border-red-500 transition-all cursor-pointer"
          title="Report Traffic Hazard"
        >
          {/* Pulsing ring aura */}
          <span className="absolute -inset-1 rounded-full bg-red-600 opacity-40 animate-ping pointer-events-none"></span>

          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">
            add_alert
          </span>
          <span className="text-xs font-bold tracking-tight">Report Hazard</span>
        </button>
      </div>

      {/* MODAL FORM: REPORT TRAFFIC HAZARDS WITH AUTO-LOCATION TAGGING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col gap-4 animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Report Corridor Hazard
                  </h3>
                  <p className="text-[10px] text-slate-500">Auto-location tagged • AI Grid sync</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* GPS Auto-Tagging Card */}
            <div className="p-3 bg-[#eff4ff] rounded-2xl border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <span
                    className={`material-symbols-outlined text-[16px] text-emerald-600 ${
                      isGpsRefreshing ? 'animate-spin' : ''
                    }`}
                  >
                    my_location
                  </span>
                  <span>Location Auto-Tagged</span>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshGps}
                  className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[12px]">refresh</span>
                  <span>Re-scan</span>
                </button>
              </div>

              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-900 truncate">
                  {autoTaggedLocation.street}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono">{autoTaggedLocation.coordinates}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {autoTaggedLocation.accuracy}
                  </span>
                </div>
              </div>
            </div>

            {/* Hazard Category Selection */}
            <form onSubmit={handleHazardSubmit} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Select Incident Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-red-50 border-red-600 shadow-xs ring-1 ring-red-400'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {cat.icon}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">{cat.label}</span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Degree Buttons */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Obstruction Severity
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Minor Delay', 'Lane Restricted', 'Critical Blocking'] as const).map(
                    (level) => {
                      const isSelected = severityLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSeverityLevel(level)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                            isSelected
                              ? level === 'Critical Blocking'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Description / Quick Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Left and center lane blocked, glass on road..."
                  className="w-full p-2.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-slate-900 outline-none focus:border-slate-800 text-xs"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      sync
                    </span>
                    <span>Broadcasting to AI Corridor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Submit & Broadcast to AI Grid</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
