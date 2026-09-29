import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Scenario,
  SimulationRun,
  PreemptionNode,
  HazardReport,
  DistressCall,
  UserAccount,
  SystemAuditLog
} from '@shared/types';
import { soundManager } from '../utils/audio';

interface SimulationContextType {
  // Navigation & View Mode
  viewMode: 'dual' | 'web' | 'mobile';
  setViewMode: (mode: 'dual' | 'web' | 'mobile') => void;
  activeWebTab: string;
  setActiveWebTab: (tab: string) => void;
  activeMobileTab: string;
  setActiveMobileTab: (tab: string) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;

  // Active Scenario Configuration
  scenarioName: string;
  setScenarioName: (name: string) => void;
  alertRadius: number; // in meters (100 to 2000)
  setAlertRadius: (r: number) => void;
  driverCompliance: number; // 10 to 100%
  setDriverCompliance: (c: number) => void;
  ambulanceSpeed: number; // 20 to 120 km/h
  setAmbulanceSpeed: (s: number) => void;
  trafficDensity: 'low' | 'medium' | 'high' | 'critical';
  setTrafficDensity: (d: 'low' | 'medium' | 'high' | 'critical') => void;

  // Simulation Execution State
  isSimRunning: boolean;
  simProgress: number; // 0 to 100%
  simSpeedMultiplier: 1 | 2 | 5;
  setSimSpeedMultiplier: (speed: 1 | 2 | 5) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;

  // Active Corridor & Ambulance Telemetry
  corridorId: string;
  ambulanceId: string;
  currentStreet: string;
  distanceRemainingKm: number;
  etaMinutes: number;
  etaSeconds: number;
  ambulanceProgressPercent: number;

  // Advance Alert Broadcast State
  isBroadcastActive: boolean;
  toggleBroadcastOverride: () => void;
  resendBroadcastAlert: () => void;
  alertCountdownSec: number;
  connectedMotorists: number;
  broadcastMessage: string;

  // Signal Preemption Nodes
  preemptionNodes: PreemptionNode[];
  triggerSignalOverride: (nodeId?: string) => void;

  // Dispatch & Voice Console
  isPTTActive: boolean;
  togglePTT: () => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  corridorOverrides: { [key: string]: boolean };
  toggleCorridorOverride: (corridorName: string) => void;
  distressCalls: DistressCall[];
  toggleDistressAudio: (callId: string) => void;
  dispatchDistressUnit: (callId: string) => void;

  // Hazard Reports (Mobile <-> Admin synchronization)
  hazards: HazardReport[];
  addHazardReport: (hazard: Omit<HazardReport, 'id' | 'timestamp' | 'status'>) => void;

  // Historical Runs & Analytics Data
  recentRuns: SimulationRun[];
  scenariosList: Scenario[];
  addScenario: (scenario: Scenario) => void;
  usersList: UserAccount[];
  auditLogs: SystemAuditLog[];

  // Modals & UI States
  showResultsModal: boolean;
  setShowResultsModal: (show: boolean) => void;
  showAboutModal: boolean;
  setShowAboutModal: (show: boolean) => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;

