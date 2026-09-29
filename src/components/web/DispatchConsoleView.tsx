import React, { useEffect, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export const DispatchConsoleView: React.FC = () => {
  const {
    isPTTActive,
    togglePTT,
    selectedZone,
    setSelectedZone,
    corridorOverrides,
    toggleCorridorOverride,
    distressCalls,
    toggleDistressAudio,
    dispatchDistressUnit,
    showNotificationToast,
  } = useSimulation();

  // Waveform animation bar heights
  const [waveHeights, setWaveHeights] = useState<number[]>([
    12, 24, 16, 32, 20, 40, 48, 28, 16, 36, 24, 48, 56, 32, 20, 40, 28, 16, 24, 12,
  ]);

  useEffect(() => {
    if (!isPTTActive) {
      setWaveHeights((prev) => prev.map(() => 14));
      return;
    }

    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 48) + 10)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPTTActive]);

  const zones = ['North Corridor', 'Metro Center', 'Eastside Exp.', 'All Zones (All-Call)'];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-fadeIn">
      {/* Subheader & Telemetry Metrics */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
              LIVE BROADCAST ACTIVE
            </span>
            <span className="text-slate-500 text-xs font-semibold">SECURE CHANNEL #9</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch & Voice Command Console</h1>
          <p className="text-sm text-slate-600">
            Real-time emergency audio broadcast, corridor clearance preemption, and active routing override.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#e5eeff] flex items-center gap-3 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                ACTIVE UNITS
              </span>
              <span className="text-sm font-black text-slate-900">24 Deployed</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#e5eeff] flex items-center gap-3 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                PREEMPTION LATENCY
              </span>
              <span className="text-sm font-black text-slate-900">42ms</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-slate-800 flex items-center justify-center border border-[#dce9ff]">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Voice Broadcast & Corridor Controls (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Live Audio Broadcast Console */}
          <div className="bg-[#eff4ff] rounded-2xl p-6 border border-[#dce9ff] flex flex-col gap-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Live Audio Broadcast Console</h2>
                  <p className="text-xs text-slate-500">
                    Direct multi-zone emergency frequency transmission
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-[#dce9ff] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span className="text-[11px] font-bold text-slate-700">ENCRYPTED 256-BIT</span>
              </div>
            </div>

            {/* Zone Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                BROADCAST ZONE SELECTOR
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => {
                      setSelectedZone(zone);
                      showNotificationToast(`Broadcast frequency switched to ${zone}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center ${
                      selectedZone === zone
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#dce9ff]'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {/* Waveform Monitor & PTT Area */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 border border-[#dce9ff] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
                  <span>TRANSMISSION WAVEFORM MONITOR</span>
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isPTTActive ? 'text-red-600 animate-pulse' : 'text-slate-400'
                  }`}
                >
                  {isPTTActive ? 'STATUS: BROADCASTING LIVE' : 'STATUS: STANDBY'}
                </span>
              </div>

              {/* Waveform visualizer */}
              <div className="h-20 flex items-center justify-center gap-1.5 px-4 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isPTTActive ? 'bg-red-600' : 'bg-slate-300'
                    }`}
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>

              {/* PTT Control Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[18px] text-slate-700">info</span>
                  <span>Click to toggle Push-To-Talk broadcast override.</span>
                </div>

                <button
                  onClick={togglePTT}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                    isPTTActive
                      ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-200'
                      : 'bg-slate-950 text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPTTActive ? 'mic' : 'mic_none'}
                  </span>
                  <span>{isPTTActive ? 'TRANSMITTING...' : 'PUSH TO TALK'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Action Corridor Clearance Toggles */}
          <div className="bg-[#eff4ff] rounded-2xl p-6 border border-[#dce9ff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[18px]">traffic</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corridor Clearance Preemption Toggles
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant green-wave corridor override matrix
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-700 font-bold hover:underline cursor-pointer">
                Configure Matrix
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Corridor 1 */}
              <div className="bg-white rounded-xl p-4 flex flex-col justify-between gap-3 border border-[#dce9ff] shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CORRIDOR 01</span>
                    <h4 className="text-xs font-bold text-slate-900">Route 9 North Artery</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-bold">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Signals: 14/14</span>
                  <span className="text-emerald-600 font-bold">100% Clear</span>
                </div>
                <button
                  onClick={() => toggleCorridorOverride('Route 9')}
                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-between px-3 transition-colors ${
                    corridorOverrides['Route 9']
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>Preempt Override</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {corridorOverrides['Route 9'] ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              </div>

              {/* Corridor 2 */}
              <div className="bg-white rounded-xl p-4 flex flex-col justify-between gap-3 border border-[#dce9ff] shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CORRIDOR 02</span>
                    <h4 className="text-xs font-bold text-slate-900">Metro Downtown</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-bold">
                    OVERRIDE
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Signals: 22/26</span>
                  <span className="text-red-600 font-bold">Clearing (84%)</span>
                </div>
                <button
                  onClick={() => toggleCorridorOverride('Metro Downtown')}
                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-between px-3 transition-colors ${
                    corridorOverrides['Metro Downtown']
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>Preempt Override</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {corridorOverrides['Metro Downtown'] ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              </div>

              {/* Corridor 3 */}
              <div className="bg-white rounded-xl p-4 flex flex-col justify-between gap-3 border border-[#dce9ff] shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">CORRIDOR 03</span>
                    <h4 className="text-xs font-bold text-slate-900">Eastside Express</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                    STANDBY
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Signals: 0/18</span>
                  <span className="text-slate-600 font-bold">Normal Flow</span>
                </div>
                <button
                  onClick={() => toggleCorridorOverride('Eastside Express')}
                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-between px-3 transition-colors ${
                    corridorOverrides['Eastside Express']
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>Preempt Override</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {corridorOverrides['Eastside Express'] ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Routing Override Queue & Distress Call Log (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Emergency Vehicle Routing Queue */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Emergency Vehicle Routing Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active priority assignments & GPS adjustments
                  </p>
                </div>
              </div>
              <span className="bg-red-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                3 Active
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Item 1 */}
              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex items-center justify-between border border-[#dce9ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs">
                    AMB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Unit 104 - ALS</h4>
                      <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.2 rounded">
                        Priority 1
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Intersect: 5th & Grand Ave</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-mono">02:14 ETA</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Green Wave Locked
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex items-center justify-between border border-[#dce9ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                    RES
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Rescue Squad 12</h4>
                      <span className="text-[10px] text-slate-600 font-bold bg-slate-200 px-1.5 py-0.2 rounded">
                        Priority 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Intersect: Broadway & 14th</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-mono">04:50 ETA</span>
                  <span className="text-[11px] text-slate-500">Approaching</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-[#eff4ff] p-3.5 rounded-xl flex items-center justify-between border border-[#dce9ff]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                    MED
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Medic Unit 08</h4>
                      <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.2 rounded">
                        Priority 1
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Intersect: State St Overpass</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-mono">01:05 ETA</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Green Wave Locked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Incoming Distress Call Log with Audio Playback */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-slate-900 flex items-center justify-center border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Incoming Distress Call Log</h3>
                  <p className="text-xs text-slate-500">AI-transcribed audio streams & recordings</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Live Feed</span>
            </div>

            <div className="flex flex-col gap-3">
              {distressCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-[#eff4ff] p-3.5 rounded-xl flex flex-col gap-2 border border-[#dce9ff]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          call.status === 'Active' ? 'bg-red-600' : 'bg-slate-400'
                        }`}
                      ></span>
                      <span className="font-bold text-slate-900">{call.caller}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{call.timeAgo}</span>
                  </div>

                  <p className="text-xs text-slate-600 italic">"{call.summary}"</p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDistressAudio(call.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all ${
                          call.isAudioPlaying ? 'bg-red-600' : 'bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {call.isAudioPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            call.isAudioPlaying ? 'bg-red-600 w-3/4 animate-pulse' : 'bg-slate-400 w-1/3'
                          }`}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {call.audioDuration}
                      </span>
                    </div>

                    <button
                      onClick={() => dispatchDistressUnit(call.id)}
                      className={`text-xs font-bold hover:underline ${
                        call.status === 'Dispatched' ? 'text-slate-400' : 'text-blue-700'
                      }`}
                      disabled={call.status === 'Dispatched'}
                    >
                      {call.status === 'Dispatched' ? 'Dispatched ✓' : 'Dispatch Unit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
