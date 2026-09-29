import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AiHazardSuggestion } from './AiHazardSuggestion';

export const ReportHazardScreen: React.FC = () => {
  const { addHazardReport, showNotificationToast, setActiveMobileTab } = useSimulation();

  const [category, setCategory] = useState<
    'Accident' | 'Road Obstruction' | 'Flooding' | 'Stalled EMS'
  >('Accident');
  const [severityLevel, setSeverityLevel] = useState<number>(3); // 1 = Minor, 2 = Lane, 3 = Critical
  const [notes, setNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    {
      id: 'Accident',
      title: 'Accident',
      desc: 'Collision / Blocking lanes',
      icon: 'car_crash',
      color: 'bg-red-100 text-red-700',
    },
    {
      id: 'Road Obstruction',
      title: 'Road Obstruction',
      desc: 'Debris, pothole, tree',
      icon: 'construction',
      color: 'bg-slate-100 text-slate-800',
    },
    {
      id: 'Flooding',
      title: 'Flooding',
      desc: 'Standing water / flash flood',
      icon: 'flood',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'Stalled EMS',
      title: 'Stalled EMS',
      desc: 'Ambulance or fire truck stuck',
      icon: 'emergency',
      color: 'bg-red-600 text-white',
    },
  ] as const;

  const severityLabels: Record<number, { label: string; class: string }> = {
    1: { label: 'Minor Delay', class: 'bg-slate-100 text-slate-700' },
    2: { label: 'Lane Restricted', class: 'bg-amber-100 text-amber-800' },
    3: { label: 'Critical Blocking', class: 'bg-red-100 text-red-800' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      const severityMap: Record<number, 'Minor Delay' | 'Lane Restricted' | 'Critical Blocking'> = {
        1: 'Minor Delay',
        2: 'Lane Restricted',
        3: 'Critical Blocking',
      };

      addHazardReport({
        category,
        locationName: 'I-95 North, Mile Marker 42.5',
        coordinates: '34.0522° N, -118.2437° W',
        severity: severityMap[severityLevel] || 'Critical Blocking',
        notes: notes || 'Obstruction reported on active emergency corridor.',
        hasPhoto,
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setActiveMobileTab('alerts');
      }, 1800);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fadeIn pb-8">
      {/* Top Banner */}
      <div className="bg-[#eff4ff] rounded-2xl p-4 flex items-center justify-between border border-[#dce9ff] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Report Corridor Hazard</h2>
            <p className="text-[10px] text-slate-500">Instant AI routing preemption feed</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 text-[10px] font-bold flex items-center gap-1.5 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span>Live Grid</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            Select Incident Category
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all active:scale-98 ${
                    isSelected
                      ? 'bg-white border-red-600 shadow-sm'
                      : 'bg-white border-transparent hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${cat.color}`}>
                    <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{cat.title}</span>
                  <span className="text-[10px] text-slate-500">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Precise Location Tag with Tactical GIS View */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800">Precise Location Tag</label>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] animate-spin">my_location</span>
              <span>GPS Locked</span>
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-sm h-32 bg-slate-900 border border-slate-200">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 60% 50%, #1e293b 0%, #0b1322 100%)',
              }}
            >
              <svg className="w-full h-full opacity-40">
                <line x1="0" y1="64" x2="400" y2="64" stroke="#ef4444" strokeWidth="4" />
                <line x1="200" y1="0" x2="200" y2="130" stroke="#3b82f6" strokeWidth="3" />
                <circle cx="200" cy="64" r="14" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
                <circle cx="200" cy="64" r="8" fill="#ef4444" />
              </svg>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[20px] text-red-500">
                  location_on
                </span>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    I-95 North, Mile Marker 42.5
                  </p>
                  <p className="text-[10px] text-slate-300">Lat: 34.0522° N, Long: -118.2437° W</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Slider */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800">Estimated Severity Level</label>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                severityLabels[severityLevel]?.class
              }`}
            >
              {severityLabels[severityLevel]?.label}
            </span>
          </div>

          <p className="text-[10px] text-slate-500">Slide to indicate traffic obstruction degree</p>

          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={severityLevel}
            onChange={(e) => setSeverityLevel(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />

          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
            <span>Minor Delay</span>
            <span>Lane Restricted</span>
            <span>Total Gridlock</span>
          </div>
        </div>

        {/* Visual Evidence Photo Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Visual Evidence (Optional)
          </label>
          <div
            onClick={() => {
              setHasPhoto(!hasPhoto);
              showNotificationToast(
                hasPhoto ? 'Photo removed' : 'Photo uploaded. AI scanning vehicle plates & obstacles.'
              );
            }}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
              hasPhoto
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-[20px]">
                {hasPhoto ? 'check_circle' : 'add_a_photo'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800">
              {hasPhoto ? 'Photo Attached (AI Scanned)' : 'Tap to capture or upload photo'}
            </p>
            <p className="text-[10px] text-slate-500">
              AI automatically scans license plates & obstacles
            </p>
          </div>
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Incident Description / Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Two vehicles collided in center lane, minor debris scattered..."
            className="w-full bg-[#eff4ff] p-3 rounded-2xl text-xs text-slate-900 border border-[#dce9ff] outline-none focus:border-slate-800"
          />
        </div>

        {/* AI Hazard Categorization — Phase 2.2 */}
        {notes.trim().length >= 5 && (
          <AiHazardSuggestion
            notes={notes}
            coordinates="34.0522° N, -118.2437° W"
            onConfirm={(aiCategory, aiSeverity) => {
              // Auto-fill category from AI suggestion
              const validCats = ['Accident', 'Road Obstruction', 'Flooding', 'Stalled EMS'];
              if (validCats.includes(aiCategory)) {
                setCategory(aiCategory as typeof category);
              }
              // Map severity string back to slider number
              const sevMap: Record<string, number> = {
                'Minor Delay': 1,
                'Lane Restricted': 2,
                'Critical Blocking': 3,
              };
              if (sevMap[aiSeverity]) setSeverityLevel(sevMap[aiSeverity]);
              showNotificationToast(`AI set: ${aiCategory} — ${aiSeverity}`);
            }}
          />
        )}

        {/* Prominent Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isSubmitted}
          className={`w-full py-4 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all ${
            isSubmitted
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>Broadcasting to AI Grid...</span>
            </>
          ) : isSubmitted ? (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Incident Broadcasted Successfully!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Submit Incident to AI Grid</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-500 -mt-2">
          Instant broadcast to regional traffic light preemption algorithms.
        </p>
      </form>
    </div>
  );
};