  // Toast / System alert notification
  lastNotification: string | null;
  showNotificationToast: (msg: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & View
  const [viewMode, setViewMode] = useState<'dual' | 'web' | 'mobile'>('dual');
  const [activeWebTab, setActiveWebTab] = useState<string>('dashboard');
  const [activeMobileTab, setActiveMobileTab] = useState<string>('home-tracking');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Scenario config
  const [scenarioName, setScenarioName] = useState('City Center to Hospital');
  const [alertRadius, setAlertRadius] = useState<number>(500);
  const [driverCompliance, setDriverCompliance] = useState<number>(70);
  const [ambulanceSpeed, setAmbulanceSpeed] = useState<number>(60);
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Simulation execution
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(55);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<1 | 2 | 5>(1);

  // Corridor Telemetry
  const corridorId = 'Corridor KA-01-AB-1234';
  const ambulanceId = 'KA-01-AB-1234';
  const [currentStreet, setCurrentStreet] = useState('Riverside Blvd (Km 4.2)');
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(2.8);
  const [etaMinutes, setEtaMinutes] = useState(8);
  const [etaSeconds, setEtaSeconds] = useState(18);
  const [ambulanceProgressPercent, setAmbulanceProgressPercent] = useState(65);

  // Advance Alert state
  const [isBroadcastActive, setIsBroadcastActive] = useState<boolean>(true);
  const [alertCountdownSec, setAlertCountdownSec] = useState<number>(165); // 02:45
  const [connectedMotorists] = useState<number>(1420);
  const [broadcastMessage] = useState(
    'Ambulance approaching in your area. Please move to the side and give way.'
  );

  // Audio & Toast
  const [soundMuted, setSoundMuted] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Signal Preemption Nodes
  const [preemptionNodes, setPreemptionNodes] = useState<PreemptionNode[]>([
    {
      id: 'node-402',
      code: 'Node #402',
      name: 'Riverside Blvd',
      status: 'Preempted',
      distanceMeters: 350,
      etaSeconds: 45,
      phase: 'Red',
      countdownSec: 18,
    },
    {
      id: 'node-403',
      code: 'Node #403',
      name: 'Central Ave',
      status: 'Green Wave',
      distanceMeters: 850,
      etaSeconds: 120,
      phase: 'Green',
      countdownSec: 52,
    },
    {
      id: 'node-404',
      code: 'Node #404',
      name: 'Market Street',
      status: 'Green Wave',
      distanceMeters: 1400,
      etaSeconds: 240,
      phase: 'Green',
      countdownSec: 75,
    },
    {
      id: 'node-405',
      code: 'Node #405',
      name: 'Park Junction',
      status: 'Green Wave',
      distanceMeters: 2100,
      etaSeconds: 360,
      phase: 'Green',
      countdownSec: 120,
    },
    {
      id: 'node-406',
      code: 'Node #406',
      name: 'Hospital Gate',
      status: 'Standby',
      distanceMeters: 2800,
      etaSeconds: 480,
      phase: 'Green',
      countdownSec: 180,
    },
  ]);

  // Dispatch & Voice Console
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState('North Corridor');
  const [corridorOverrides, setCorridorOverrides] = useState<{ [key: string]: boolean }>({
    'Route 9': true,
    'Metro Downtown': true,
    'Eastside Express': false,
  });

  const [distressCalls, setDistressCalls] = useState<DistressCall[]>([
    {
      id: 'call-9021',
      caller: 'Caller #9021 - Cardiac Arrest',
      incidentType: 'Priority 1 Medical',
      summary: 'Patient unresponsive at 442 Maple Street, cross street 5th...',
      timeAgo: '12s ago',
      audioDuration: '0:14 / 0:42',
      status: 'Active',
      isAudioPlaying: false,
    },
    {
      id: 'call-9020',
      caller: 'Caller #9020 - MVA Collision',
      incidentType: 'Traffic Trauma',
      summary: 'Two vehicles involved, minor injuries, blocking right lane...',
      timeAgo: '3m ago',
      audioDuration: '0:08 / 0:30',
      status: 'Active',
      isAudioPlaying: false,
    },
    {
      id: 'call-9018',
      caller: 'Caller #9018 - Severe Respiratory',
      incidentType: 'Priority 1 Medical',
      summary: 'Asthma attack with hypoxia at Central Park pavilion entrance...',
      timeAgo: '7m ago',
      audioDuration: '0:19 / 0:35',
      status: 'Dispatched',
      isAudioPlaying: false,
    },
  ]);

  // Hazards Reported
  const [hazards, setHazards] = useState<HazardReport[]>([
    {
      id: 'haz-1',
      category: 'Accident',
      locationName: 'I-95 North, Mile Marker 42.5',
      coordinates: '34.0522° N, -118.2437° W',
      severity: 'Critical Blocking',
      notes: 'Two vehicles collided in center lane, minor debris scattered across arterial route.',
      timestamp: 'Just now',
      hasPhoto: true,
      status: 'Active',
    },
    {
      id: 'haz-2',
      category: 'Road Obstruction',
      locationName: 'Market Street at 4th Ave',
      coordinates: '34.0510° N, -118.2490° W',
      severity: 'Lane Restricted',
      notes: 'Construction barrier fallen into right corridor lane.',
      timestamp: '14m ago',
      hasPhoto: false,
      status: 'Active',
    },
  ]);

  // Historical Runs
  const [recentRuns] = useState<SimulationRun[]>([
    {
      id: 'SIM-001',
      scenarioId: 'sc-1',
      name: 'City Center to Hospital',
      route: 'City Center → Hospital',
      mode: 'Advance Alert',
      status: 'Completed',
      createdAt: '10 Apr 2025, 14:32',
      travelTimeMin: 8.4,
      clearanceTimeMin: 3.1,
      totalDelayMin: 2.7,
      timeSavedMin: 4.4,
      timeSavedPercent: 34.4,
      driverResponseRate: 78,
      alertRadius: 500,
      complianceRate: 70,
    },
    {
      id: 'SIM-002',
      scenarioId: 'sc-2',
      name: 'East Zone to Hospital',
      route: 'East Zone → Hospital',
      mode: 'Normal Traffic',
      status: 'Completed',
      createdAt: '10 Apr 2025, 11:20',
      travelTimeMin: 12.8,
      clearanceTimeMin: 6.2,
      totalDelayMin: 5.6,
      timeSavedMin: 0,
      timeSavedPercent: 0,
      driverResponseRate: 24,
      alertRadius: 0,
      complianceRate: 0,
    },
    {
      id: 'SIM-003',
      scenarioId: 'sc-3',
      name: 'West Zone to Hospital',
      route: 'West Zone → Hospital',
      mode: 'Advance Alert',
      status: 'Running',
      createdAt: '10 Apr 2025, 09:15',
      travelTimeMin: 9.1,
      clearanceTimeMin: 3.5,
      totalDelayMin: 3.0,
      timeSavedMin: 3.7,
      timeSavedPercent: 28.9,
      driverResponseRate: 82,
      alertRadius: 600,
      complianceRate: 75,
    },
    {
      id: 'SIM-004',
      scenarioId: 'sc-4',
      name: 'North Zone to Hospital',
      route: 'North Zone → Hospital',
      mode: 'Normal Traffic',
      status: 'Completed',
      createdAt: '09 Apr 2025, 17:48',
      travelTimeMin: 13.5,
      clearanceTimeMin: 6.8,
      totalDelayMin: 6.1,
      timeSavedMin: 0,
      timeSavedPercent: 0,
      driverResponseRate: 20,
      alertRadius: 0,
      complianceRate: 0,
    },
  ]);

  // Scenarios List
  const [scenariosList, setScenariosList] = useState<Scenario[]>([
    {
      id: 'sc-1',
      name: 'City Center to Hospital',
      routeProfile: 'Metropolitan Downtown Corridor, Sector 4',
      startNode: 'Node A (City Center)',
      destinationNode: 'Node H (General Hospital)',
      alertRadius: 500,
      driverCompliance: 70,
      ambulanceSpeed: 60,
      trafficDensity: 'medium',
      status: 'Completed',
      createdAt: '10 Apr 2025, 14:32',
      seed: 48921,
    },
    {
      id: 'sc-2',
      name: 'East Zone to Trauma Center',
      routeProfile: 'Eastside Expressway & Cross-town Arterial',
      startNode: 'Node E1 (East Depot)',
      destinationNode: 'Node T3 (Regional Trauma Center)',
      alertRadius: 750,
      driverCompliance: 85,
      ambulanceSpeed: 75,
      trafficDensity: 'high',
      status: 'Completed',
      createdAt: '10 Apr 2025, 11:20',
      seed: 81920,
    },
    {
      id: 'sc-3',
      name: 'North Expressway Rush Hour',
      routeProfile: 'I-95 Northern Spur into Downtown',
      startNode: 'Node N9 (Spur 12)',
      destinationNode: 'Node H1 (St. Jude Memorial)',
      alertRadius: 600,
      driverCompliance: 65,
      ambulanceSpeed: 50,
      trafficDensity: 'critical',
      status: 'Running',
      createdAt: '10 Apr 2025, 09:15',
      seed: 12048,
    },
  ]);

  // Users & Roles
  const [usersList] = useState<UserAccount[]>([
    {
      id: 'usr-1',
      name: 'John Doe',
      email: 'john.doe@ambualert.gov',
      role: 'System Admin',
      department: 'Municipal Traffic Control Center',
      status: 'Active',
      lastActive: 'Just now',
    },
    {
      id: 'usr-2',
      name: 'Sarah Connor',
      email: 's.connor@cityems.org',
      role: 'Emergency Planner',
      department: 'EMS Rapid Response Division',
      status: 'Active',
      lastActive: '4m ago',
    },
    {
      id: 'usr-3',
      name: 'Dr. Marcus Vance',
      email: 'm.vance@transit-lab.edu',
      role: 'Transportation Researcher',
      department: 'Smart Mobility Institute',
      status: 'Active',
      lastActive: '2h ago',
    },
    {
      id: 'usr-4',
      name: 'Elena Rostova',
      email: 'e.rostova@metro.gov',
      role: 'Traffic Analyst',
      department: 'Corridor Optimization Unit',
      status: 'Active',
      lastActive: '1d ago',
    },
  ]);

  // System Audit Logs
  const [auditLogs] = useState<SystemAuditLog[]>([
    {
      id: 'log-1',
      actor: 'John Doe (System Admin)',
      action: 'PREEMPTION_BROADCAST_TRIGGERED',
      resource: 'Corridor KA-01-AB-1234',
      timestamp: '10 Apr 2025, 14:32:04',
      status: 'SUCCESS',
      details: 'Broadcast 500m preemption geofence to 1,420 connected motorists.',
    },
    {
      id: 'log-2',
      actor: 'System Autonomous AI',
      action: 'SIGNAL_GREEN_WAVE_LOCKED',
      resource: 'Node #403, #404, #405',
      timestamp: '10 Apr 2025, 14:31:40',
      status: 'SUCCESS',
      details: 'Phase timing shifted +25s green lead for emergency vehicle priority.',
    },
    {
      id: 'log-3',
      actor: 'Sarah Connor (Planner)',
      action: 'SCENARIO_CONFIG_SAVED',
      resource: 'City Center to Hospital v2.4',
      timestamp: '10 Apr 2025, 14:28:11',
      status: 'SUCCESS',
      details: 'Updated alert radius from 400m to 500m; compliance parameter set to 70%.',
    },
  ]);

  // Modals
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const showNotificationToast = (msg: string) => {
    setLastNotification(msg);
    soundManager.playNotification();
    setTimeout(() => {
      setLastNotification((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Timer loop for active simulation countdown & progress
  useEffect(() => {
    if (!isSimRunning) return;

    const interval = setInterval(() => {
      // Countdown for alert
      setAlertCountdownSec((prev) => {
        if (prev <= 1) return 165; // loop simulation window
        return prev - 1;
      });

      // Countdown for next signal J-12
      setEtaSeconds((prev) => {
        if (prev <= 1) return 20;
        return prev - 1;
      });

      // Advance sim progress
      setSimProgress((prev) => {
        const next = prev + 0.3 * simSpeedMultiplier;
        if (next >= 100) return 10;
        return Number(next.toFixed(1));
      });

      setAmbulanceProgressPercent((prev) => {
        const next = prev + 0.25 * simSpeedMultiplier;
        if (next >= 98) return 20;
        return Number(next.toFixed(1));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimRunning, simSpeedMultiplier]);

  // Sync mute state
  useEffect(() => {
    soundManager.setMuted(soundMuted);
  }, [soundMuted]);

  // Simulation Controls
  const startSimulation = () => {
    setIsSimRunning(true);
    soundManager.playNotification();
    showNotificationToast('Simulation Engine v2.4 started. Preemption protocol active.');
  };

  const pauseSimulation = () => {
    setIsSimRunning(false);
    showNotificationToast('Simulation paused.');
  };

  const resetSimulation = () => {
    setIsSimRunning(true);
    setSimProgress(15);
    setAmbulanceProgressPercent(20);
    setAlertCountdownSec(165);
    setEtaSeconds(20);
    setDistanceRemainingKm(2.8);
    setEtaMinutes(8);
    showNotificationToast('Corridor simulation reset to initial waypoint Node A.');
  };

  const toggleBroadcastOverride = () => {
    const nextState = !isBroadcastActive;
    setIsBroadcastActive(nextState);
    if (nextState) {
      soundManager.playEmergencyAlert();
      showNotificationToast('Emergency Broadcast ACTIVE! 1,420 motorists notified.');
    } else {
      showNotificationToast('Emergency broadcast override cleared.');
    }
  };

  const resendBroadcastAlert = () => {
    soundManager.playEmergencyAlert();
    setAlertCountdownSec(165);
    showNotificationToast('Alert re-broadcasted to all motorists within ' + alertRadius + 'm.');
  };

  const triggerSignalOverride = (nodeId?: string) => {
    soundManager.playNotification();
    setPreemptionNodes((prev) =>
      prev.map((node) => {
        if (!nodeId || node.id === nodeId) {
          return {
            ...node,
            status: 'Green Wave',
            phase: 'Green',
            countdownSec: 45,
          };
        }
        return node;
      })
    );
    showNotificationToast('Signal preemption green wave pulse triggered successfully!');
  };

  const togglePTT = () => {
    const next = !isPTTActive;
    setIsPTTActive(next);
    soundManager.playRadioClick(next);
    if (next) {
      showNotificationToast('PTT Broadcast live on ' + selectedZone + ' (Encrypted 256-bit).');
    }
  };

  const toggleCorridorOverride = (corridorName: string) => {
    setCorridorOverrides((prev) => {
      const updated = { ...prev, [corridorName]: !prev[corridorName] };
      const status = updated[corridorName] ? 'Activated' : 'Standby';
      showNotificationToast(`Corridor ${corridorName}: ${status}`);
      return updated;
    });
  };

  const toggleDistressAudio = (callId: string) => {
    setDistressCalls((prev) =>
      prev.map((c) => {
        if (c.id === callId) {
          const isPlaying = !c.isAudioPlaying;
          if (isPlaying) soundManager.playRadioClick(true);
          return { ...c, isAudioPlaying: isPlaying };
        }
        return { ...c, isAudioPlaying: false };
      })
    );
  };

  const dispatchDistressUnit = (callId: string) => {
    soundManager.playNotification();
    setDistressCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'Dispatched' } : c))
    );
    showNotificationToast('Unit ALS-104 dispatched to incident ' + callId);
  };

  const addHazardReport = (hazard: Omit<HazardReport, 'id' | 'timestamp' | 'status'>) => {
    soundManager.playEmergencyAlert();
    const newReport: HazardReport = {
      ...hazard,
      id: `haz-${Date.now()}`,
      timestamp: 'Just now',
      status: 'Active',
    };
    setHazards((prev) => [newReport, ...prev]);
    showNotificationToast(`Hazard Reported: ${hazard.category} at ${hazard.locationName}. Route adjusted!`);
  };

  const addScenario = (newScen: Scenario) => {
    setScenariosList((prev) => [newScen, ...prev]);
    showNotificationToast(`Scenario '${newScen.name}' created and added to library.`);
  };

  return (
    <SimulationContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeWebTab,
        setActiveWebTab,
        activeMobileTab,
        setActiveMobileTab,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        scenarioName,
        setScenarioName,
        alertRadius,
        setAlertRadius,
        driverCompliance,
        setDriverCompliance,
        ambulanceSpeed,
        setAmbulanceSpeed,
        trafficDensity,
        setTrafficDensity,
        isSimRunning,
        simProgress,
        simSpeedMultiplier,
        setSimSpeedMultiplier,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        corridorId,
        ambulanceId,
        currentStreet,
        distanceRemainingKm,
        etaMinutes,
        etaSeconds,
        ambulanceProgressPercent,
        isBroadcastActive,
        toggleBroadcastOverride,
        resendBroadcastAlert,
        alertCountdownSec,
        connectedMotorists,
        broadcastMessage,
        preemptionNodes,
        triggerSignalOverride,
        isPTTActive,
        togglePTT,
        selectedZone,
        setSelectedZone,
        corridorOverrides,
        toggleCorridorOverride,
        distressCalls,
        toggleDistressAudio,
        dispatchDistressUnit,
        hazards,
        addHazardReport,
        recentRuns,
        scenariosList,
        addScenario,
        usersList,
        auditLogs,
        showResultsModal,
        setShowResultsModal,
        showAboutModal,
        setShowAboutModal,
        soundMuted,
        setSoundMuted,
        lastNotification,
        showNotificationToast,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
