import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Truck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  MapPin, 
  CheckCircle2, 
  Compass, 
  RotateCcw,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Bot,
  Radio,
  Navigation,
  Gift,
  Building2,
  ExternalLink,
  X,
  MousePointer,
  UserCheck,
  Coffee,
  Home,
  Trees,
  Flame,
  LogIn,
  Gamepad2,
  User,
  ShoppingBag,
  LogOut,
  Zap,
  BarChart2,
  Check,
  Smartphone
} from 'lucide-react';

/**
 * SMARTBIN PLATFORM APP FEATURES DATASET
 * Showcased dynamically at each of the 6 city garbage spots.
 */
const SPOT_APP_FEATURES = [
  {
    id: 1,
    title: "AI Multi-Modal Waste Classifier",
    subtitle: "Gemini 2.5 Flash Neural Vision Engine",
    category: "Plastic & Packaging",
    color: "#3b82f6",
    highlight: "Computer Vision & Auto-Tagging",
    description: "Our edge and cloud AI scans trash photos in real-time, categorizing items into Recyclable, Compostable, or Hazardous with >98.4% accuracy.",
    statLabel: "Detection Accuracy",
    statValue: "98.4%",
    route: "/dashboard/ai"
  },
  {
    id: 2,
    title: "IoT Ultrasonic Telemetry Sensors",
    subtitle: "Real-time Bin Volume & LoRaWAN Alerts",
    category: "Organic Food Waste",
    color: "#22c55e",
    highlight: "Zero-Overflow Urban Monitoring",
    description: "Every physical SmartBin contains an ultrasonic distance sensor that reports live fill percentages to municipal servers every 15 minutes, avoiding overflow.",
    statLabel: "Telemetry Latency",
    statValue: "< 2.5s",
    route: "/dashboard/map"
  },
  {
    id: 3,
    title: "High-Performance C++ VRP Optimizer",
    subtitle: "Capacitated Vehicle Routing Problem Solver",
    category: "Paper & Cardboard",
    color: "#f59e0b",
    highlight: "34% Fuel & Diesel Reduction",
    description: "Our high-speed C++ engine solves the Capacitated Vehicle Routing Problem (CVRP), calculating the shortest fuel-efficient routes for garbage trucks.",
    statLabel: "Fuel Savings",
    statValue: "34.2%",
    route: "/dashboard"
  },
  {
    id: 4,
    title: "Civic Eco-Points Digital Ledger",
    subtitle: "Civic Incentives & Micro-Cash Wallet",
    category: "Hazardous & Dry Waste",
    color: "#ec4899",
    highlight: "100 Eco-Points = ₹1.00 Digital Cash",
    description: "Citizens upload verified photos of cleanings and earn Eco-Points credited directly to their civic digital wallet for government tax & bill rebates.",
    statLabel: "Reward Rate",
    statValue: "₹1 / 100 Pts",
    route: "/dashboard/profile"
  },
  {
    id: 5,
    title: "Corporate CSR Voucher Marketplace",
    subtitle: "Local Businesses Sponsor Cleanliness",
    category: "Commercial Recyclables",
    color: "#8b5cf6",
    highlight: "Sponsor Discounts & EV Vouchers",
    description: "Local stores and CSR partners (Jindal, Tata EV, CG Compost) sponsor discounts and free passes that citizens redeem using earned Eco-Points.",
    statLabel: "Partner Sponsors",
    statValue: "18+ Brands",
    route: "/dashboard/rewards"
  },
  {
    id: 6,
    title: "Municipal GIS Command Center",
    subtitle: "Centralized Administrative Fleet Control",
    category: "Public Sector Waste",
    color: "#10b981",
    highlight: "Bilaspur Municipal Real-Time GIS",
    description: "City administrators view live heatmap clusters, track garbage fleet GPS in real time, and audit contractor cleaning verifications.",
    statLabel: "City Coverage",
    statValue: "100% Ward GIS",
    route: "/dashboard/analytics"
  }
];

/**
 * CITY INFRASTRUCTURE & BUILDINGS AUDIT DATASET
 * Showcased during Game Mode: Describes each building, cafe, house, garden, and component in the city.
 */
const CITY_BUILDINGS_DATA = [
  {
    id: 'block-1',
    blockIndex: 1,
    bx: -69,
    bz: -69,
    category: 'cafe',
    name: 'Green Bean Urban Cafe & Bakery',
    tag: 'Commercial Biomass Partner',
    desc: 'Generates ~32kg organic coffee grounds and food scraps daily. Integrated with city anaerobic digester for 100% biogas composting.',
    segregation: 'Wet & dry segregated at counter • Compost partner',
    points: 25
  },
  {
    id: 'block-2',
    blockIndex: 2,
    bx: -69,
    bz: -23,
    category: 'corporate',
    name: 'North-West Commercial Plaza',
    tag: 'Retail Recycling Center',
    desc: 'High-density commercial market with smart cardboard compactors and returnable container deposit boxes.',
    segregation: 'Dedicated Cardboard Balers & Dry Waste Sorting',
    points: 25
  },
  {
    id: 'block-3',
    blockIndex: 3,
    bx: -69,
    bz: 23,
    category: 'residential',
    name: 'Vindhya Heritage Model Villa',
    tag: 'Source Segregation Champion',
    desc: 'Exemplary citizen residence practicing dual-bin source segregation. Scans QR codes on SmartBins to earn weekly municipal rebates.',
    segregation: 'Green (Wet) & Blue (Dry) Household Bins',
    points: 25
  },
  {
    id: 'block-4',
    blockIndex: 4,
    bx: -69,
    bz: 69,
    category: 'corporate',
    name: 'Bilaspur Smart Infrastructure Tower',
    tag: 'Paperless Digital Enterprise',
    desc: '16-floor corporate tower with 95% digitized paperwork. All unavoidable paper waste is shredded and baled on-site.',
    segregation: 'Certified Document Shredding & Fiber Recycling',
    points: 25
  },
  {
    id: 'block-5',
    blockIndex: 5,
    bx: -23,
    bz: -69,
    category: 'corporate',
    name: 'Mahanadi IT & Clean Energy Hub',
    tag: 'Solar Microgrid & Tech Sector',
    desc: 'Houses green data operations and rooftop solar microgrid controllers. Collects IT equipment for authorized e-waste dismantling.',
    segregation: 'Quarterly Certified E-Waste Safe Disposal',
    points: 25
  },
  {
    id: 'block-6',
    blockIndex: 6,
    bx: -23,
    bz: -23,
    category: 'garden',
    name: 'Central Botanical Flora Gardens & Fountain',
    tag: 'Municipal Green Lungs',
    desc: 'Public park featuring illuminated fountains irrigated with treated wastewater. Soil enriched by municipal leaf compost.',
    segregation: '100% Recycled Treated Water & Horticultural Compost',
    points: 35
  },
  {
    id: 'block-7',
    blockIndex: 7,
    bx: -23,
    bz: 23,
    category: 'cafe',
    name: "Chai Point & Baker's Delight",
    tag: 'Zero Single-Use Plastic',
    desc: 'Prohibits disposable plastic cutlery and straws. Replaces takeout plastics with biodegradable sugarcane bagasse.',
    segregation: '100% Biodegradable Bagasse Packaging Only',
    points: 25
  },
  {
    id: 'block-8',
    blockIndex: 8,
    bx: -23,
    bz: 69,
    category: 'residential',
    name: 'Nehru Nagar Smart Housing Society',
    tag: 'Decentralized Composting Society',
    desc: '48-apartment housing cooperative operating on-site aerobic composting drums, diverting 70% of waste from municipal trucks.',
    segregation: 'On-site Rotary Drum Community Composter',
    points: 25
  },
  {
    id: 'block-9',
    blockIndex: 9,
    bx: 23,
    bz: -69,
    category: 'corporate',
    name: 'C.G. Mineral & Sustainable Energy Board',
    tag: 'Corporate CSR Sponsor Hub',
    desc: 'Sponsors 100+ IoT SmartBins across Chhattisgarh under corporate CSR mandates and funds driver safety incentives.',
    segregation: 'CSR Sponsor Marketplace Engine & Clean Tech Grants',
    points: 25
  },
  {
    id: 'block-10',
    blockIndex: 10,
    bx: 23,
    bz: -23,
    category: 'corporate',
    name: 'SmartBin GIS Fleet Command HQ',
    tag: 'C++ VRP Route Optimizer Center',
    desc: 'Monitors real-time bin telemetry, calculates optimal fuel-saving C++ routes, and verifies GPS timestamps for waste trucks.',
    segregation: 'Centralized Administrative Telemetry & Route Dispatch',
    points: 35
  },
  {
    id: 'block-11',
    blockIndex: 11,
    bx: 23,
    bz: 23,
    category: 'garden',
    name: 'Shivalik Public Green Park & Open Gym',
    tag: 'Solar-Powered Eco Promenade',
    desc: 'Equipped with solar phone-charging benches, exercise equipment crafted from recycled steel, and designated pet cleanup bins.',
    segregation: 'Recycled Steel Gear & Dual Public Litter Bins',
    points: 35
  },
  {
    id: 'block-12',
    blockIndex: 12,
    bx: 23,
    bz: 69,
    category: 'corporate',
    name: 'Durg-Bhilai Telecom & IoT Gateway',
    tag: 'LoRaWAN Long-Range Transceiver',
    desc: 'Houses high-altitude LoRa antennas that receive wireless fill-level telemetry from ultrasonic bin sensors every 15 minutes.',
    segregation: 'Wireless Sensor Mesh Network & Telemetry Relay',
    points: 25
  },
  {
    id: 'block-13',
    blockIndex: 13,
    bx: 69,
    bz: -69,
    category: 'residential',
    name: 'Model Zero-Waste Villa Complex',
    tag: 'Solar Rooftop & Rain Harvesting',
    desc: 'Residential villas equipped with rooftop solar and kitchen waste composters. Certified zero-landfill pilot block.',
    segregation: 'Home Composting & Greywater Garden Irrigation',
    points: 25
  },
  {
    id: 'block-14',
    blockIndex: 14,
    bx: 69,
    bz: -23,
    category: 'cafe',
    name: 'Subhash Chowk Fresh Roastery',
    tag: 'Bio-Enzyme Citrus Extraction',
    desc: 'Recycles 45kg of citrus peels daily by supplying organic natural floor cleaner and bio-enzyme workshops.',
    segregation: 'Dedicated Organic Peel Collection & Zero Waste Bar',
    points: 25
  },
  {
    id: 'block-15',
    blockIndex: 15,
    bx: 69,
    bz: 23,
    category: 'corporate',
    name: 'Bhilai Eco-Steel Logistics Bureau',
    tag: 'Industrial Byproduct Recycler',
    desc: 'Coordinates scrap metal sorting and sends industrial scrap from the dumpyard to induction recycling furnaces.',
    segregation: 'Ferrous & Non-Ferrous Metal Salvage Coordination',
    points: 25
  },
  {
    id: 'block-16',
    blockIndex: 16,
    bx: 69,
    bz: 69,
    category: 'corporate',
    name: 'Civic Digital FinTech & Rewards Bureau',
    tag: 'Eco-Points Redemption Exchange',
    desc: 'Processes citizen points redemption into retail discounts (D-Mart, PVR, Domino\'s, City Bus Passes) via secure digital vouchers.',
    segregation: 'Points-to-Rupee Civic Ledger & Sponsor Vouchers',
    points: 25
  },
  {
    id: 'dumpyard-salvage',
    blockIndex: 99,
    bx: 0,
    bz: -115,
    category: 'landfill',
    name: 'Northern Scrapyard Landfill & Salvage Bay',
    tag: 'Heavy Grapple Crane & Metal Recovery',
    desc: 'Features heavy crawler crane with 4-jaw grapple claw, crushed end-of-life rusted cars, oil drum reprocessing, and compressed waste mounds.',
    segregation: 'Landfill Diversion, Scrap Shredding & Final Waste Drop',
    points: 50
  }
];

export default function LivingCity3D({ onExit }) {
  const mountRef = useRef(null);

  // Game state displayed on HUD
  const [wasteCollected, setWasteCollected] = useState(0);
  const [totalBins, setTotalBins] = useState(6);
  const [truckCapacity] = useState(150);
  const [currentLoad, setCurrentLoad] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(250);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [collectingBinId, setCollectingBinId] = useState(null);
  const [collectProgress, setCollectProgress] = useState(0);
  const [isWorkerAtBin, setIsWorkerAtBin] = useState(false);
  const [isHoldingCollect, setIsHoldingCollect] = useState(false);
  const [currentTargetName, setCurrentTargetName] = useState("SmartBin #1 (Plastic)");
  const [targetDistance, setTargetDistance] = useState(0);
  const [notification, setNotification] = useState("Shift Started: Capped 0-30 KM/H smooth steering. Park near dustbin to send worker!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('chase');
  const [showHelp, setShowHelp] = useState(false);
  
  // Game Mode vs Normal Mode State
  const [gameMode, setGameMode] = useState(() => {
    return localStorage.getItem('smartbin_selected_mode') || 'normal';
  });
  const gameModeRef = useRef(gameMode);
  gameModeRef.current = gameMode;

  // Launcher Mode Selection Modal (Shown upfront on load)
  const [showLauncherModal, setShowLauncherModal] = useState(false);

  // Citizen Level & Superpower System
  const [citizenLevel, setCitizenLevel] = useState(1);
  const citizenLevelRef = useRef(1);
  citizenLevelRef.current = citizenLevel;

  const [levelXP, setLevelXP] = useState(0);
  const [unlockedPowers, setUnlockedPowers] = useState(['standard_compactor']);
  const [nitroActive, setNitroActive] = useState(false);
  const nitroActiveRef = useRef(false);
  nitroActiveRef.current = nitroActive;
  const [showLevelUpModal, setShowLevelUpModal] = useState(null);

  // Eco-Truck Garage & Vector Shop System
  const [showGarageShop, setShowGarageShop] = useState(false);
  const [selectedTruckModel, setSelectedTruckModel] = useState(() => {
    return localStorage.getItem('smartbin_active_truck') || 'swachh_bharat_standard';
  });
  const [ownedTrucks, setOwnedTrucks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartbin_owned_trucks') || '["swachh_bharat_standard"]');
    } catch {
      return ['swachh_bharat_standard'];
    }
  });

  const [showBuildingPieceModal, setShowBuildingPieceModal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeBuildingInfo, setActiveBuildingInfo] = useState(null);
  const activeBuildingRef = useRef(null);

  const [surveyedBuildings, setSurveyedBuildings] = useState([]);
  const surveyedBuildingsRef = useRef([]);

  // Mobile On-Screen Virtual Controls State
  const mobileKeysRef = useRef({ forward: false, backward: false, left: false, right: false, nitro: false });

  const getCitizenUser = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('smartbin_user') || '{}');
      if (stored && (stored.id || stored.email || stored.name)) return stored;
    } catch (e) {}
    return null;
  };

  // Sync Progress with Database
  const fetchCitizenProgress = async () => {
    try {
      const u = getCitizenUser();
      if (!u || !u.id) return;
      const res = await fetch(`/api/city/progress?user_id=${u.id}`);
      const data = await res.json();
      if (data.success) {
        setCitizenLevel(data.level || 1);
        citizenLevelRef.current = data.level || 1;
        setLevelXP(data.xp_current || 0);
        setEcoPoints(data.eco_points || 250);
        ecoPointsRef.current = data.eco_points || 250;
        setUnlockedPowers((data.unlocked_powers || []).map((p) => p.id));
      }
    } catch (e) {
      console.warn("Could not fetch citizen progress:", e);
    }
  };

  const saveCitizenPoints = async (addedPoints) => {
    try {
      const u = getCitizenUser();
      if (!u || !u.id) return;
      const res = await fetch('/api/city/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: u.id, points_earned: addedPoints })
      });
      const data = await res.json();
      if (data.success) {
        if (data.level > citizenLevelRef.current) {
          setCitizenLevel(data.level);
          citizenLevelRef.current = data.level;
          setShowLevelUpModal({
            level: data.level,
            powers: data.unlocked_powers
          });
          playSound('level_up');
        }
        setLevelXP(data.xp_current || 0);
      }
    } catch (e) {
      console.warn("Could not save citizen progress:", e);
    }
  };

  useEffect(() => {
    fetchCitizenProgress();
  }, []);

  // When switching away from Game Mode: IMMEDIATELY SIGN OUT!
  const handleToggleGameMode = (targetMode) => {
    if (targetMode === 'normal') {
      // User is exiting game mode -> immediately sign out to protect session
      localStorage.removeItem('smartbin_user');
      localStorage.setItem('smartbin_selected_mode', 'normal');
      setNotification("🔒 Logged out of Game Mode session. Redirecting to login page...");
      setTimeout(() => {
        window.location.href = '/login';
      }, 400);
      return;
    }

    if (targetMode === 'game') {
      const u = getCitizenUser();
      if (!u) {
        setShowLoginModal(true);
        return;
      }
      setGameMode('game');
      localStorage.setItem('smartbin_selected_mode', 'game');
      setNotification("🎮 Game Mode: Drive near any building & click to open its interactive app component!");
      fetchCitizenProgress();
    }
  };

  // Immediate Sign-Out handler
  const handleSignOutImmediate = () => {
    localStorage.removeItem('smartbin_user');
    localStorage.removeItem('smartbin_selected_mode');
    window.location.href = '/login';
  };

  // Game Logic: Collisions, Lives, and Mission Completion
  const [lives, setLives] = useState(3);
  const [crashState, setCrashState] = useState(null);
  const [missionComplete, setMissionComplete] = useState(false);

  // Feature Spotlight Modal State
  const [activeFeatureSpotlight, setActiveFeatureSpotlight] = useState(null);
  const [discoveredFeatures, setDiscoveredFeatures] = useState([]);

  // Radar State for SVG Rendering
  const [radarData, setRadarData] = useState({
    playerX: 0,
    playerZ: 0,
    playerAngle: 0,
    bins: [],
    dumpyard: { x: 0, z: -115 },
    traffic: [],
    target: { x: 0, z: 0, label: '' }
  });

  // State Refs for stable Three.js loop without re-triggering useEffect
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const currentLoadRef = useRef(currentLoad);
  currentLoadRef.current = currentLoad;

  const wasteCollectedRef = useRef(wasteCollected);
  wasteCollectedRef.current = wasteCollected;

  const ecoPointsRef = useRef(ecoPoints);
  ecoPointsRef.current = ecoPoints;

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const isHoldingCollectRef = useRef(false);
  isHoldingCollectRef.current = isHoldingCollect;

  const isCrashedRef = useRef(false);
  const cameraShakeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const resetTruckTriggerRef = useRef(null);

  // Web Audio Synthesizer
  const playSound = (type) => {
    if (!soundEnabledRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'horn') {
        // Dual-Tone Heavy Pneumatic Truck Air Horn (310Hz + 465Hz)
        [310, 465].forEach((freq) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, now);
          o.frequency.linearRampToValueAtTime(freq * 0.98, now + 0.38);
          g.gain.setValueAtTime(0.22, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now);
          o.stop(now + 0.45);
        });
      } else if (type === 'nitro') {
        // High-pressure turbo nitrous thrust
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, now);
        o.frequency.exponentialRampToValueAtTime(660, now + 0.45);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.55);
      } else if (type === 'level_up') {
        // Triumphant 4-tone ascending fanfare (C5 - E5 - G5 - C6)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.2, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === 'suction') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'dump') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.7);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type === 'crash') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.38);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.start(now);
        osc.stop(now + 0.48);
      }
    } catch {}
  };

  const handleManualRespawn = () => {
    if (resetTruckTriggerRef.current) {
      resetTruckTriggerRef.current();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS SCENE SETUP
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe8fc);
    scene.fog = new THREE.FogExp2(0xcfe8fc, 0.0045);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 600);
    camera.position.set(0, 22, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. LIGHTING & ENVIRONMENT
    // ─────────────────────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 320;
    const sD = 130;
    sunLight.shadow.camera.left = -sD;
    sunLight.shadow.camera.right = sD;
    sunLight.shadow.camera.top = sD;
    sunLight.shadow.camera.bottom = -sD;
    scene.add(sunLight);

    // ─────────────────────────────────────────────────────────────
    // 3. ROAD NETWORK (4x4 GRID / 16 BLOCKS)
    // ─────────────────────────────────────────────────────────────
    const blockSize = 32;
    const roadWidth = 14;
    const step = blockSize + roadWidth; // 46 units
    const roadLines = [-2 * step, -1 * step, 0, 1 * step, 2 * step]; // [-92, -46, 0, 46, 92]
    const blockCenters = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step];
    const totalSpan = 260;
    const fenceLimit = 125;

    // Base Pavement
    const groundGeo = new THREE.PlaneGeometry(totalSpan, totalSpan);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Asphalt Roads
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Horizontal Avenues
    roadLines.forEach((rz) => {
      const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(fenceLimit * 2, roadWidth), roadMat);
      hRoad.rotation.x = -Math.PI / 2;
      hRoad.position.set(0, 0.02, rz);
      hRoad.receiveShadow = true;
      scene.add(hRoad);

      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(fenceLimit * 2, 0.4), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(0, 0.03, rz);
      scene.add(yLine);
    });

    // Vertical Avenues
    roadLines.forEach((rx) => {
      const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, fenceLimit * 2), roadMat);
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set(rx, 0.02, 0);
      vRoad.receiveShadow = true;
      scene.add(vRoad);

      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, fenceLimit * 2), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(rx, 0.03, 0);
      scene.add(yLine);
    });

    // ─────────────────────────────────────────────────────────────
    // 4. WORLD BORDER: TALL SECURITY FENCES
    // ─────────────────────────────────────────────────────────────
    const fenceGroup = new THREE.Group();
    const fencePostGeo = new THREE.CylinderGeometry(0.2, 0.2, 6.5, 8);
    const fencePostMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const fenceMeshMat = new THREE.MeshBasicMaterial({ 
      color: 0x64748b, 
      wireframe: true,
      transparent: true, 
      opacity: 0.7 
    });
    const barrierBaseMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });

    const buildPerimeterSide = (startX, startZ, endX, endZ, isHorizontal) => {
      const length = isHorizontal ? Math.abs(endX - startX) : Math.abs(endZ - startZ);
      const postSpacing = 6;
      const count = Math.floor(length / postSpacing);

      for (let i = 0; i <= count; i++) {
        const px = isHorizontal ? startX + i * postSpacing : startX;
        const pz = isHorizontal ? startZ : startZ + i * postSpacing;

        const post = new THREE.Mesh(fencePostGeo, fencePostMat);
        post.position.set(px, 3.25, pz);
        post.castShadow = true;
        fenceGroup.add(post);

        const curb = new THREE.Mesh(
          new THREE.BoxGeometry(isHorizontal ? postSpacing : 1.2, 0.8, isHorizontal ? 1.2 : postSpacing),
          barrierBaseMat
        );
        curb.position.set(
          isHorizontal ? px + postSpacing / 2 : px,
          0.4,
          isHorizontal ? pz : pz + postSpacing / 2
        );
        curb.receiveShadow = true;
        fenceGroup.add(curb);

        if (i < count) {
          const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(postSpacing, 5.5),
            fenceMeshMat
          );
          if (isHorizontal) {
            panel.position.set(px + postSpacing / 2, 3.5, pz);
          } else {
            panel.rotation.y = Math.PI / 2;
            panel.position.set(px, 3.5, pz + postSpacing / 2);
          }
          fenceGroup.add(panel);
        }
      }
    };

    buildPerimeterSide(-fenceLimit, -fenceLimit, fenceLimit, -fenceLimit, true);
    buildPerimeterSide(-fenceLimit, fenceLimit, fenceLimit, fenceLimit, true);
    buildPerimeterSide(-fenceLimit, -fenceLimit, -fenceLimit, fenceLimit, false);
    buildPerimeterSide(fenceLimit, -fenceLimit, fenceLimit, fenceLimit, false);

    scene.add(fenceGroup);

    // ─────────────────────────────────────────────────────────────
    // 5. SCRAPYARD & LANDFILL DUMPYARD (With Cranes, Broken Cars & Trash Mounds)
    // ─────────────────────────────────────────────────────────────
    const dumpyardPos = { x: 0, z: -115 };
    const dumpyardGroup = new THREE.Group();

    // Heavy Concrete Apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(42, 0.4, 26),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    apron.position.set(dumpyardPos.x, 0.2, dumpyardPos.z);
    apron.receiveShadow = true;
    dumpyardGroup.add(apron);

    // Yellow/Black Hazard Curb
    const curbStripe = new THREE.Mesh(
      new THREE.BoxGeometry(42.4, 0.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    curbStripe.position.set(dumpyardPos.x, 0.26, dumpyardPos.z + 12.8);
    dumpyardGroup.add(curbStripe);

    // Main Municipal Recycling Facility Warehouse Hangar
    const hangar = new THREE.Mesh(
      new THREE.BoxGeometry(32, 13, 16),
      new THREE.MeshLambertMaterial({ color: 0x0f766e })
    );
    hangar.position.set(dumpyardPos.x, 6.7, dumpyardPos.z - 4);
    hangar.castShadow = true;
    dumpyardGroup.add(hangar);

    // Signboard: "CENTRAL MUNICIPAL RECYCLING FACILITY & SALVAGE YARD"
    const dumpSign = new THREE.Mesh(
      new THREE.BoxGeometry(26, 2.8, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
    );
    dumpSign.position.set(dumpyardPos.x, 14.8, dumpyardPos.z + 4.2);
    dumpyardGroup.add(dumpSign);

    // ── MASSIVE SCRAP & TRASH MOUNDS (Bahut Sara Kachra) ──
    const moundMat1 = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Scrap metal pile
    const moundMat2 = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Rusted junk & compost
    const moundMat3 = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Compressed tire pile

    // Mound 1: Left Scrap Metal Mounds
    const mound1 = new THREE.Mesh(new THREE.DodecahedronGeometry(5.5, 1), moundMat1);
    mound1.scale.set(1.4, 0.65, 1.2);
    mound1.position.set(dumpyardPos.x - 14, 2.2, dumpyardPos.z + 2);
    mound1.castShadow = true;
    dumpyardGroup.add(mound1);

    // Mound 2: Right Mixed Waste & Tire Heap
    const mound2 = new THREE.Mesh(new THREE.DodecahedronGeometry(6.2, 1), moundMat2);
    mound2.scale.set(1.3, 0.6, 1.1);
    mound2.position.set(dumpyardPos.x + 14, 2.4, dumpyardPos.z + 3);
    mound2.castShadow = true;
    dumpyardGroup.add(mound2);

    // Mound 3: Center Rear Rubble Pile
    const mound3 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.8, 1), moundMat3);
    mound3.scale.set(1.5, 0.7, 1.0);
    mound3.position.set(dumpyardPos.x + 8, 2.0, dumpyardPos.z - 9);
    dumpyardGroup.add(mound3);

    // Discarded Rusted Oil Drums & Barrels Scattered on Mounds
    const drumGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 10);
    const drumMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    [
      { x: -11, y: 1.2, z: 6, rotZ: 0 },
      { x: -12.2, y: 1.2, z: 5.5, rotZ: Math.PI / 2 },
      { x: 12, y: 1.2, z: 7, rotZ: 0.3 },
      { x: 13.5, y: 1.2, z: 6.2, rotZ: Math.PI / 2 }
    ].forEach((dp) => {
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.position.set(dumpyardPos.x + dp.x, dp.y, dumpyardPos.z + dp.z);
      drum.rotation.z = dp.rotZ;
      dumpyardGroup.add(drum);
    });

    // ── TUTI FUTI WRECKED & CRASHED CARS (Salvage Vehicles) ──
    const createWreckedCar = (bodyColor, rotX, rotY, rotZ, pos) => {
      const wreck = new THREE.Group();
      // Crumpled chassis
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.7, 3.8),
        new THREE.MeshLambertMaterial({ color: bodyColor })
      );
      body.castShadow = true;
      wreck.add(body);

      // Smashed bent roof
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.5, 1.8),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      roof.position.set(0.1, 0.55, -0.2);
      roof.rotation.z = 0.15;
      wreck.add(roof);

      // Remaining rusted wheels
      const rWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 10);
      const rWheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      [
        { x: -1.0, z: 1.1 }, { x: 1.0, z: -1.1 }
      ].forEach((wp) => {
        const rw = new THREE.Mesh(rWheelGeo, rWheelMat);
        rw.rotation.z = Math.PI / 2;
        rw.position.set(wp.x, -0.2, wp.z);
        wreck.add(rw);
      });

      wreck.position.set(pos.x, pos.y, pos.z);
      wreck.rotation.set(rotX, rotY, rotZ);
      return wreck;
    };

    // Wrecked Car 1: Tilted on Left Scrap Heap (Rusted Brown)
    const wreck1 = createWreckedCar(0x78350f, 0.25, 0.4, -0.3, {
      x: dumpyardPos.x - 13.5,
      y: 3.2,
      z: dumpyardPos.z + 1.5
    });
    dumpyardGroup.add(wreck1);

    // Wrecked Car 2: Half-buried on Right Trash Mound (Burnt Orange)
    const wreck2 = createWreckedCar(0x9a3412, -0.35, -0.6, 0.4, {
      x: dumpyardPos.x + 13.2,
      y: 3.4,
      z: dumpyardPos.z + 2.8
    });
    dumpyardGroup.add(wreck2);

    // Wrecked Car 3: Upside-down crushed shell in salvage bay (Oxidized Blue)
    const wreck3 = createWreckedCar(0x334155, Math.PI, 0.8, 0.1, {
      x: dumpyardPos.x + 15.5,
      y: 1.2,
      z: dumpyardPos.z + 7.5
    });
    dumpyardGroup.add(wreck3);

    // ── INDUSTRIAL SALVAGE GRAPPLE CRANE (Heavy Scrapyard Crane) ──
    const craneGroup = new THREE.Group();
    // Crawler Tracks Base
    const tracks = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 1.6, 6.5),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    tracks.position.y = 0.8;
    craneGroup.add(tracks);

    // Rotating Cabin
    const craneCabin = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 3.4, 4.4),
      new THREE.MeshLambertMaterial({ color: 0xeab308 }) // Industrial Equipment Yellow
    );
    craneCabin.position.set(0, 3.2, 0);
    craneCabin.castShadow = true;
    craneGroup.add(craneCabin);

    // Slanted Crane Boom / Arm
    const boom = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 17, 0.8),
      new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    boom.rotation.x = -Math.PI / 3.6;
    boom.position.set(0, 10.5, 6.5);
    boom.castShadow = true;
    craneGroup.add(boom);

    // Hoist Cable & 4-Jaw Mechanical Scrap Grapple Claw
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 6.0, 6),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    cable.position.set(0, 12.0, 11.5);
    craneGroup.add(cable);

    const grapple = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.2, 0),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    grapple.position.set(0, 8.8, 11.5);
    craneGroup.add(grapple);

    craneGroup.position.set(dumpyardPos.x - 12, 0.2, dumpyardPos.z - 7);
    craneGroup.rotation.y = 0.55;
    dumpyardGroup.add(craneGroup);

    // Beacon Tower
    const beaconTower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beaconTower.position.set(dumpyardPos.x, 10.0, dumpyardPos.z + 6);
    dumpyardGroup.add(beaconTower);

    scene.add(dumpyardGroup);

    // ─────────────────────────────────────────────────────────────
    // 6. CITY BLOCKS: REALISTIC ARCHITECTURE, GARDEN SWINGS & FOOTPATHS
    // ─────────────────────────────────────────────────────────────
    const cityGroup = new THREE.Group();
    const smartBins = [];
    const animatedSwings = [];
    let blockIndex = 0;

    blockCenters.forEach((bx) => {
      blockCenters.forEach((bz) => {
        blockIndex++;

        // Plot Base Sidewalk & Textured Elevated Footpath Curb
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize + 1.2, 0.45, blockSize + 1.2),
          new THREE.MeshLambertMaterial({ color: 0xcfd8dc }) // Concrete Sidewalk Pavement
        );
        platform.position.set(bx, 0.22, bz);
        platform.receiveShadow = true;
        cityGroup.add(platform);

        // White Curb Trims around edge
        const curbEdge = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize + 1.4, 0.12, blockSize + 1.4),
          new THREE.MeshLambertMaterial({ color: 0xf8fafc })
        );
        curbEdge.position.set(bx, 0.42, bz);
        cityGroup.add(curbEdge);

        const isGarden = (blockIndex === 6 || blockIndex === 11);
        const isCafe = (blockIndex === 1 || blockIndex === 7 || blockIndex === 14);
        const isHouse = (blockIndex === 3 || blockIndex === 8 || blockIndex === 13);

        if (isGarden) {
          // Public Botanical Garden Lawn
          const lawn = new THREE.Mesh(
            new THREE.BoxGeometry(blockSize - 2, 0.38, blockSize - 2),
            new THREE.MeshLambertMaterial({ color: 0x16a34a })
          );
          lawn.position.set(bx, 0.42, bz);
          lawn.receiveShadow = true;
          cityGroup.add(lawn);

          // Central Illuminated Fountain
          const fPool = new THREE.Mesh(
            new THREE.CylinderGeometry(4.2, 4.2, 0.7, 24),
            new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
          );
          fPool.position.set(bx, 0.75, bz);
          fPool.castShadow = true;
          cityGroup.add(fPool);

          const fWater = new THREE.Mesh(
            new THREE.CylinderGeometry(3.6, 3.6, 0.1, 24),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          fWater.position.set(bx, 1.1, bz);
          cityGroup.add(fWater);

          // ── 3D GARDEN SWINGS SET (JHULA) ──
          const jhulaGroup = new THREE.Group();
          const poleMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
          const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8);
          // Left A-frame
          const l1 = new THREE.Mesh(legGeo, poleMat); l1.rotation.z = 0.26; l1.position.set(-1.8, 2.1, 0.7); jhulaGroup.add(l1);
          const l2 = new THREE.Mesh(legGeo, poleMat); l2.rotation.z = 0.26; l2.position.set(-1.8, 2.1, -0.7); jhulaGroup.add(l2);
          // Right A-frame
          const r1 = new THREE.Mesh(legGeo, poleMat); r1.rotation.z = -0.26; r1.position.set(1.8, 2.1, 0.7); jhulaGroup.add(r1);
          const r2 = new THREE.Mesh(legGeo, poleMat); r2.rotation.z = -0.26; r2.position.set(1.8, 2.1, -0.7); jhulaGroup.add(r2);
          // Crossbar
          const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.4, 8), poleMat);
          crossBar.rotation.z = Math.PI / 2;
          crossBar.position.y = 4.0;
          jhulaGroup.add(crossBar);

          // 2 Hanging Swings
          [-0.8, 0.8].forEach((sx, sIdx) => {
            const swingPivot = new THREE.Group();
            swingPivot.position.set(sx, 3.95, 0);

            // Chains
            const chainMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
            [-0.3, 0.3].forEach((cx) => {
              const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.3, 6), chainMat);
              chain.position.set(cx, -1.15, 0);
              swingPivot.add(chain);
            });

            // Wooden Seat
            const seat = new THREE.Mesh(
              new THREE.BoxGeometry(0.85, 0.08, 0.4),
              new THREE.MeshLambertMaterial({ color: 0xb45309 })
            );
            seat.position.y = -2.3;
            swingPivot.add(seat);

            jhulaGroup.add(swingPivot);
            animatedSwings.push({ pivot: swingPivot, offset: sIdx * 1.5 });
          });

          jhulaGroup.position.set(bx + 8, 0.42, bz);
          cityGroup.add(jhulaGroup);

          // Garden Benches & Trees
          const treeOffsets = [
            { x: -9, z: -9, type: 'neem' },
            { x: 9, z: -9, type: 'gulmohar' },
            { x: -9, z: 9, type: 'gulmohar' },
            { x: 9, z: 9, type: 'neem' }
          ];
          treeOffsets.forEach((to) => {
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.35, 0.5, 3.2, 8),
              new THREE.MeshLambertMaterial({ color: 0x78350f })
            );
            trunk.position.set(bx + to.x, 1.8, bz + to.z);
            trunk.castShadow = true;
            cityGroup.add(trunk);

            const foliage = new THREE.Mesh(
              new THREE.SphereGeometry(2.2, 10, 10),
              new THREE.MeshLambertMaterial({ color: to.type === 'gulmohar' ? 0xf97316 : 0x15803d })
            );
            foliage.position.set(bx + to.x, 4.2, bz + to.z);
            foliage.castShadow = true;
            cityGroup.add(foliage);
          });

        } else if (isCafe) {
          // ── REALISTIC CONTEMPORARY CAFE WITH AWNING & PATIO ──
          const cafeW = 20, cafeD = 18, cafeH = 8.0;
          const cafeBody = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW, cafeH, cafeD),
            new THREE.MeshLambertMaterial({ color: 0x27272a }) // Modern Charcoal Slate
          );
          cafeBody.position.set(bx, cafeH / 2 + 0.4, bz);
          cafeBody.castShadow = true;
          cityGroup.add(cafeBody);

          // Warm Interior Lit Glass Window
          const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(cafeW * 0.82, 4.4),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 })
          );
          glass.position.set(bx, 3.0, bz + cafeD / 2 + 0.05);
          cityGroup.add(glass);

          // Striped Canvas Fabric Awning Canopy
          const awning = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW * 0.86, 0.25, 3.2),
            new THREE.MeshLambertMaterial({ color: 0xef4444 }) // Vibrant Cafe Canopy
          );
          awning.rotation.x = 0.25;
          awning.position.set(bx, 5.5, bz + cafeD / 2 + 1.4);
          cityGroup.add(awning);

          // 3D Roof Signboard
          const signBoard = new THREE.Mesh(
            new THREE.BoxGeometry(9.5, 1.8, 0.4),
            new THREE.MeshLambertMaterial({ color: 0x18181b })
          );
          signBoard.position.set(bx, cafeH + 1.4, bz + cafeD / 2 - 0.2);
          cityGroup.add(signBoard);

          const signText = new THREE.Mesh(
            new THREE.BoxGeometry(8.0, 0.9, 0.45),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 }) // Glowing yellow cafe badge
          );
          signText.position.set(bx, cafeH + 1.4, bz + cafeD / 2);
          cityGroup.add(signText);

          // Outdoor Patio Tables with Umbrellas
          [-5.5, 5.5].forEach((tx) => {
            const table = new THREE.Mesh(
              new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16),
              new THREE.MeshLambertMaterial({ color: 0xf8fafc })
            );
            table.position.set(bx + tx, 1.1, bz + cafeD / 2 + 4.2);
            cityGroup.add(table);

            const tLeg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8),
              new THREE.MeshLambertMaterial({ color: 0x334155 })
            );
            tLeg.position.set(bx + tx, 0.55, bz + cafeD / 2 + 4.2);
            cityGroup.add(tLeg);

            const umbrella = new THREE.Mesh(
              new THREE.ConeGeometry(1.9, 0.8, 16),
              new THREE.MeshLambertMaterial({ color: 0x0284c7 })
            );
            umbrella.position.set(bx + tx, 3.1, bz + cafeD / 2 + 4.2);
            cityGroup.add(umbrella);

            const uPole = new THREE.Mesh(
              new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8),
              new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
            );
            uPole.position.set(bx + tx, 1.9, bz + cafeD / 2 + 4.2);
            cityGroup.add(uPole);
          });

        } else if (isHouse) {
          // ── REALISTIC 2-STORY RESIDENTIAL DUPLEX VILLA ──
          const houseW = 18, houseD = 18, houseH = 8.5;
          const houseBody = new THREE.Mesh(
            new THREE.BoxGeometry(houseW, houseH, houseD),
            new THREE.MeshLambertMaterial({ color: 0xfef3c7 }) // Indian Sandstone
          );
          houseBody.position.set(bx, houseH / 2 + 0.4, bz);
          houseBody.castShadow = true;
          cityGroup.add(houseBody);

          // 2nd Floor Balcony with Metal Railing
          const balconySlab = new THREE.Mesh(
            new THREE.BoxGeometry(houseW * 0.72, 0.35, 2.6),
            new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
          );
          balconySlab.position.set(bx, 4.8, bz + houseD / 2 + 1.1);
          cityGroup.add(balconySlab);

          const railing = new THREE.Mesh(
            new THREE.BoxGeometry(houseW * 0.72, 0.95, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x1e293b })
          );
          railing.position.set(bx, 5.4, bz + houseD / 2 + 2.35);
          cityGroup.add(railing);

          // Terracotta Sloped Tiled Roof
          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(houseW * 0.76, 5.0, 4),
            new THREE.MeshLambertMaterial({ color: 0xb45309 }) // Terracotta Tile
          );
          roof.rotation.y = Math.PI / 4;
          roof.position.set(bx, houseH + 2.7, bz);
          roof.castShadow = true;
          cityGroup.add(roof);

          // Black Sintex Rooftop Water Tank
          const sintexTank = new THREE.Mesh(
            new THREE.CylinderGeometry(0.85, 0.85, 1.3, 16),
            new THREE.MeshLambertMaterial({ color: 0x090d16 }) // Classic Black Sintex Tank
          );
          sintexTank.position.set(bx - 3.5, houseH + 4.6, bz - 3.5);
          cityGroup.add(sintexTank);

        } else {
          // ── MODERN CORPORATE SKYSCRAPER ──
          const corpW = 22, corpD = 22, corpH = 24 + ((blockIndex * 6) % 18);
          const corpTower = new THREE.Mesh(
            new THREE.BoxGeometry(corpW, corpH, corpD),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          corpTower.position.set(bx, corpH / 2 + 0.4, bz);
          corpTower.castShadow = true;
          cityGroup.add(corpTower);

          // Reflective Cyan Glass Curtain Wall Panels
          const windowGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(corpW * 0.88, corpH * 0.84),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
          );
          windowGlass.position.set(bx, corpH / 2 + 0.4, bz + corpD / 2 + 0.05);
          cityGroup.add(windowGlass);

          // Rooftop HVAC Mechanical Unit & Solar Panels
          const hvac = new THREE.Mesh(
            new THREE.BoxGeometry(6.5, 2.4, 5.5),
            new THREE.MeshLambertMaterial({ color: 0x475569 })
          );
          hvac.position.set(bx - 4, corpH + 1.4, bz);
          cityGroup.add(hvac);

          const solarArray = new THREE.Mesh(
            new THREE.BoxGeometry(7.5, 0.25, 6.5),
            new THREE.MeshLambertMaterial({ color: 0x1d4ed8 })
          );
          solarArray.rotation.x = 0.2;
          solarArray.position.set(bx + 4, corpH + 0.6, bz);
          cityGroup.add(solarArray);

          // Communications Antenna Spire with Aircraft Warning Beacon
          const spire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.2, 8.5, 8),
            new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
          );
          spire.position.set(bx, corpH + 4.5, bz);
          cityGroup.add(spire);

          const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
          );
          beacon.position.set(bx, corpH + 8.8, bz);
          cityGroup.add(beacon);
        }

        // Buffer Trees in Empty Corners (Khali jagah m ped)
        const cornerTrees = [
          { x: -blockSize / 2 + 2.5, z: -blockSize / 2 + 2.5, type: 'neem' },
          { x: blockSize / 2 - 2.5, z: -blockSize / 2 + 2.5, type: 'gulmohar' },
          { x: -blockSize / 2 + 2.5, z: blockSize / 2 - 2.5, type: 'pine' }
        ];
        cornerTrees.forEach((ct) => {
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.35, 2.6, 8),
            new THREE.MeshLambertMaterial({ color: 0x78350f })
          );
          trunk.position.set(bx + ct.x, 1.3, bz + ct.z);
          cityGroup.add(trunk);

          let canopy;
          if (ct.type === 'gulmohar') {
            canopy = new THREE.Mesh(
              new THREE.SphereGeometry(2.0, 10, 10),
              new THREE.MeshLambertMaterial({ color: 0xf97316 })
            );
            canopy.position.set(bx + ct.x, 3.4, bz + ct.z);
          } else if (ct.type === 'pine') {
            canopy = new THREE.Mesh(
              new THREE.ConeGeometry(1.6, 3.8, 10),
              new THREE.MeshLambertMaterial({ color: 0x14532d })
            );
            canopy.position.set(bx + ct.x, 3.8, bz + ct.z);
          } else {
            canopy = new THREE.Mesh(
              new THREE.SphereGeometry(2.1, 10, 10),
              new THREE.MeshLambertMaterial({ color: 0x16a34a })
            );
            canopy.position.set(bx + ct.x, 3.5, bz + ct.z);
          }
          cityGroup.add(canopy);
        });

        // Place 6 Wheelie SmartBins on curbs
        if ([2, 4, 7, 9, 12, 15].includes(blockIndex)) {
          const curbOffset = blockSize / 2 + 1.2;
          const binX = bx;
          const binZ = bz + curbOffset;
          const binId = smartBins.length + 1;

          const featureInfo = SPOT_APP_FEATURES[binId - 1] || SPOT_APP_FEATURES[0];

          const wheelieBinGroup = new THREE.Group();

          // Body
          const binBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 2.2, 1.2),
            new THREE.MeshLambertMaterial({ color: new THREE.Color(featureInfo.color).getHex() })
          );
          binBody.position.y = 1.2;
          binBody.castShadow = true;
          wheelieBinGroup.add(binBody);

          // Lid
          const binLid = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.25, 1.3),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          binLid.position.y = 2.4;
          wheelieBinGroup.add(binLid);

          // Rear Wheels
          const binWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 10);
          const binWheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
          [-0.65, 0.65].forEach((wx) => {
            const bw = new THREE.Mesh(binWheelGeo, binWheelMat);
            bw.rotation.z = Math.PI / 2;
            bw.position.set(wx, 0.3, -0.55);
            wheelieBinGroup.add(bw);
          });

          // Beacon Ring
          const beaconGeo = new THREE.RingGeometry(0.8, 1.4, 24);
          const beaconMat = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(featureInfo.color).getHex(), 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.85 
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.rotation.x = -Math.PI / 2;
          beacon.position.y = 3.6;
          wheelieBinGroup.add(beacon);

          // Light Column
          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8),
            new THREE.MeshBasicMaterial({ 
              color: new THREE.Color(featureInfo.color).getHex(), 
              transparent: true, 
              opacity: 0.6 
            })
          );
          colMesh.position.y = 5.6;
          wheelieBinGroup.add(colMesh);

          wheelieBinGroup.position.set(binX, 0, binZ);
          cityGroup.add(wheelieBinGroup);

          smartBins.push({
            id: binId,
            group: wheelieBinGroup,
            body: binBody,
            beacon: beacon,
            column: colMesh,
            x: binX,
            z: binZ,
            category: featureInfo.category,
            feature: featureInfo,
            colorHex: new THREE.Color(featureInfo.color).getHex(),
            collected: false
          });
        }
      });
    });

    scene.add(cityGroup);
    setTotalBins(smartBins.length);

    // ─────────────────────────────────────────────────────────────
    // 6B. 3D TRAFFIC LIGHT SIGNALS AT MAJOR ROAD INTERSECTIONS
    // ─────────────────────────────────────────────────────────────
    const trafficSignals = [];
    const signalIntersections = [
      { x: 0, z: 0 },
      { x: -46, z: 0 },
      { x: 46, z: 0 },
      { x: 0, z: -46 },
      { x: 0, z: 46 }
    ];

    signalIntersections.forEach((si) => {
      [
        { ox: -8.8, oz: -8.8, rot: 0, avenue: 'ns' },
        { ox: 8.8, oz: 8.8, rot: Math.PI, avenue: 'ew' }
      ].forEach((corner) => {
        const sigGroup = new THREE.Group();
        // Steel Pole
        const sigPole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.18, 6.2, 8),
          new THREE.MeshLambertMaterial({ color: 0x334155 })
        );
        sigPole.position.y = 3.1;
        sigGroup.add(sigPole);

        // Mast arm
        const mast = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.18, 2.2),
          new THREE.MeshLambertMaterial({ color: 0x334155 })
        );
        mast.position.set(0, 5.8, 1.1);
        sigGroup.add(mast);

        // Signal Housing Box
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 2.2, 0.65),
          new THREE.MeshLambertMaterial({ color: 0x0f172a })
        );
        box.position.set(0, 5.4, 2.2);
        sigGroup.add(box);

        // 3 Lamps: Red, Yellow, Green
        const rLamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), new THREE.MeshBasicMaterial({ color: 0x7f1d1d }));
        rLamp.position.set(0, 6.0, 2.55);
        sigGroup.add(rLamp);

        const yLamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), new THREE.MeshBasicMaterial({ color: 0x78350f }));
        yLamp.position.set(0, 5.4, 2.55);
        sigGroup.add(yLamp);

        const gLamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), new THREE.MeshBasicMaterial({ color: 0x064e3b }));
        gLamp.position.set(0, 4.8, 2.55);
        sigGroup.add(gLamp);

        sigGroup.position.set(si.x + corner.ox, 0, si.z + corner.oz);
        sigGroup.rotation.y = corner.rot;
        scene.add(sigGroup);

        trafficSignals.push({
          rLamp,
          yLamp,
          gLamp,
          avenue: corner.avenue,
          ix: si.x,
          iz: si.z
        });
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 6C. ANIMATED 3D CITIZEN PEDESTRIANS ON FOOTPATHS
    // ─────────────────────────────────────────────────────────────
    const pedestrians = [];
    const pedShirtColors = [0x2563eb, 0xdc2626, 0x16a34a, 0xeab308, 0x9333ea, 0x0d9488];
    const pedCoords = [
      { x: -69, z: -48, axis: 'x', min: -85, max: -53, speed: 0.045 },
      { x: -23, z: -48, axis: 'x', min: -39, max: -7, speed: 0.05 },
      { x: 23, z: -48, axis: 'x', min: 7, max: 39, speed: 0.048 },
      { x: 69, z: -48, axis: 'x', min: 53, max: 85, speed: 0.052 },
      { x: -48, z: -69, axis: 'z', min: -85, max: -53, speed: 0.046 },
      { x: -48, z: -23, axis: 'z', min: -39, max: -7, speed: 0.05 },
      { x: -48, z: 23, axis: 'z', min: 7, max: 39, speed: 0.044 },
      { x: -48, z: 69, axis: 'z', min: 53, max: 85, speed: 0.05 },
      { x: 48, z: -69, axis: 'z', min: -85, max: -53, speed: 0.047 },
      { x: 48, z: -23, axis: 'z', min: -39, max: -7, speed: 0.051 },
      { x: 48, z: 23, axis: 'z', min: 7, max: 39, speed: 0.045 },
      { x: 48, z: 69, axis: 'z', min: 53, max: 85, speed: 0.048 }
    ];

    pedCoords.forEach((pc, idx) => {
      const pedGroup = new THREE.Group();
      // Torso
      const shirtMat = new THREE.MeshLambertMaterial({ color: pedShirtColors[idx % pedShirtColors.length] });
      const pTorso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), shirtMat);
      pTorso.position.y = 1.05;
      pTorso.castShadow = true;
      pedGroup.add(pTorso);

      // Head
      const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshLambertMaterial({ color: 0xd4a373 }));
      pHead.position.y = 1.62;
      pedGroup.add(pHead);

      // Articulated Legs
      const legMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const legGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.65, 8);
      const pLegL = new THREE.Mesh(legGeo, legMat); pLegL.position.set(-0.16, 0.35, 0); pedGroup.add(pLegL);
      const pLegR = new THREE.Mesh(legGeo, legMat); pLegR.position.set(0.16, 0.35, 0); pedGroup.add(pLegR);

      // Articulated Arms
      const armMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 });
      const armGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8);
      const pArmL = new THREE.Mesh(armGeo, armMat); pArmL.position.set(-0.36, 1.05, 0); pedGroup.add(pArmL);
      const pArmR = new THREE.Mesh(armGeo, armMat); pArmR.position.set(0.36, 1.05, 0); pedGroup.add(pArmR);

      pedGroup.position.set(pc.x, 0.38, pc.z);
      scene.add(pedGroup);

      pedestrians.push({
        group: pedGroup,
        legL: pLegL,
        legR: pLegR,
        armL: pArmL,
        armR: pArmR,
        axis: pc.axis,
        min: pc.min,
        max: pc.max,
        speed: pc.speed,
        dir: 1,
        phase: idx * 0.8
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 7. SUCTION DEBRIS & CRASH PARTICLE SYSTEMS
    // ─────────────────────────────────────────────────────────────
    const particleCount = 40;
    const particleGeo = new THREE.DodecahedronGeometry(0.2, 0);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const particleGroup = new THREE.Group();
    const particles = [];

    for (let p = 0; p < particleCount; p++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      pMesh.visible = false;
      particleGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        progress: 0,
        speed: 0.04 + Math.random() * 0.04,
        offset: new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5)
      });
    }
    scene.add(particleGroup);

    // Crash Sparks
    const crashParticleCount = 25;
    const crashGeo = new THREE.DodecahedronGeometry(0.25, 0);
    const crashMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const crashGroup = new THREE.Group();
    const crashParticles = [];
    for (let c = 0; c < crashParticleCount; c++) {
      const cm = new THREE.Mesh(crashGeo, crashMat);
      cm.visible = false;
      crashGroup.add(cm);
      crashParticles.push({
        mesh: cm,
        vel: new THREE.Vector3(),
        life: 0
      });
    }
    scene.add(crashGroup);

    // ─────────────────────────────────────────────────────────────
    // 8. HEAVY 3-AXLE GARBAGE COMPACTOR TRUCK
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();

    // Driver Cab
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 2.4, 2.4),
      new THREE.MeshLambertMaterial({ color: 0xf8fafc })
    );
    cab.position.set(0, 1.6, 2.1);
    cab.castShadow = true;
    truckGroup.add(cab);

    // Windshield
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.15, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    windshield.position.set(0, 2.05, 3.32);
    truckGroup.add(windshield);

    // Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.2, 0.6, 0.3);
    const mirrorMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    [-1.5, 1.5].forEach((mx) => {
      const m = new THREE.Mesh(mirrorGeo, mirrorMat);
      m.position.set(mx, 2.0, 2.3);
      truckGroup.add(m);
    });

    // Grille & Bumper
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    grille.position.set(0, 1.1, 3.32);
    truckGroup.add(grille);

    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.45, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    bumper.position.set(0, 0.65, 3.4);
    truckGroup.add(bumper);

    // Flashing Strobe Bar
    const strobeBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    strobeBar.position.set(0, 2.92, 2.1);
    truckGroup.add(strobeBar);

    // Air Horns
    const hornGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.8, 8);
    const hornMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    [-0.5, 0.5].forEach((hx) => {
      const hn = new THREE.Mesh(hornGeo, hornMat);
      hn.rotation.x = Math.PI / 2;
      hn.position.set(hx, 2.95, 2.6);
      truckGroup.add(hn);
    });

    // Compactor Body
    const compactor = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 2.7, 5.0),
      new THREE.MeshLambertMaterial({ color: 0x105a39 })
    );
    compactor.position.set(0, 1.85, -1.8);
    compactor.castShadow = true;
    truckGroup.add(compactor);

    // Hazard Caution Strip
    const hazardStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.2, 4.8),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
    );
    hazardStrip.position.set(0, 2.9, -1.8);
    truckGroup.add(hazardStrip);

    // Tailgate
    const tailgate = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.6, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x064e3b })
    );
    tailgate.position.set(0, 1.3, -4.4);
    truckGroup.add(tailgate);

    // Headlights
    const hlLeft = new THREE.SpotLight(0xffedd5, 4.0, 35, Math.PI / 6, 0.4);
    hlLeft.position.set(-0.9, 1.5, 3.4);
    hlLeft.target.position.set(-0.9, 0, 25);
    truckGroup.add(hlLeft);
    truckGroup.add(hlLeft.target);

    const hlRight = new THREE.SpotLight(0xffedd5, 4.0, 35, Math.PI / 6, 0.4);
    hlRight.position.set(0.9, 1.5, 3.4);
    hlRight.target.position.set(0.9, 0, 25);
    truckGroup.add(hlRight);
    truckGroup.add(hlRight.target);

    // 6 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.55, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const wheels = [];
    [
      { x: -1.5, y: 0.7, z: 2.1 }, { x: 1.5, y: 0.7, z: 2.1 },
      { x: -1.5, y: 0.7, z: -1.3 }, { x: 1.5, y: 0.7, z: -1.3 },
      { x: -1.5, y: 0.7, z: -3.1 }, { x: 1.5, y: 0.7, z: -3.1 }
    ].forEach((wp) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wp.x, wp.y, wp.z);
      w.castShadow = true;
      truckGroup.add(w);
      wheels.push(w);
    });

    truckGroup.position.set(0, 0, 0);
    scene.add(truckGroup);

    // ─────────────────────────────────────────────────────────────
    // 9. SANITATION WORKER NPC (Gets down from truck & empties dustbin)
    // ─────────────────────────────────────────────────────────────
    const workerGroup = new THREE.Group();

    // Torso with Safety Vest
    const vestMat = new THREE.MeshLambertMaterial({ color: 0xf97316 }); // Municipal Safety Orange
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.4), vestMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    workerGroup.add(torso);

    const reflectiveStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.12, 0.42),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    reflectiveStripe.position.y = 1.15;
    workerGroup.add(reflectiveStripe);

    // Head with Hard Hat
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a373 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinMat);
    head.position.y = 1.78;
    workerGroup.add(head);

    const helmet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.15, 12),
      new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    helmet.position.y = 1.94;
    workerGroup.add(helmet);

    // Articulated Arms
    const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.44, 1.15, 0);
    workerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.44, 1.15, 0);
    workerGroup.add(rightArm);

    // Articulated Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.2, 0.38, 0);
    workerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.2, 0.38, 0);
    workerGroup.add(rightLeg);

    workerGroup.visible = false;
    scene.add(workerGroup);

    let workerPhase = 'inside_truck'; // 'inside_truck' | 'walking_to_bin' | 'at_bin' | 'walking_back'

    // ─────────────────────────────────────────────────────────────
    // 10. SLOW & REALISTIC TRAFFIC PASSENGER CARS
    // ─────────────────────────────────────────────────────────────
    const trafficCars = [];
    const carColors = [0x0f172a, 0xf8fafc, 0x1d4ed8, 0xb91c1c, 0x475569];

    const createCarModel = (colorHex) => {
      const car = new THREE.Group();

      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.75, 4.2),
        new THREE.MeshLambertMaterial({ color: colorHex })
      );
      chassis.position.y = 0.65;
      chassis.castShadow = true;
      car.add(chassis);

      const cabinTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.65, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      cabinTop.position.set(0, 1.25, -0.2);
      car.add(cabinTop);

      const frontGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 0.65),
        new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
      );
      frontGlass.rotation.x = -Math.PI / 4;
      frontGlass.position.set(0, 1.2, 0.95);
      car.add(frontGlass);

      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.2, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffedd5 })
      );
      hl.position.set(0, 0.65, 2.12);
      car.add(hl);

      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.2, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      tl.position.set(0, 0.65, -2.12);
      car.add(tl);

      const carWheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12);
      const carWheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      [
        { x: -1.1, z: 1.2 }, { x: 1.1, z: 1.2 },
        { x: -1.1, z: -1.2 }, { x: 1.1, z: -1.2 }
      ].forEach((wp) => {
        const cw = new THREE.Mesh(carWheelGeo, carWheelMat);
        cw.rotation.z = Math.PI / 2;
        cw.position.set(wp.x, 0.42, wp.z);
        car.add(cw);
      });

      return { car, taillight: tl };
    };

    // Holographic Vector Field Ring under truck
    const vectorFieldGeo = new THREE.RingGeometry(13.5, 14.2, 48);
    const vectorFieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const vectorFieldRing = new THREE.Mesh(vectorFieldGeo, vectorFieldMat);
    vectorFieldRing.rotation.x = -Math.PI / 2;
    vectorFieldRing.position.y = 0.04;
    truckGroup.add(vectorFieldRing);

    // Calm city speeds
    const trafficData = [
      { avenue: 'h', line: -46, dir: 1, speed: 0.14, x: -70, z: -46 + 3.2 },
      { avenue: 'h', line: 46, dir: -1, speed: 0.13, x: 70, z: 46 - 3.2 },
      { avenue: 'v', line: -46, dir: 1, speed: 0.15, x: -46 + 3.2, z: -80 },
      { avenue: 'v', line: 46, dir: -1, speed: 0.14, x: 46 - 3.2, z: 80 },
      { avenue: 'h', line: 0, dir: 1, speed: 0.15, x: -90, z: 3.2 },
      { avenue: 'v', line: 0, dir: -1, speed: 0.13, x: -3.2, z: 90 }
    ];

    trafficData.forEach((td, idx) => {
      const carObj = createCarModel(carColors[idx % carColors.length]);
      carObj.car.position.set(td.x, 0, td.z);
      carObj.car.rotation.y = td.avenue === 'h' ? (td.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (td.dir > 0 ? 0 : Math.PI);
      scene.add(carObj.car);
      trafficCars.push({
        group: carObj.car,
        taillight: carObj.taillight,
        avenue: td.avenue,
        line: td.line,
        dir: td.dir,
        baseSpeed: td.speed,
        currentSpeed: td.speed,
        x: td.x,
        z: td.z
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 11. FINITE CONTROL PHYSICS (0-30 KM/H STRICT CAP & SMOOTH TURNING)
    // ─────────────────────────────────────────────────────────────
    const halfRoad = roadWidth / 2 - 0.4;
    const isPointOnRoad = (px, pz) => {
      const onH = roadLines.some((rz) => Math.abs(pz - rz) <= halfRoad);
      const onV = roadLines.some((rx) => Math.abs(px - rx) <= halfRoad);
      const onDumpYard = (Math.abs(px - dumpyardPos.x) <= 20 && Math.abs(pz - dumpyardPos.z) <= 16);
      return onH || onV || onDumpYard;
    };

    const keys = { forward: false, backward: false, left: false, right: false, nitro: false };
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = true;
      if (k === 's' || k === 'arrowdown') keys.backward = true;
      if (k === 'a' || k === 'arrowleft') keys.left = true;
      if (k === 'd' || k === 'arrowright') keys.right = true;
      if (e.key === 'Shift') {
        if (citizenLevelRef.current >= 3) {
          keys.nitro = true;
          setNitroActive(true);
          playSound('nitro');
        }
      }
      if (k === 'h') playSound('horn');
      if (k === 'e' || k === ' ') {
        isHoldingCollectRef.current = true;
        setIsHoldingCollect(true);
      }
      if (k === 'r' && isCrashedRef.current) handleManualRespawn();
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = false;
      if (k === 's' || k === 'arrowdown') keys.backward = false;
      if (k === 'a' || k === 'arrowleft') keys.left = false;
      if (k === 'd' || k === 'arrowright') keys.right = false;
      if (e.key === 'Shift') {
        keys.nitro = false;
        setNitroActive(false);
      }
      if (k === 'e' || k === ' ') {
        isHoldingCollectRef.current = false;
        setIsHoldingCollect(false);
      }
    };

    // Mouse Left-Click Hold Handlers
    const onMouseDown = (e) => {
      if (e.button === 0) {
        isHoldingCollectRef.current = true;
        setIsHoldingCollect(true);
      }
    };
    const onMouseUp = (e) => {
      if (e.button === 0) {
        isHoldingCollectRef.current = false;
        setIsHoldingCollect(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Tuned Driving Physics (Strict 0-30 KM/H Finite Cap, Heavy Realistic Steering)
    let truckSpeed = 0;
    const maxSpeed = 0.20;       // Finite Cap: Exactly 30 KM/H
    const acceleration = 0.007;  // Gentle, steady acceleration
    const deceleration = 0.016;  // Progressive braking
    const turnSpeed = 0.024;     // Smooth, non-snappy gradual turning
    let truckAngle = 0;

    let activeCollectionBin = null;
    let collectionTimer = 0;
    const COLLECTION_DURATION = 2.5;

    // Respawn Procedure (Zero Progress Lost)
    const resetTruck = (reason = "Route Repaired") => {
      let bestX = 0, bestZ = 0, minD = 99999;
      roadLines.forEach((rx) => {
        roadLines.forEach((rz) => {
          const d = Math.hypot(truckGroup.position.x - rx, truckGroup.position.z - rz);
          if (d < minD && Math.abs(rx) < fenceLimit - 10 && Math.abs(rz) < fenceLimit - 10) {
            minD = d;
            bestX = rx;
            bestZ = rz;
          }
        });
      });

      truckGroup.position.set(bestX, 0, bestZ);
      truckAngle = 0;
      truckSpeed = 0;
      truckGroup.rotation.y = 0;
      isCrashedRef.current = false;
      setCrashState(null);
      setNotification(`✅ ${reason}: Truck repositioned. All collected bins & load intact!`);
    };
    resetTruckTriggerRef.current = resetTruck;

    const triggerCrash = (obstacleName = "Traffic Vehicle") => {
      if (isCrashedRef.current) return;
      isCrashedRef.current = true;
      playSound('crash');
      cameraShakeRef.current = 0.55;

      const hitPos = truckGroup.position.clone();
      crashParticles.forEach((cp) => {
        cp.mesh.visible = true;
        cp.mesh.position.copy(hitPos);
        cp.vel.set(
          (Math.random() - 0.5) * 0.45,
          Math.random() * 0.4 + 0.15,
          (Math.random() - 0.5) * 0.45
        );
        cp.life = 1.0;
      });

      setLives((prev) => {
        const rem = Math.max(0, prev - 1);
        livesRef.current = rem;
        return rem;
      });

      setCrashState({
        message: `COLLIDED WITH ${obstacleName.toUpperCase()}!`,
        countdown: 2
      });

      setTimeout(() => {
        resetTruck(`Vehicle Repaired after Collision with ${obstacleName}`);
      }, 2000);
    };

    // ─────────────────────────────────────────────────────────────
    // 12. MAIN ANIMATION & GAME LOOP
    // ─────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();
    let radarTick = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (isCrashedRef.current) {
        truckSpeed = 0;
        crashParticles.forEach((cp) => {
          if (cp.life > 0) {
            cp.mesh.position.add(cp.vel);
            cp.vel.y -= 0.015;
            cp.life -= delta * 1.5;
            cp.mesh.scale.setScalar(Math.max(0.1, cp.life));
            if (cp.life <= 0) cp.mesh.visible = false;
          }
        });
      } else {
        // Animate Playground Swings (Jhula) in Botanical Gardens
        animatedSwings.forEach((sw) => {
          if (sw.pivot) {
            sw.pivot.rotation.x = Math.sin(time * 2.8 + sw.offset) * 0.38;
          }
        });

        // Animate Pedestrians Patrol Walking on Footpaths
        pedestrians.forEach((ped) => {
          if (ped.axis === 'x') {
            ped.x += ped.dir * ped.speed;
            if (ped.x > ped.max) { ped.x = ped.max; ped.dir = -1; ped.group.rotation.y = -Math.PI / 2; }
            if (ped.x < ped.min) { ped.x = ped.min; ped.dir = 1; ped.group.rotation.y = Math.PI / 2; }
            ped.group.position.x = ped.x;
          } else {
            ped.z += ped.dir * ped.speed;
            if (ped.z > ped.max) { ped.z = ped.max; ped.dir = -1; ped.group.rotation.y = Math.PI; }
            if (ped.z < ped.min) { ped.z = ped.min; ped.dir = 1; ped.group.rotation.y = 0; }
            ped.group.position.z = ped.z;
          }
          // Limb swing
          ped.legL.rotation.x = Math.sin(time * 8 + ped.phase) * 0.55;
          ped.legR.rotation.x = -Math.sin(time * 8 + ped.phase) * 0.55;
          ped.armL.rotation.x = -Math.sin(time * 8 + ped.phase) * 0.45;
          ped.armR.rotation.x = Math.sin(time * 8 + ped.phase) * 0.45;
        });

        // Cycle 3D Traffic Light Intersections
        const cycleTime = (time * 0.35) % 12; // 12-second total cycle
        trafficSignals.forEach((sig) => {
          let isGreen = false;
          if (sig.avenue === 'ns') {
            // North-South Green (0 - 5.5s), Yellow (5.5 - 6.5s), Red (6.5 - 12s)
            if (cycleTime < 5.5) {
              sig.rLamp.material.color.setHex(0x7f1d1d);
              sig.yLamp.material.color.setHex(0x78350f);
              sig.gLamp.material.color.setHex(0x10b981);
              isGreen = true;
            } else if (cycleTime < 6.5) {
              sig.rLamp.material.color.setHex(0x7f1d1d);
              sig.yLamp.material.color.setHex(0xf59e0b);
              sig.gLamp.material.color.setHex(0x064e3b);
            } else {
              sig.rLamp.material.color.setHex(0xef4444);
              sig.yLamp.material.color.setHex(0x78350f);
              sig.gLamp.material.color.setHex(0x064e3b);
            }
          } else {
            // East-West Red (0 - 6.0s), Green (6.0 - 11.0s), Yellow (11.0 - 12.0s)
            if (cycleTime < 6.0) {
              sig.rLamp.material.color.setHex(0xef4444);
              sig.yLamp.material.color.setHex(0x78350f);
              sig.gLamp.material.color.setHex(0x064e3b);
            } else if (cycleTime < 11.0) {
              sig.rLamp.material.color.setHex(0x7f1d1d);
              sig.yLamp.material.color.setHex(0x78350f);
              sig.gLamp.material.color.setHex(0x10b981);
              isGreen = true;
            } else {
              sig.rLamp.material.color.setHex(0x7f1d1d);
              sig.yLamp.material.color.setHex(0xf59e0b);
              sig.gLamp.material.color.setHex(0x064e3b);
            }
          }
        });

        // Combined Driving Input (Keyboard + Mobile On-Screen Controls)
        const isFwd = keys.forward || mobileKeysRef.current.forward;
        const isBwd = keys.backward || mobileKeysRef.current.backward;
        const isLft = keys.left || mobileKeysRef.current.left;
        const isRgt = keys.right || mobileKeysRef.current.right;
        const isNitro = (keys.nitro || mobileKeysRef.current.nitro) && (citizenLevelRef.current >= 3);

        const currentMaxSpeed = isNitro ? 0.28 : maxSpeed;

        if (isFwd) {
          truckSpeed = Math.min(currentMaxSpeed, truckSpeed + acceleration);
        } else if (isBwd) {
          truckSpeed = Math.max(-currentMaxSpeed * 0.5, truckSpeed - acceleration);
        } else {
          if (truckSpeed > 0) truckSpeed = Math.max(0, truckSpeed - deceleration);
          else if (truckSpeed < 0) truckSpeed = Math.min(0, truckSpeed + deceleration);
        }

        if (Math.abs(truckSpeed) > 0.005) {
          const dir = truckSpeed > 0 ? 1 : -1;
          if (isLft) truckAngle += turnSpeed * dir;
          if (isRgt) truckAngle -= turnSpeed * dir;
        }

        const nextX = truckGroup.position.x + Math.sin(truckAngle) * truckSpeed;
        const nextZ = truckGroup.position.z + Math.cos(truckAngle) * truckSpeed;

        // Perimeter Check
        if (Math.abs(nextX) >= fenceLimit - 2 || Math.abs(nextZ) >= fenceLimit - 2) {
          if (Math.abs(truckSpeed) > 0.16) {
            triggerCrash("Perimeter Security Fence");
          } else {
            truckSpeed = 0;
          }
        } else if (isPointOnRoad(nextX, nextZ)) {
          truckGroup.position.x = nextX;
          truckGroup.position.z = nextZ;
        } else {
          // Smooth wall glide
          if (isPointOnRoad(nextX, truckGroup.position.z)) {
            truckGroup.position.x = nextX;
            truckSpeed *= 0.85;
          } else if (isPointOnRoad(truckGroup.position.x, nextZ)) {
            truckGroup.position.z = nextZ;
            truckSpeed *= 0.85;
          } else {
            if (Math.abs(truckSpeed) > 0.18) {
              triggerCrash("Sidewalk Curb / Building");
            } else {
              truckSpeed = 0;
            }
          }
        }

        truckGroup.rotation.y = truckAngle;

        // Wheel Rotation
        if (Math.abs(truckSpeed) > 0.02) {
          wheels.forEach((w) => (w.rotation.x += truckSpeed * 2.2));
          truckGroup.position.y = Math.sin(time * 16) * 0.02;
        } else {
          truckGroup.position.y = 0;
        }

        // Strict 0 - 30 KM/H Speedometer (or up to 42 KM/H with Nitro)
        const speedKmh = Math.min(isNitro ? 42 : 30, Math.round((Math.abs(truckSpeed) / maxSpeed) * 30));
        setCurrentSpeed(speedKmh);
      }

      // Flash Roof Strobe & Pulse Vector Field Ring (Golden strobe for Level >= 5)
      const strobeColor = (citizenLevelRef.current >= 5) 
        ? ((Math.sin(time * 20) > 0) ? 0xfbbf24 : 0xe2fd00)
        : ((Math.sin(time * 16) > 0) ? 0xf59e0b : 0xffffff);
      strobeBar.material.color.setHex(strobeColor);

      if (vectorFieldRing) {
        vectorFieldRing.material.opacity = (citizenLevelRef.current >= 4) ? 0.45 : 0.22 + Math.sin(time * 3.5) * 0.12;
        vectorFieldRing.rotation.z += 0.005;
      }

      // Gently sway grapple claw over dumpyard scrap heap
      if (grapple) {
        grapple.position.x = Math.sin(time * 1.5) * 1.4;
      }

      // ─────────────────────────────────────────────────────────────
      // 13. TRAFFIC SIMULATION & SMART VECTOR FIELD PROXIMITY BRAKING
      // ─────────────────────────────────────────────────────────────
      const VECTOR_FIELD_RADIUS = 28.0;
      const FULL_STOP_DISTANCE = 8.5;

      trafficCars.forEach((tc) => {
        const distToTruck = Math.hypot(truckGroup.position.x - tc.x, truckGroup.position.z - tc.z);
        let targetCarSpeed = tc.baseSpeed;

        if (distToTruck < FULL_STOP_DISTANCE) {
          targetCarSpeed = 0;
          if (tc.taillight) tc.taillight.material.color.setHex(0xff0000);
        } else if (distToTruck < VECTOR_FIELD_RADIUS) {
          const ratio = (distToTruck - FULL_STOP_DISTANCE) / (VECTOR_FIELD_RADIUS - FULL_STOP_DISTANCE);
          targetCarSpeed = tc.baseSpeed * Math.max(0.04, ratio * ratio);
          if (tc.taillight) tc.taillight.material.color.setHex(0xef4444);
        } else {
          targetCarSpeed = tc.baseSpeed;
          if (tc.taillight) tc.taillight.material.color.setHex(0x7f1d1d);
        }

        tc.currentSpeed += (targetCarSpeed - tc.currentSpeed) * 0.16;

        if (tc.avenue === 'h') {
          tc.x += tc.dir * tc.currentSpeed;
          if (tc.x > fenceLimit - 6) tc.x = -fenceLimit + 6;
          if (tc.x < -fenceLimit + 6) tc.x = fenceLimit - 6;
          tc.group.position.x = tc.x;
        } else {
          tc.z += tc.dir * tc.currentSpeed;
          if (tc.z > fenceLimit - 6) tc.z = -fenceLimit + 6;
          if (tc.z < -fenceLimit + 6) tc.z = fenceLimit - 6;
          tc.group.position.z = tc.z;
        }

        // Only player ramming causes crash
        if (!isCrashedRef.current) {
          if (Math.abs(truckSpeed) > 0.14 && distToTruck < 3.2) {
            triggerCrash("Traffic Vehicle");
          }
        }
      });

      // ─────────────────────────────────────────────────────────────
      // 14. SANITATION WORKER ANIMATION & HOLD LEFT-CLICK TO EMPTY
      // ─────────────────────────────────────────────────────────────
      const stoppedNearBin = smartBins.find(
        (b) => !b.collected && Math.hypot(truckGroup.position.x - b.x, truckGroup.position.z - b.z) < 7.5
      );

      if (stoppedNearBin && Math.abs(truckSpeed) < 0.05 && !isCrashedRef.current) {
        activeCollectionBin = stoppedNearBin.id;
        setCollectingBinId(stoppedNearBin.id);

        const doorPos = new THREE.Vector3(1.8, 0, 1.4).applyMatrix4(truckGroup.matrixWorld);
        const binTargetPos = new THREE.Vector3(stoppedNearBin.x, 0, stoppedNearBin.z + 1.2);

        if (workerPhase === 'inside_truck') {
          // Worker gets down from passenger door
          workerGroup.position.copy(doorPos);
          workerGroup.visible = true;
          workerPhase = 'walking_to_bin';
        }

        if (workerPhase === 'walking_to_bin') {
          // Walk to bin
          workerGroup.position.lerp(binTargetPos, 0.08);
          workerGroup.lookAt(stoppedNearBin.x, 0, stoppedNearBin.z);
          // Leg swing
          leftLeg.rotation.x = Math.sin(time * 14) * 0.6;
          rightLeg.rotation.x = -Math.sin(time * 14) * 0.6;
          leftArm.rotation.x = -Math.sin(time * 14) * 0.6;
          rightArm.rotation.x = Math.sin(time * 14) * 0.6;

          if (workerGroup.position.distanceTo(binTargetPos) < 0.8) {
            workerPhase = 'at_bin';
            setIsWorkerAtBin(true);
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
          }
        }

        if (workerPhase === 'at_bin') {
          // Standing at bin. Check if user is HOLDING LEFT CLICK
          if (isHoldingCollectRef.current) {
            // Worker tilts bin backwards towards truck!
            stoppedNearBin.group.rotation.x = -0.42;
            leftArm.rotation.x = -1.2;
            rightArm.rotation.x = -1.2;

            // Superpower: Level 2 Turbo Suction cuts emptying time to 1.4s
            const currentDuration = (citizenLevelRef.current >= 2) ? 1.4 : COLLECTION_DURATION;
            collectionTimer += delta;
            const progressPct = Math.min(100, Math.round((collectionTimer / currentDuration) * 100));
            setCollectProgress(progressPct);

            playSound('suction');

            // Debris flying particles
            const binPos = new THREE.Vector3(stoppedNearBin.x, 2.0, stoppedNearBin.z);
            const compactorPos = new THREE.Vector3(0, 1.8, -2.4).applyMatrix4(truckGroup.matrixWorld);

            particles.forEach((p) => {
              p.mesh.visible = true;
              p.progress = (p.progress + p.speed) % 1;
              p.mesh.position.lerpVectors(binPos, compactorPos, p.progress);
              p.mesh.position.addScaledVector(p.offset, (1 - p.progress) * 0.5);
            });

            if (collectionTimer >= currentDuration) {
              // 100% Emptied!
              stoppedNearBin.collected = true;
              stoppedNearBin.group.rotation.x = 0; // Return bin upright
              stoppedNearBin.beacon.material.color.setHex(0x10b981);
              stoppedNearBin.column.material.color.setHex(0x10b981);
              stoppedNearBin.body.material.color.setHex(0x10b981);

              playSound('collect');

              particles.forEach((p) => (p.mesh.visible = false));
              collectionTimer = 0;
              setCollectProgress(0);

              if (stoppedNearBin.feature) {
                setActiveFeatureSpotlight(stoppedNearBin.feature);
                setDiscoveredFeatures((prev) => {
                  if (!prev.includes(stoppedNearBin.feature.id)) return [...prev, stoppedNearBin.feature.id];
                  return prev;
                });
              }

              // Superpower: Level 5 grants 2x Multiplier (+200 pts)
              const earnedPts = (citizenLevelRef.current >= 5) ? 200 : 100;

              setWasteCollected((prev) => {
                const nextVal = prev + 1;
                wasteCollectedRef.current = nextVal;
                if (nextVal >= smartBins.length) {
                  setNotification("🚀 ALL 6 BINS COLLECTED! Proceed to northern Municipal Dumpyard to finish!");
                } else {
                  setNotification(`✅ Emptied Spot #${stoppedNearBin.id}! (+25kg waste, +${earnedPts} Eco-Points)`);
                }
                return nextVal;
              });

              setCurrentLoad((prev) => {
                const nextLoad = Math.min(truckCapacity, prev + 25);
                currentLoadRef.current = nextLoad;
                return nextLoad;
              });

              setEcoPoints((prev) => {
                const nextPts = prev + earnedPts;
                ecoPointsRef.current = nextPts;
                return nextPts;
              });

              // Save to Database (No data loss)
              saveCitizenPoints(earnedPts);

              workerPhase = 'walking_back';
            }
          } else {
            // User not holding click: bin rests upright
            stoppedNearBin.group.rotation.x = 0;
            leftArm.rotation.x = -0.3;
            rightArm.rotation.x = -0.3;
            particles.forEach((p) => (p.mesh.visible = false));
          }
        }

        if (workerPhase === 'walking_back') {
          // Worker walks back to truck door
          workerGroup.position.lerp(doorPos, 0.08);
          workerGroup.lookAt(doorPos.x, 0, doorPos.z);
          leftLeg.rotation.x = Math.sin(time * 14) * 0.6;
          rightLeg.rotation.x = -Math.sin(time * 14) * 0.6;
          leftArm.rotation.x = -Math.sin(time * 14) * 0.6;
          rightArm.rotation.x = Math.sin(time * 14) * 0.6;

          if (workerGroup.position.distanceTo(doorPos) < 0.9) {
            workerGroup.visible = false;
            workerPhase = 'inside_truck';
            setIsWorkerAtBin(false);
            setCollectingBinId(null);
          }
        }

      } else {
        // Truck drove away
        if (workerPhase !== 'inside_truck') {
          workerGroup.visible = false;
          workerPhase = 'inside_truck';
          setIsWorkerAtBin(false);
          setCollectingBinId(null);
          setCollectProgress(0);
          collectionTimer = 0;
          particles.forEach((p) => (p.mesh.visible = false));
          if (stoppedNearBin) stoppedNearBin.group.rotation.x = 0;
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 15. DUMPYARD UNLOADING & VICTORY SHIFT TRIGGER
      // ─────────────────────────────────────────────────────────────
      const distToDumpyard = Math.hypot(truckGroup.position.x - dumpyardPos.x, truckGroup.position.z - dumpyardPos.z);
      if (distToDumpyard < 14.0 && currentLoadRef.current > 0 && Math.abs(truckSpeed) < 0.05 && !isCrashedRef.current) {
        playSound('dump');
        setCurrentLoad(0);
        currentLoadRef.current = 0;
        const bonusPts = (citizenLevelRef.current >= 5) ? 1000 : 500;
        setEcoPoints((prev) => {
          const next = prev + bonusPts;
          ecoPointsRef.current = next;
          return next;
        });
        saveCitizenPoints(bonusPts);
        setMissionComplete(true);
        setNotification(`🏆 SHIFT COMPLETE: All waste processed at Municipal Facility! (+${bonusPts} Bonus Points)`);
      }

      // ─────────────────────────────────────────────────────────────
      // 16. GTA-STYLE RADAR DATA SYNC
      // ─────────────────────────────────────────────────────────────
      radarTick++;
      if (radarTick % 3 === 0) {
        const nextTargetBin = smartBins.find((b) => !b.collected);
        let tgtX = dumpyardPos.x;
        let tgtZ = dumpyardPos.z;
        let tgtLabel = "Municipal Dumpyard (Disposal)";

        if (nextTargetBin) {
          tgtX = nextTargetBin.x;
          tgtZ = nextTargetBin.z;
          tgtLabel = `Spot #${nextTargetBin.id}: ${nextTargetBin.category}`;
        }

        setCurrentTargetName(tgtLabel);
        const dTarget = Math.round(Math.hypot(truckGroup.position.x - tgtX, truckGroup.position.z - tgtZ));
        setTargetDistance(dTarget);

        setRadarData({
          playerX: truckGroup.position.x,
          playerZ: truckGroup.position.z,
          playerAngle: truckAngle,
          bins: smartBins.map((b) => ({ id: b.id, x: b.x, z: b.z, collected: b.collected, color: b.colorHex })),
          dumpyard: dumpyardPos,
          traffic: trafficCars.map((tc) => ({ x: tc.x, z: tc.z })),
          target: { x: tgtX, z: tgtZ, label: tgtLabel }
        });

        // ─────────────────────────────────────────────────────────────
        // GAME MODE: PROXIMITY INSPECTION FOR BUILDINGS & COMPONENTS
        // ─────────────────────────────────────────────────────────────
        if (gameModeRef.current === 'game') {
          const px = truckGroup.position.x;
          const pz = truckGroup.position.z;
          let nearestComp = null;
          let minDist = 24.0; // Proximity threshold in meters

          CITY_BUILDINGS_DATA.forEach((b) => {
            const d = Math.hypot(px - b.bx, pz - b.bz);
            if (d < minDist) {
              minDist = d;
              nearestComp = b;
            }
          });

          if (nearestComp) {
            if (activeBuildingRef.current?.id !== nearestComp.id) {
              activeBuildingRef.current = nearestComp;
              setActiveBuildingInfo(nearestComp);
              playSound('collect');

              if (!surveyedBuildingsRef.current.includes(nearestComp.id)) {
                surveyedBuildingsRef.current.push(nearestComp.id);
                setSurveyedBuildings([...surveyedBuildingsRef.current]);
                const auditPts = nearestComp.points || 25;
                setEcoPoints((prev) => {
                  const next = prev + auditPts;
                  ecoPointsRef.current = next;
                  return next;
                });
                saveCitizenPoints(auditPts);
                setNotification(`🎯 Audited ${nearestComp.name}! +${auditPts} Eco-Points! Click to open interactive module.`);
              }
            }
          } else {
            if (activeBuildingRef.current) {
              activeBuildingRef.current = null;
              setActiveBuildingInfo(null);
            }
          }
        } else {
          if (activeBuildingRef.current) {
            activeBuildingRef.current = null;
            setActiveBuildingInfo(null);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 17. CAMERA VIEWS WITH CRASH SCREEN-SHAKE
      // ─────────────────────────────────────────────────────────────
      const tPos = truckGroup.position;
      let shakeX = 0;
      let shakeY = 0;
      if (cameraShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * cameraShakeRef.current * 2.5;
        shakeY = (Math.random() - 0.5) * cameraShakeRef.current * 2.5;
        cameraShakeRef.current = Math.max(0, cameraShakeRef.current - delta * 1.8);
      }

      if (viewModeRef.current === 'chase') {
        const camDist = 18;
        const camHeight = 9.2;
        const targetCamX = tPos.x - Math.sin(truckAngle) * camDist;
        const targetCamZ = tPos.z - Math.cos(truckAngle) * camDist;

        camera.position.x += (targetCamX - camera.position.x) * 0.1 + shakeX;
        camera.position.y += (tPos.y + camHeight - camera.position.y) * 0.1 + shakeY;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        camera.lookAt(tPos.x, tPos.y + 2, tPos.z);
      } else if (viewModeRef.current === 'isometric') {
        camera.position.set(tPos.x + 36 + shakeX, 44 + shakeY, tPos.z + 36);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      } else {
        camera.position.set(tPos.x + shakeX, 85 + shakeY, tPos.z + 0.1);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden select-none font-sans">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ─────────────────────────────────────────────────────────────
          TOP STATUS BAR & DRIVER CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        
        {/* Left: Brand Badge & Mode Switcher */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center font-black">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm">SmartBin Fleet</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  0-30 KM/H
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">
                  {gameMode === 'game' ? 'Buildings Audited:' : 'Features Found:'}
                </span>
                <span className="text-[10px] font-extrabold text-[#e2fd00]">
                  {gameMode === 'game' ? `${surveyedBuildings.length} / ${CITY_BUILDINGS_DATA.length}` : `${discoveredFeatures.length} / 6`}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switch: Normal Mode vs Game Mode */}
          <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => handleToggleGameMode('normal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'normal'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck size={13} />
              <span>Normal Mode</span>
            </button>

            <button
              onClick={() => handleToggleGameMode('game')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'game'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Gamepad2 size={13} />
              <span>Game Mode</span>
              {gameMode === 'game' && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping ml-0.5" />
              )}
            </button>
          </div>

          {/* Citizen Status Pill (When logged in) */}
          {(() => {
            const citizen = getCitizenUser();
            if (!citizen) return null;
            return (
              <div className="hidden lg:flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[11px] text-white">
                <User size={13} className="text-emerald-400" />
                <span className="font-bold text-slate-300">{citizen.name || 'Citizen'}</span>
                <span className="text-[#e2fd00] font-black">+{ecoPoints} Pts</span>
              </div>
            );
          })()}
        </div>

        {/* Center: Real-time Notification Banner */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-900/90 text-white px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md text-xs pointer-events-auto max-w-lg truncate">
          <Sparkles size={14} className="text-[#e2fd00] shrink-0 animate-spin" />
          <span className="font-bold text-slate-200">{notification}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg flex gap-1">
            <button
              onClick={() => setViewMode('chase')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'chase' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chase
            </button>
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'isometric' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setViewMode('topdown')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'topdown' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 transition shadow-lg cursor-pointer"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-400" />}
          </button>

          {/* Truck Garage Shop Button */}
          <button
            onClick={() => setShowGarageShop(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
            title="Truck Shop: Buy new trucks with Eco-Points!"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Truck Shop</span>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 transition shadow-lg cursor-pointer"
            title="Controls & Mission Guide"
          >
            <HelpCircle size={16} />
          </button>

          {/* If Game Mode: Immediate Sign Out Button */}
          {gameMode === 'game' ? (
            <button
              onClick={handleSignOutImmediate}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase shadow-lg transition hover:scale-105 cursor-pointer flex items-center gap-1.5"
              title="Sign Out from Game Mode session immediately"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase shadow-lg transition hover:scale-105 cursor-pointer"
            >
              Exit Sim
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HOLD LEFT-CLICK INTERACTIVE PROMPT (When worker reaches bin)
          ───────────────────────────────────────────────────────────── */}
      {collectingBinId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white p-5 rounded-3xl border-2 border-emerald-400 shadow-2xl backdrop-blur-xl flex items-center gap-5 z-30 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#e2fd00] transition-all duration-150"
                strokeDasharray={`${collectProgress}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-xs text-white">{collectProgress}%</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[#e2fd00] text-xs font-bold uppercase tracking-wider">
              <UserCheck size={14} className="animate-bounce" />
              <span>Sanitation Worker Active at Spot #{collectingBinId}</span>
            </div>
            <h4 className="font-extrabold text-white text-base">
              {isHoldingCollect ? "Emptying Waste Into Compactor..." : "HOLD LEFT-CLICK (or SPACE / E)"}
            </h4>
            <p className="text-slate-300 text-xs mt-0.5">
              {isHoldingCollect 
                ? "Worker is tilting dustbin into rear hopper • Keep holding until 100%!" 
                : "Hold Left-Click to instruct worker to lift and empty bin into truck"}
            </p>
          </div>
          <button
            onMouseDown={() => { isHoldingCollectRef.current = true; setIsHoldingCollect(true); }}
            onMouseUp={() => { isHoldingCollectRef.current = false; setIsHoldingCollect(false); }}
            onTouchStart={() => { isHoldingCollectRef.current = true; setIsHoldingCollect(true); }}
            onTouchEnd={() => { isHoldingCollectRef.current = false; setIsHoldingCollect(false); }}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-lg cursor-pointer ${
              isHoldingCollect ? 'bg-[#e2fd00] text-slate-950 scale-105' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isHoldingCollect ? "HOLDING..." : "HOLD TO EMPTY"}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SMARTBIN PLATFORM FEATURE SPOTLIGHT MODAL
          ───────────────────────────────────────────────────────────── */}
      {activeFeatureSpotlight && (
        <div className="absolute top-24 right-6 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-emerald-500/80 rounded-3xl p-5 shadow-2xl z-40 text-white animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white"
                style={{ backgroundColor: activeFeatureSpotlight.color }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Spot #{activeFeatureSpotlight.id} • SmartBin Feature
                </span>
                <h4 className="font-black text-sm text-white leading-tight">
                  {activeFeatureSpotlight.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setActiveFeatureSpotlight(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs text-slate-300">
            <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
              {activeFeatureSpotlight.subtitle}
            </div>
            <p className="leading-relaxed text-slate-300">
              {activeFeatureSpotlight.description}
            </p>
            <div className="bg-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">{activeFeatureSpotlight.statLabel}:</span>
              <span className="text-[#e2fd00] font-black">{activeFeatureSpotlight.statValue}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <a
              href={activeFeatureSpotlight.route}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <span>Explore Feature in App</span>
              <ExternalLink size={12} />
            </a>
            <button
              onClick={() => setActiveFeatureSpotlight(null)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACCIDENT / CRASH OVERLAY (Progress 100% Preserved)
          ───────────────────────────────────────────────────────────── */}
      {crashState && (
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={36} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white">{crashState.message}</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Minor impact detected! Vehicle chassis safety system engaged.
              <span className="text-emerald-400 font-bold block mt-1.5">
                🛡️ Progress Preserved: {wasteCollected} of {totalBins} Bins Emptied ({currentLoad} kg load safe)
              </span>
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={handleManualRespawn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                Instant Respawn on Road
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GAME MODE: GTA-STYLE BUILDING & COMPONENT INSPECTION HUD
          ───────────────────────────────────────────────────────────── */}
      {gameMode === 'game' && activeBuildingInfo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 max-w-xl w-[92%] sm:w-auto bg-slate-950/95 text-white p-4 sm:p-5 rounded-3xl border-2 border-[#e2fd00] shadow-[0_0_30px_rgba(226,253,0,0.3)] backdrop-blur-xl z-30 animate-in slide-in-from-top-4 pointer-events-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-md"
                style={{
                  backgroundColor:
                    activeBuildingInfo.category === 'garden' ? '#15803d' :
                    activeBuildingInfo.category === 'cafe' ? '#b45309' :
                    activeBuildingInfo.category === 'residential' ? '#059669' :
                    activeBuildingInfo.category === 'landfill' ? '#0f766e' : '#0284c7'
                }}
              >
                {activeBuildingInfo.category === 'garden' && <Trees size={22} />}
                {activeBuildingInfo.category === 'cafe' && <Coffee size={22} />}
                {activeBuildingInfo.category === 'residential' && <Home size={22} />}
                {activeBuildingInfo.category === 'landfill' && <Flame size={22} />}
                {activeBuildingInfo.category === 'corporate' && <Building2 size={22} />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#e2fd00] text-slate-950 tracking-wider">
                    {activeBuildingInfo.tag}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    +{activeBuildingInfo.points} Eco-Points
                  </span>
                </div>
                <h4 className="font-black text-base sm:text-lg text-white leading-tight mt-0.5">
                  {activeBuildingInfo.name}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setActiveBuildingInfo(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <p className="leading-relaxed">
              {activeBuildingInfo.desc}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-white/5 text-[11px]">
              <span className="text-slate-400">
                Segregation: <strong className="text-white">{activeBuildingInfo.segregation}</strong>
              </span>
              <span className="text-[#e2fd00] font-black">
                Audited: {surveyedBuildings.length} / {CITY_BUILDINGS_DATA.length} City Zones
              </span>
            </div>

            {/* Click to open interactive piece button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowBuildingPieceModal(activeBuildingInfo)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>
                  {activeBuildingInfo.category === 'cafe' ? 'Open Cafe Composting & Voucher Hub' :
                   activeBuildingInfo.category === 'residential' ? 'Open Housing Society Waste Tracker' :
                   activeBuildingInfo.category === 'garden' ? 'Open Park Irrigation & Fountain Telemetry' :
                   activeBuildingInfo.category === 'landfill' ? 'Open Landfill Salvage & Scrap Station' :
                   activeBuildingInfo.id === 'block-16' ? 'Open Citizen Rewards Redemption' :
                   'Open Municipal Fleet GIS Module'}
                </span>
              </button>

              <button
                onClick={() => setActiveBuildingInfo(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Keep Driving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CITIZEN LOGIN REQUIRED MODAL (Before entering Game Mode)
          ───────────────────────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">CITIZEN LOGIN REQUIRED</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">नागरिक प्रमाणीकरण आवश्यक</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                <strong>Game Mode</strong> connects to your verified Citizen profile to record real-time municipal audits, describe every building & component, and earn redeemable Eco-Points.
              </p>
              
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-[11px]">
                  <Sparkles size={14} />
                  <span>Game Mode Interactive Features:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] font-medium">
                  <li>Detailed waste breakdown for every cafe, house, and corporate tower</li>
                  <li>Live GTA inspection HUD when driving near city blocks</li>
                  <li>Earn +25 to +50 Eco-Points per audited municipal zone</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  const demoCitizen = {
                    id: 108,
                    name: "Civic Explorer",
                    email: "citizen@smartbin.cg.gov.in",
                    role: "citizen",
                    city: "Durg-Bhilai",
                    eco_points: 250
                  };
                  localStorage.setItem('smartbin_user', JSON.stringify(demoCitizen));
                  setShowLoginModal(false);
                  setGameMode('game');
                  setNotification("✅ Logged in as Citizen #108! Game Mode activated with building audit tour.");
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles size={14} className="text-[#e2fd00]" />
                <span>Quick Citizen Demo Login (1-Click Start)</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/login?redirect=/city';
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={14} />
                <span>Sign In with Existing Citizen Account</span>
              </button>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold text-center cursor-pointer"
              >
                Continue in Normal Mode (Free Roam)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MISSION COMPLETE / SHIFT VICTORY MODAL
          ───────────────────────────────────────────────────────────── */}
      {missionComplete && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-[#e2fd00] flex items-center justify-center mx-auto">
              <Award size={44} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">🏆 MUNICIPAL SHIFT COMPLETED!</h2>
              <p className="text-slate-400 text-xs mt-1">
                All SmartBins emptied, platform features audited, and waste delivered to Central Landfill & Salvage Yard.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-2xl text-white">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bins Cleaned</span>
                <span className="text-xl font-black text-emerald-400">{wasteCollected} / {totalBins}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Points Earned</span>
                <span className="text-xl font-black text-[#e2fd00]">+{ecoPoints}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">City Rating</span>
                <span className="text-xl font-black text-amber-400">⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMissionComplete(false);
                  handleManualRespawn();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Start New Shift
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GTA-STYLE CIRCULAR MINI-MAP RADAR HUD (Bottom-Left)
          Fixed Arrow in Center (Always Points Up), Map Rotates Underneath!
          ───────────────────────────────────────────────────────────── */}
      {(() => {
        const mapRotationDeg = 180 + (radarData.playerAngle * 180 / Math.PI);
        const northAngleDeg = (180 + (radarData.playerAngle * 180 / Math.PI)) % 360;

        return (
          <div className="absolute bottom-6 left-6 z-30 pointer-events-auto flex flex-col gap-2">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-slate-950/95 border-4 border-slate-700/90 shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center">
              
              {/* Outer Compass North Marker (Rotates along radar rim to point to true North!) */}
              <div
                className="absolute inset-0 pointer-events-none z-20 flex items-start justify-center transition-transform duration-75"
                style={{ transform: `rotate(${northAngleDeg}deg)` }}
              >
                <span className="text-[11px] font-black text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)] mt-1.5">
                  N
                </span>
              </div>

              <svg className="w-full h-full" viewBox="-120 -120 240 240">
                <defs>
                  <clipPath id="gta-radar-clip">
                    <circle cx="0" cy="0" r="114" />
                  </clipPath>
                  <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0b1728" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#050a12" stopOpacity="1" />
                  </radialGradient>
                </defs>

                {/* Radar Background */}
                <circle cx="0" cy="0" r="116" fill="url(#radar-glow)" stroke="#1e293b" strokeWidth="2" />
                <circle cx="0" cy="0" r="75" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3, 3" />
                <circle cx="0" cy="0" r="40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3, 3" />

                {/* ── ROTATING WORLD MAP (GTA Vice City / San Andreas style) ── */}
                <g clipPath="url(#gta-radar-clip)">
                  <g transform={`rotate(${mapRotationDeg}) translate(${-radarData.playerX}, ${-radarData.playerZ})`}>
                    
                    {/* World Roads */}
                    {[-92, -46, 0, 46, 92].map((coord) => (
                      <React.Fragment key={coord}>
                        <line x1="-135" y1={coord} x2="135" y2={coord} stroke="#1e293b" strokeWidth="16" />
                        <line x1={coord} y1="-135" x2={coord} y2="135" stroke="#1e293b" strokeWidth="16" />
                        <line x1="-135" y1={coord} x2="135" y2={coord} stroke="#eab308" strokeWidth="1.0" strokeDasharray="4, 4" />
                        <line x1={coord} y1="-135" x2={coord} y2="135" stroke="#eab308" strokeWidth="1.0" strokeDasharray="4, 4" />
                      </React.Fragment>
                    ))}

                    {/* Building Blocks */}
                    {CITY_BUILDINGS_DATA.map((b) => {
                      if (b.category === 'landfill') return null;
                      const isG = b.category === 'garden';
                      const isC = b.category === 'cafe';
                      const isH = b.category === 'residential';
                      return (
                        <rect
                          key={b.id}
                          x={b.bx - 14}
                          y={b.bz - 14}
                          width={28}
                          height={28}
                          rx={3}
                          fill={isG ? '#15803d' : isC ? '#78350f' : isH ? '#b45309' : '#0f172a'}
                          stroke={isG ? '#22c55e' : '#334155'}
                          strokeWidth="1"
                          opacity="0.85"
                        />
                      );
                    })}

                    {/* Gardens Fountains */}
                    <circle cx="-23" cy="-23" r="4" fill="#38bdf8" />
                    <circle cx="23" cy="23" r="4" fill="#38bdf8" />

                    {/* Dumpyard Salvage Landfill */}
                    <rect x="-24" y="-132" width="48" height="28" fill="#0f766e" rx="4" stroke="#14b8a6" strokeWidth="1" />
                    <circle cx={radarData.dumpyard.x} cy={radarData.dumpyard.z} r="5" fill="#10b981" />

                    {/* AI Traffic Cars */}
                    {radarData.traffic.map((tc, idx) => (
                      <circle key={idx} cx={tc.x} cy={tc.z} r="2.6" fill="#facc15" stroke="#000" strokeWidth="0.6" />
                    ))}

                    {/* Smart Bins */}
                    {radarData.bins.map((b) => (
                      <circle
                        key={b.id}
                        cx={b.x}
                        cy={b.z}
                        r={b.collected ? 2.8 : 4.5}
                        fill={b.collected ? '#64748b' : (b.id % 3 === 1 ? '#3b82f6' : (b.id % 3 === 2 ? '#22c55e' : '#f97316'))}
                        stroke="#ffffff"
                        strokeWidth={b.collected ? 0.6 : 1.5}
                      />
                    ))}

                    {/* Route Line to Target */}
                    {radarData.target && (
                      <line
                        x1={radarData.playerX}
                        y1={radarData.playerZ}
                        x2={radarData.target.x}
                        y2={radarData.target.z}
                        stroke="#e2fd00"
                        strokeWidth="2.2"
                        strokeDasharray="4, 3"
                        opacity="0.95"
                      />
                    )}

                    {/* IoT Proximity Vector Aura (28m) */}
                    <circle
                      cx={radarData.playerX}
                      cy={radarData.playerZ}
                      r="28"
                      fill="rgba(56, 189, 248, 0.08)"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="3, 3"
                      opacity="0.75"
                    />

                  </g>
                </g>

                {/* ── FIXED PLAYER ARROW (GTA Vice City / San Andreas Style) ── */}
                {/* Always at center (0, 0), always pointing straight UP */}
                <g transform="translate(0, 0)" className="pointer-events-none">
                  <polygon points="0,-9 6,6 0,2 -6,6" fill="#e2fd00" stroke="#000000" strokeWidth="1.8" />
                  <circle cx="0" cy="0" r="1.5" fill="#000000" />
                </g>

                {/* Crosshair guidelines */}
                <line x1="0" y1="-114" x2="0" y2="-102" stroke="#475569" strokeWidth="1.2" />
                <line x1="0" y1="102" x2="0" y2="114" stroke="#475569" strokeWidth="1.2" />
                <line x1="-114" y1="0" x2="-102" y2="0" stroke="#475569" strokeWidth="1.2" />
                <line x1="102" y1="0" x2="114" y2="0" stroke="#475569" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Radar Info Pill */}
            <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg text-white text-[11px] font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Compass size={14} className="text-[#e2fd00] shrink-0" />
                <span className="truncate">{currentTargetName}</span>
              </div>
              <span className="text-[#e2fd00] shrink-0 ml-2">{targetDistance}m</span>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM STATUS & SPEEDOMETER
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 pointer-events-none z-20">
        
        {/* Speedometer (Strictly 0 - 30 KM/H) */}
        <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4 pointer-events-auto text-white">
          <div className="text-center">
            <span className="text-3xl font-black text-white tracking-tight">{currentSpeed}</span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">KM / H (MAX 30)</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Governor Speed Cap</p>
            <p className="font-extrabold text-xs text-emerald-400">Finite 30 KM/H Limit</p>
          </div>
        </div>

        {/* Waste Load & Eco Points */}
        <div className="bg-slate-900/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-6 pointer-events-auto text-white">
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-bold text-slate-300">Truck Load: {currentLoad} / {truckCapacity} kg</span>
              <span className="font-extrabold text-emerald-400 ml-4">{wasteCollected} / {totalBins} Bins</span>
            </div>
            <div className="w-40 sm:w-56 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(currentLoad / truckCapacity) * 100}%` }}
              />
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Award size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Eco-Points</span>
              <span className="text-lg font-black text-white">{ecoPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BUILDING PIECE INTERACTIVE MODAL (When clicking building in Game Mode)
          Shows piece-by-piece dashboard modules (Rewards, Waste Audit, Telemetry, etc.)
          ───────────────────────────────────────────────────────────── */}
      {showBuildingPieceModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow"
                  style={{
                    backgroundColor:
                      showBuildingPieceModal.category === 'garden' ? '#15803d' :
                      showBuildingPieceModal.category === 'cafe' ? '#b45309' :
                      showBuildingPieceModal.category === 'residential' ? '#059669' :
                      showBuildingPieceModal.category === 'landfill' ? '#0f766e' : '#0284c7'
                  }}
                >
                  {showBuildingPieceModal.category === 'garden' && <Trees size={20} />}
                  {showBuildingPieceModal.category === 'cafe' && <Coffee size={20} />}
                  {showBuildingPieceModal.category === 'residential' && <Home size={20} />}
                  {showBuildingPieceModal.category === 'landfill' && <Flame size={20} />}
                  {showBuildingPieceModal.category === 'corporate' && <Building2 size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      {showBuildingPieceModal.tag}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      Zone #{showBuildingPieceModal.blockIndex}
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-white mt-0.5">
                    {showBuildingPieceModal.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowBuildingPieceModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Interactive Component Pieces */}
            <div className="space-y-3.5 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {showBuildingPieceModal.desc}
              </p>

              {/* Piece 1: Waste Segregation Stream */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Active Segregation Protocol</span>
                  <span className="text-emerald-400 font-extrabold text-[11px]">Audit Certified</span>
                </div>
                <p className="text-white font-semibold">{showBuildingPieceModal.segregation}</p>
              </div>

              {/* Piece 2: Role-Specific Action Module */}
              {showBuildingPieceModal.id === 'block-16' ? (
                <div className="bg-gradient-to-r from-amber-950/60 to-slate-800 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                      <Gift size={14} /> Citizen Rewards Bureau
                    </span>
                    <span className="text-[#e2fd00] font-black">{ecoPoints} Points Available</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Redeem local discounts for D-Mart grocery vouchers, PVR movie tickets, or free Bilaspur City Bus transit passes!
                  </p>
                  <a
                    href="/dashboard/rewards"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow transition"
                  >
                    <span>Open Rewards Voucher Catalog</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : showBuildingPieceModal.category === 'cafe' ? (
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-800 p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-400 text-xs flex items-center gap-1.5">
                      <Coffee size={14} /> Commercial Food Waste Composter
                    </span>
                    <span className="text-emerald-300 font-bold text-[11px]">32 kg Daily Scrap</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Biogas Diverted</span>
                      <strong className="text-white">100% Organic</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Customer Discount</span>
                      <strong className="text-[#e2fd00]">10% Off with QR</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">IoT Ultrasonic Telemetry:</span>
                    <span className="text-[#e2fd00] font-black">Connected (LoRa Grid)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">Earned Exploration XP:</span>
                    <span className="text-emerald-400 font-black">+{showBuildingPieceModal.points} Eco-Points Credited</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowBuildingPieceModal(null)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                Close Piece & Return to Driver Seat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TRUCK FLEET SHOP & VECTOR AURA GARAGE MODAL
          Buy new trucks with Eco-Points, unlock higher capacity & unique vector field powers!
          ───────────────────────────────────────────────────────────── */}
      {showGarageShop && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>MUNICIPAL ECO-TRUCK GARAGE</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">SHOP</span>
                  </h3>
                  <p className="text-xs text-slate-400">Buy high-capacity compactor trucks & upgrade vector aura abilities</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10 text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Balance</span>
                  <span className="text-[#e2fd00] font-black text-sm">{ecoPoints} Pts</span>
                </div>
                <button
                  onClick={() => setShowGarageShop(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Truck Models Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: 'swachh_bharat_standard',
                  name: 'Swachh Bharat Standard',
                  cost: 0,
                  capacity: 150,
                  speed: '30 KM/H',
                  color: '#105a39',
                  auraColor: '#38bdf8',
                  auraPower: 'Standard Vector Field Proximity Deceleration (28m)'
                },
                {
                  id: 'bilaspur_heavy_hauler',
                  name: 'Bilaspur Heavy 4-Axle Hauler',
                  cost: 400,
                  capacity: 250,
                  speed: '32 KM/H',
                  color: '#1e3a8a',
                  auraColor: '#3b82f6',
                  auraPower: 'Hydraulic Compaction (Faster Bin Emptying Rate)'
                },
                {
                  id: 'chhattisgarh_green_ev',
                  name: 'C.G. Clean Electric EV Compactor',
                  cost: 750,
                  capacity: 320,
                  speed: '35 KM/H',
                  color: '#059669',
                  auraColor: '#10b981',
                  auraPower: 'Magnetic Induction Suction (Auto-empties bins within 8m)'
                },
                {
                  id: 'mahanadi_titan_flagship',
                  name: 'Mahanadi Titan Apex Rig',
                  cost: 1200,
                  capacity: 500,
                  speed: '40 KM/H',
                  color: '#d97706',
                  auraColor: '#f59e0b',
                  auraPower: '2x Eco-Points Multiplier & Autonomous Route Drone'
                }
              ].map((truck) => {
                const isOwned = ownedTrucks.includes(truck.id);
                const isSelected = selectedTruckModel === truck.id;

                return (
                  <div
                    key={truck.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/30'
                        : isOwned
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-900 border-slate-800 opacity-95'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-sm text-white">{truck.name}</span>
                        {isSelected ? (
                          <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} /> ACTIVE
                          </span>
                        ) : isOwned ? (
                          <span className="text-[10px] bg-slate-700 text-slate-300 font-extrabold px-2 py-0.5 rounded-full">
                            OWNED
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-amber-400">
                            🪙 {truck.cost} Pts
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-300 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Hopper Capacity:</span>
                          <strong className="text-white">{truck.capacity} kg</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Max Top Speed:</span>
                          <strong className="text-emerald-400">{truck.speed}</strong>
                        </div>
                        <div className="mt-2 bg-slate-900/90 p-2 rounded-xl text-[10px] text-slate-300 border border-white/5">
                          <span className="text-amber-400 font-bold block mb-0.5">Vector Field Power:</span>
                          {truck.auraPower}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {isSelected ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-center text-xs font-bold border border-emerald-500/30">
                          Currently Driving
                        </div>
                      ) : isOwned ? (
                        <button
                          onClick={() => {
                            setSelectedTruckModel(truck.id);
                            localStorage.setItem('smartbin_active_truck', truck.id);
                            setNotification(`🚛 Switched active truck to ${truck.name}!`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-xs transition cursor-pointer"
                        >
                          Equip Truck
                        </button>
                      ) : (
                        <button
                          disabled={ecoPoints < truck.cost}
                          onClick={() => {
                            if (ecoPoints >= truck.cost) {
                              const nextPts = ecoPoints - truck.cost;
                              setEcoPoints(nextPts);
                              ecoPointsRef.current = nextPts;
                              const updatedOwned = [...ownedTrucks, truck.id];
                              setOwnedTrucks(updatedOwned);
                              localStorage.setItem('smartbin_owned_trucks', JSON.stringify(updatedOwned));
                              setSelectedTruckModel(truck.id);
                              localStorage.setItem('smartbin_active_truck', truck.id);
                              playSound('collect');
                              setNotification(`🎉 Congratulations! Purchased ${truck.name} for ${truck.cost} Eco-Points!`);
                            }
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                            ecoPoints >= truck.cost
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {ecoPoints >= truck.cost ? `Buy for ${truck.cost} Eco-Points` : 'Insufficient Points'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGarageShop(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Garage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE TOUCH ON-SCREEN CONTROLS (D-Pad, Horn, Nitro & Collect)
          Ensures phone users can comfortably drive and collect without a physical keyboard
          ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden absolute bottom-5 left-4 z-30 pointer-events-auto flex flex-col items-center select-none">
        {/* Forward */}
        <button
          onTouchStart={() => { mobileKeysRef.current.forward = true; }}
          onTouchEnd={() => { mobileKeysRef.current.forward = false; }}
          onMouseDown={() => { mobileKeysRef.current.forward = true; }}
          onMouseUp={() => { mobileKeysRef.current.forward = false; }}
          className="w-13 h-13 rounded-2xl bg-slate-900/90 active:bg-emerald-600 border border-white/20 text-white font-black text-lg flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
        >
          ▲
        </button>
        {/* Left, Backward, Right */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onTouchStart={() => { mobileKeysRef.current.left = true; }}
            onTouchEnd={() => { mobileKeysRef.current.left = false; }}
            onMouseDown={() => { mobileKeysRef.current.left = true; }}
            onMouseUp={() => { mobileKeysRef.current.left = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 active:bg-emerald-600 border border-white/20 text-white font-black text-lg flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
          >
            ◀
          </button>
          <button
            onTouchStart={() => { mobileKeysRef.current.backward = true; }}
            onTouchEnd={() => { mobileKeysRef.current.backward = false; }}
            onMouseDown={() => { mobileKeysRef.current.backward = true; }}
            onMouseUp={() => { mobileKeysRef.current.backward = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 active:bg-emerald-600 border border-white/20 text-white font-black text-lg flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
          >
            ▼
          </button>
          <button
            onTouchStart={() => { mobileKeysRef.current.right = true; }}
            onTouchEnd={() => { mobileKeysRef.current.right = false; }}
            onMouseDown={() => { mobileKeysRef.current.right = true; }}
            onMouseUp={() => { mobileKeysRef.current.right = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 active:bg-emerald-600 border border-white/20 text-white font-black text-lg flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Mobile Action Buttons (Right side: Horn, Nitro Boost) */}
      <div className="md:hidden absolute bottom-5 right-4 z-30 pointer-events-auto flex flex-col items-end gap-2 select-none">
        {citizenLevel >= 3 && (
          <button
            onTouchStart={() => { mobileKeysRef.current.nitro = true; setNitroActive(true); playSound('nitro'); }}
            onTouchEnd={() => { mobileKeysRef.current.nitro = false; setNitroActive(false); }}
            onMouseDown={() => { mobileKeysRef.current.nitro = true; setNitroActive(true); playSound('nitro'); }}
            onMouseUp={() => { mobileKeysRef.current.nitro = false; setNitroActive(false); }}
            className="px-4 py-2.5 rounded-2xl bg-cyan-600 active:bg-cyan-400 text-white font-black text-xs shadow-xl active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} />
            <span>NITRO</span>
          </button>
        )}

        <button
          onClick={() => playSound('horn')}
          className="w-12 h-12 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black text-base shadow-xl active:scale-95 transition flex items-center justify-center cursor-pointer"
          title="Horn"
        >
          📢
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LEVEL UP SUPERPOWER UNLOCK MODAL
          ───────────────────────────────────────────────────────────── */}
      {showLevelUpModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-[#e2fd00] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-[#e2fd00] flex items-center justify-center mx-auto animate-bounce">
              <Sparkles size={36} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">LEVEL PROMOTION</span>
              <h3 className="text-2xl font-black text-white mt-1">CITIZEN LEVEL {showLevelUpModal.level}!</h3>
            </div>
            <p className="text-slate-300 text-xs">
              Your civic contributions have reached a new milestone. Superpower unlocked:
            </p>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-white/10 text-left space-y-2">
              {(showLevelUpModal.powers || []).map((p) => (
                <div key={p.id} className="flex items-start gap-2.5">
                  <span className="text-base">{p.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-white text-xs">{p.name}</h5>
                    <p className="text-[11px] text-slate-300">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLevelUpModal(null)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              Claim & Continue Route
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HELP MODAL
          ───────────────────────────────────────────────────────────── */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/10 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Truck className="text-emerald-500" size={22} />
                <span>Simulation Driving Guide</span>
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-6 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p><strong className="text-white">Finite Speed Cap (0 - 30 KM/H):</strong> Truck accelerates gently up to 30 KM/H and no further. Steering is smooth and realistic.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-white">Hold Left-Click to Empty:</strong> Stop near dustbin. Sanitation worker steps down. Hold Left-Click (or Space/E) to empty bin into truck.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-white">Scrapyard & Landfill:</strong> North end features salvage cranes, broken scrap cars, and mounds of compressed waste.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Resume Route
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
