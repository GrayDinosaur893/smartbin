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
  Smartphone,
  Wrench,
  Copy,
  Cpu,
  ShieldCheck,
  Timer
} from 'lucide-react';

/**
 * PLAYABLE MUNICIPAL TRUCKS CATALOG
 * Playable Garbage Trucks: Swachh Bharat Standard, Overdrive, and Deflector
 */
export const TRUCK_MODELS_DATA = {
  swachh_bharat_standard: {
    id: 'swachh_bharat_standard',
    name: 'Swachh Bharat Standard',
    tagline: 'Standard Municipal Compactor',
    cost: 0,
    costType: 'free',
    capacity: 150,
    speedKmh: 45,
    maxSpeedVal: 0.30,
    accelVal: 0.012,
    turnSpeedVal: 0.026,
    collectionDuration: 3.0,
    fieldRadius: 28.0,
    themeColor: '#105a39',
    accentColor: '#38bdf8',
    fieldName: 'Calming Braking Field',
    fieldDesc: 'Smoothly slows oncoming AI traffic within 28m down to 1x speed to maintain street safety.',
    tradeoff: 'Standard 45 KM/H speed cap and balanced collection time.'
  },
  overdrive: {
    id: 'overdrive',
    name: 'Overdrive',
    tagline: 'Cab-Over Heavy Duty Municipal Compactor',
    cost: 500,
    costType: 'coins',
    capacity: 320,
    speedKmh: 54,
    maxSpeedVal: 0.36,
    accelVal: 0.015,
    turnSpeedVal: 0.028,
    collectionDuration: 1.5,
    fieldRadius: 28.0,
    speedMultiplier: 1.45,
    themeColor: '#06b6d4',
    accentColor: '#22d3ee',
    fieldName: 'Kinetic Surge & Rapid Suction',
    fieldDesc: 'Traffic inside the cyan field smoothly accelerates and dustbin collection is ultra-fast at 1.5s!',
    tradeoff: 'Faster traffic makes avoiding high-speed collisions more challenging.'
  },
  deflector: {
    id: 'deflector',
    name: 'Deflector',
    tagline: 'Futuristic Cyber 8x8 Chunky Compactor',
    cost: 750,
    costType: 'coins',
    capacity: 450,
    speedKmh: 48,
    maxSpeedVal: 0.32,
    accelVal: 0.012,
    turnSpeedVal: 0.020,
    collectionDuration: 2.0,
    fieldRadius: 28.0,
    themeColor: '#00c9c8',
    accentColor: '#f97316',
    fieldName: 'Gravitational Path Deflector',
    fieldDesc: 'Smoothly bends traffic trajectory away from truck path; balanced 2.0s collection time!',
    tradeoff: 'Armored heavy chassis makes steering response slightly heavier.'
  }
};

/**
 * MUNICIPAL ECO-TRUCK PARTS UPGRADES MATRIX
 * Upgradeable truck components using earned Game Coins (🪙)!
 */
export const UPGRADE_CONFIGS = {
  engine: {
    id: 'engine',
    title: 'Twin-Turbo Engine Block',
    icon: '⚡',
    desc: 'Increases top speed cap and improves throttle response.',
    levels: [
      { lvl: 1, label: 'Standard 30 KM/H', cost: 0, speedKmh: 30, maxSpeedVal: 0.20, accelVal: 0.007 },
      { lvl: 2, label: 'Stage-1 Turbo 34 KM/H', cost: 100, speedKmh: 34, maxSpeedVal: 0.23, accelVal: 0.0085 },
      { lvl: 3, label: 'Twin-Turbo 38 KM/H', cost: 200, speedKmh: 38, maxSpeedVal: 0.26, accelVal: 0.010 },
      { lvl: 4, label: 'Hyper-EV Drive 42 KM/H', cost: 350, speedKmh: 42, maxSpeedVal: 0.29, accelVal: 0.012 },
    ]
  },
  capacity: {
    id: 'capacity',
    title: 'Hydraulic Compactor Hopper',
    icon: '📦',
    desc: 'Expands rear hopper volume so you can hold more waste before dumpyard.',
    levels: [
      { lvl: 1, label: '150 kg Hopper', cost: 0, cap: 150 },
      { lvl: 2, label: '250 kg Reinforced Hopper', cost: 90, cap: 250 },
      { lvl: 3, label: '400 kg Double Ram Press', cost: 180, cap: 400 },
      { lvl: 4, label: '600 kg Titan Compactor', cost: 320, cap: 600 },
    ]
  },
  suction: {
    id: 'suction',
    title: 'Pneumatic Lift & Empty Arm',
    icon: '🌪️',
    desc: 'Cuts sanitation worker bin empty duration for faster collection routes.',
    levels: [
      { lvl: 1, label: '2.5s Standard Tipper', cost: 0, duration: 2.5 },
      { lvl: 2, label: '1.8s Rapid Tipper', cost: 80, duration: 1.8 },
      { lvl: 3, label: '1.2s High-Flow Suction', cost: 160, duration: 1.2 },
      { lvl: 4, label: '0.6s Robotic Instant Empty', cost: 260, duration: 0.6 },
    ]
  },
  magnet: {
    id: 'magnet',
    title: 'Vector Field Proximity Coil',
    icon: '🧲',
    desc: 'Expands the electromagnetic braking aura that slows down AI cars around you.',
    levels: [
      { lvl: 1, label: '28m Safety Radius', cost: 0, radius: 28 },
      { lvl: 2, label: '36m Expanded Aura', cost: 70, radius: 36 },
      { lvl: 3, label: '45m High-Field Collector', cost: 150, radius: 45 },
      { lvl: 4, label: '55m Civic Stasis Dome', cost: 250, radius: 55 },
    ]
  }
};

/**
 * MISSION-BASED DIFFICULTY CONFIGURATION MATRIX (4 TIERS)
 * Controls traffic count, mission deadlines, objective bins, collision damage multipliers,
 * repair costs, and reward multipliers.
 */
export const DIFFICULTY_TIERS = {
  rookie: {
    id: 'rookie',
    name: 'Rookie Driver',
    badge: '🟢 ROOKIE',
    color: '#22c55e',
    desc: 'Low traffic density, generous 300s deadline, 4 bins required. Perfect for learning municipal navigation.',
    trafficCount: 10,
    timeLimit: 300, // 5 minutes
    requiredBins: 4,
    damageMultiplier: 0.6,
    repairCostPerPct: 1, // 1 Coin per 1% repair
    baseReward: 200,
    fullCollectionBonus: 50,
    timeBonus: 30,
    optionalObjectiveBonus: 40,
    rewardMultiplier: 1.0,
    xpComplete: 100
  },
  rush_hour: {
    id: 'rush_hour',
    name: 'Rush Hour',
    badge: '🟡 RUSH HOUR',
    color: '#eab308',
    desc: 'Moderate-high traffic (18 cars), tighter 210s deadline, 5 bins required. Strategic navigation essential.',
    trafficCount: 18,
    timeLimit: 210, // 3.5 minutes
    requiredBins: 5,
    damageMultiplier: 1.0,
    repairCostPerPct: 2, // 2 Coins per 1% repair
    baseReward: 260,
    fullCollectionBonus: 70,
    timeBonus: 45,
    optionalObjectiveBonus: 50,
    rewardMultiplier: 1.3,
    xpComplete: 140
  },
  city_pressure: {
    id: 'city_pressure',
    name: 'City Under Pressure',
    badge: '🟠 PRESSURE',
    color: '#f97316',
    desc: 'Dense traffic (24 cars), strict 150s deadline, all 6 bins required. Severe collision consequences.',
    trafficCount: 24,
    timeLimit: 150, // 2.5 minutes
    requiredBins: 6,
    damageMultiplier: 1.5,
    repairCostPerPct: 3, // 3 Coins per 1% repair
    baseReward: 350,
    fullCollectionBonus: 100,
    timeBonus: 60,
    optionalObjectiveBonus: 60,
    rewardMultiplier: 1.6,
    xpComplete: 190
  },
  master_operator: {
    id: 'master_operator',
    name: 'Master Operator',
    badge: '🔴 MASTER',
    color: '#ef4444',
    desc: 'Maximum traffic intensity (28 cars), cutthroat 110s deadline, 6 bins + zero collisions challenge!',
    trafficCount: 28,
    timeLimit: 110, // 1m 50s
    requiredBins: 6,
    damageMultiplier: 2.0,
    repairCostPerPct: 4, // 4 Coins per 1% repair
    baseReward: 480,
    fullCollectionBonus: 140,
    timeBonus: 80,
    optionalObjectiveBonus: 80,
    rewardMultiplier: 2.0,
    xpComplete: 260
  }
};

/**
 * Formula for XP required to advance from current level to next level:
 * XP Required = 100 + 50 * (Current Level - 1)
 */
export const getRequiredXp = (lvl) => {
  const current = Math.max(1, parseInt(lvl, 10) || 1);
  return 100 + 50 * (current - 1);
};

/**
 * CITIZEN MUNICIPAL REWARDS VOUCHERS CATALOG
 * Displayed in Citizen Rewards Bureau (Block 16) with 1-click redemption!
 */
export const MUNICIPAL_VOUCHERS = [
  {
    id: 'dmart_100',
    brand: 'D-Mart Supermarket',
    title: '₹100 Grocery Voucher',
    desc: 'Valid on fresh fruits, organic pulses, and household cleaning supplies.',
    cost: 150,
    category: 'Grocery',
    codePrefix: 'DMART-SBN-'
  },
  {
    id: 'pvr_bogo',
    brand: 'PVR Inox Cinemas',
    title: 'Buy-1-Get-1 Movie Ticket',
    desc: 'Valid at all Bilaspur & Raipur PVR screens for any movie showtime.',
    cost: 200,
    category: 'Entertainment',
    codePrefix: 'PVR-ECO-'
  },
  {
    id: 'bus_pass_7d',
    brand: 'Bilaspur City Transit',
    title: '7-Day Unlimited Bus Pass',
    desc: 'Free zero-emission AC electric bus transit across all city municipal routes.',
    cost: 120,
    category: 'Transit',
    codePrefix: 'BCT-FREE-'
  },
  {
    id: 'apollo_150',
    brand: 'Apollo Pharmacy',
    title: '₹150 Health & Wellness Coupon',
    desc: 'Applicable on essential medicines, vitamins, and first-aid supplies.',
    cost: 100,
    category: 'Healthcare',
    codePrefix: 'APOLLO-HLTH-'
  },
  {
    id: 'chai_snack',
    brand: "Chai Point & Baker's",
    title: 'Free Organic Brew & Snack',
    desc: 'Complimentary tea/coffee in ceramic mug and biodegradable millet snack.',
    cost: 80,
    category: 'Food & Beverage',
    codePrefix: 'CHAI-ZERO-'
  },
  {
    id: 'solar_token',
    brand: 'C.G. Renewable Energy',
    title: 'Solar LED Lantern Token',
    desc: 'Municipal voucher redeemable for a home emergency solar LED study lantern.',
    cost: 250,
    category: 'Clean Energy',
    codePrefix: 'CG-SOLAR-'
  }
];

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
  const [currentLoad, setCurrentLoad] = useState(0);

  // ── SEPARATE CURRENCIES ──
  // 1. Game Coins: Earned in-game by collecting bins, used for truck parts & garage upgrades (500 starter balance)
  const [gameCoins, setGameCoins] = useState(() => {
    try {
      const stored = localStorage.getItem('smartbin_game_coins');
      if (stored === null || stored === undefined) {
        localStorage.setItem('smartbin_game_coins', '500');
        return 500;
      }
      return parseInt(stored, 10) || 0;
    } catch {
      return 500;
    }
  });
  const gameCoinsRef = useRef(gameCoins);
  gameCoinsRef.current = gameCoins;

  // 2. Eco-Points: Earned for civic cleaning and strictly used for redeeming municipal vouchers
  const [ecoPoints, setEcoPoints] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('smartbin_user') || '{}');
      return typeof u.eco_points === 'number' ? u.eco_points : 0;
    } catch {
      return 0;
    }
  });
  const ecoPointsRef = useRef(ecoPoints);
  ecoPointsRef.current = ecoPoints;

  // Truck Parts Upgrades Matrix (Bought using Game Coins in Workshop)
  const [truckUpgrades, setTruckUpgrades] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartbin_truck_upgrades') || '{"engine":1,"capacity":1,"suction":1,"magnet":1}');
    } catch {
      return { engine: 1, capacity: 1, suction: 1, magnet: 1 };
    }
  });
  const truckUpgradesRef = useRef(truckUpgrades);
  truckUpgradesRef.current = truckUpgrades;

  // Game Screen State: 'menu' (Game Title/Hub), 'garage' (Dr. Driving 3D Vehicle Showcase), 'city' (Driving in 3D City)
  const [gameScreen, setGameScreen] = useState(() => {
    // Check if player came directly to city or prefer garage
    const pref = sessionStorage.getItem('smartbin_game_initial_screen');
    if (pref) return pref;
    return 'menu';
  });
  const gameScreenRef = useRef(gameScreen);
  gameScreenRef.current = gameScreen;

  // Pause Menu State
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Dr. Driving Garage Carousel Index & Turntable Control
  const truckKeysList = Object.keys(TRUCK_MODELS_DATA);
  const [previewTruckIndex, setPreviewTruckIndex] = useState(() => {
    const activeId = localStorage.getItem('smartbin_active_truck') || 'swachh_bharat_standard';
    const idx = Object.keys(TRUCK_MODELS_DATA).indexOf(activeId);
    return idx >= 0 ? idx : 0;
  });
  const previewTruckIndexRef = useRef(previewTruckIndex);
  previewTruckIndexRef.current = previewTruckIndex;

  const showroomAngleRef = useRef(0);
  const isShowroomDraggingRef = useRef(false);
  const showroomDragStartXRef = useRef(0);
  const showroomDragStartAngleRef = useRef(0);

  // Eco-Truck Garage & Vector Shop System
  const [showGarageShop, setShowGarageShop] = useState(false);
  const [selectedTruckModel, setSelectedTruckModel] = useState(() => {
    return localStorage.getItem('smartbin_active_truck') || 'swachh_bharat_standard';
  });
  const selectedTruckModelRef = useRef(selectedTruckModel);
  selectedTruckModelRef.current = selectedTruckModel;
  const applyTruckModelVisualsRef = useRef(null);

  const [ownedTrucks, setOwnedTrucks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartbin_owned_trucks') || '["swachh_bharat_standard"]');
    } catch {
      return ['swachh_bharat_standard'];
    }
  });

  // Hopper Capacity derived strictly from equipped truck model (Truck stats do not scale on citizen level up)
  const activeTruckConfig = TRUCK_MODELS_DATA[selectedTruckModel] || TRUCK_MODELS_DATA.swachh_bharat_standard;
  const truckCapacity = activeTruckConfig.capacity;
  const truckCapacityRef = useRef(truckCapacity);
  truckCapacityRef.current = truckCapacity;

  // Physical 3D Workshop In-Game Proximity State
  const [isNearWorkshop, setIsNearWorkshop] = useState(false);
  const isNearWorkshopRef = useRef(false);
  isNearWorkshopRef.current = isNearWorkshop;
  const [workshopTab, setWorkshopTab] = useState('models'); // 'models' | 'parts'

  // Respawn Coin Modal (Prompted on 3rd death to pay 1 Coin or forfeit)
  const [showRespawnCoinModal, setShowRespawnCoinModal] = useState(false);

  // Citizen Redeemed Vouchers Storage
  const [redeemedVouchers, setRedeemedVouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartbin_redeemed_vouchers') || '[]');
    } catch {
      return [];
    }
  });
  const [copiedVoucherCode, setCopiedVoucherCode] = useState(null);

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [shiftTime, setShiftTime] = useState(0); // Active Shift Timer in seconds
  const shiftTimeRef = useRef(0);
  shiftTimeRef.current = shiftTime;
  const [collectingBinId, setCollectingBinId] = useState(null);
  const [collectProgress, setCollectProgress] = useState(0);
  const [isWorkerAtBin, setIsWorkerAtBin] = useState(false);
  const [isHoldingCollect, setIsHoldingCollect] = useState(false);
  const [currentTargetName, setCurrentTargetName] = useState("SmartBin #1 (Plastic)");
  const [targetDistance, setTargetDistance] = useState(0);
  const [notification, setNotification] = useState("Shift Started: Real-time traffic active. Park near dustbins to empty!");
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

  // Mission Difficulty System (Rookie, Rush Hour, City Pressure, Master Operator)
  const [difficultyTier, setDifficultyTier] = useState(() => {
    return localStorage.getItem('smartbin_difficulty_tier') || 'rookie';
  });
  const difficultyTierRef = useRef(difficultyTier);
  difficultyTierRef.current = difficultyTier;

  // Truck Condition & Damage System (100% down to 0%)
  const [truckCondition, setTruckCondition] = useState(() => {
    try {
      const stored = localStorage.getItem('smartbin_truck_condition');
      return stored !== null ? Math.max(0, Math.min(100, parseInt(stored, 10))) : 100;
    } catch {
      return 100;
    }
  });
  const truckConditionRef = useRef(truckCondition);
  truckConditionRef.current = truckCondition;

  // Collision tracking during active mission
  const [collisionCount, setCollisionCount] = useState(0);
  const collisionCountRef = useRef(0);
  collisionCountRef.current = collisionCount;
  const lastCollisionTimeRef = useRef(0);

  // Permanent Driver Level & XP Progression System
  const [citizenLevel, setCitizenLevel] = useState(() => {
    try {
      const stored = localStorage.getItem('smartbin_driver_level');
      return stored ? Math.max(1, parseInt(stored, 10)) : 1;
    } catch {
      return 1;
    }
  });
  const citizenLevelRef = useRef(citizenLevel);
  citizenLevelRef.current = citizenLevel;

  const [levelXP, setLevelXP] = useState(() => {
    try {
      const stored = localStorage.getItem('smartbin_driver_xp');
      return stored ? Math.max(0, parseInt(stored, 10)) : 0;
    } catch {
      return 0;
    }
  });
  const levelXPRef = useRef(levelXP);
  levelXPRef.current = levelXP;

  // Mission Summary / Evaluation Result Modal state
  const [missionResultData, setMissionResultData] = useState(null);

  const [unlockedPowers, setUnlockedPowers] = useState(['standard_compactor']);
  const [nitroActive, setNitroActive] = useState(false);
  const nitroActiveRef = useRef(false);
  nitroActiveRef.current = nitroActive;
  const [showLevelUpModal, setShowLevelUpModal] = useState(null);

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
        const ptsVal = (typeof data.eco_points === 'number') ? data.eco_points : 0;
        setEcoPoints(ptsVal);
        ecoPointsRef.current = ptsVal;
        setUnlockedPowers((data.unlocked_powers || []).map((p) => p.id));
      }
    } catch (e) {
      console.warn("Could not fetch citizen progress:", e);
    }
  };

  // ── DRIVER LEVEL & XP PROGRESSION SYSTEM ──
  // Formula: XP Required = 100 + 50 * (Current Level - 1)
  const addDriverExperience = (earnedXp) => {
    let curLvl = citizenLevelRef.current;
    let curXp = levelXPRef.current + earnedXp;
    let leveledUp = false;
    let newUnlockedContent = [];

    while (curXp >= getRequiredXp(curLvl)) {
      curXp -= getRequiredXp(curLvl);
      curLvl += 1;
      leveledUp = true;
      if (curLvl === 2) newUnlockedContent.push("Stage-1 Twin-Turbo Engine Unlocked");
      if (curLvl === 3) newUnlockedContent.push("Nitro Afterburner Booster Unlocked");
      if (curLvl === 4) newUnlockedContent.push("Double Ram Compactor Press Unlocked");
      if (curLvl === 5) newUnlockedContent.push("Strobe Hazard Safety Aura Unlocked");
      if (curLvl === 6) newUnlockedContent.push("Titan Compactor Hopper Unlocked");
    }

    setCitizenLevel(curLvl);
    citizenLevelRef.current = curLvl;
    setLevelXP(curXp);
    levelXPRef.current = curXp;

    localStorage.setItem('smartbin_driver_level', curLvl.toString());
    localStorage.setItem('smartbin_driver_xp', curXp.toString());

    if (leveledUp) {
      playSound('level_up');
      setShowLevelUpModal({
        level: curLvl,
        powers: newUnlockedContent
      });
      setNotification(`🎉 LEVEL UP! You reached Driver Level ${curLvl}!`);
    }

    return { newLevel: curLvl, newXp: curXp, leveledUp };
  };

  // ── TRUCK REPAIR & GARAGE ECONOMY ──
  const repairTruckInGarage = () => {
    const activeDiff = DIFFICULTY_TIERS[difficultyTierRef.current] || DIFFICULTY_TIERS.rookie;
    const missingCondition = 100 - truckConditionRef.current;
    if (missingCondition <= 0) {
      setNotification("✅ Truck is already in mint 100% condition!");
      return;
    }
    const costPerPct = activeDiff.repairCostPerPct || 1;
    const totalRepairCost = missingCondition * costPerPct;

    if (gameCoinsRef.current < totalRepairCost) {
      setNotification(`⚠️ Insufficient coins! Need ${totalRepairCost} Coins to fully repair (You have ${gameCoinsRef.current}).`);
      return;
    }

    const nextCoins = gameCoinsRef.current - totalRepairCost;
    setGameCoins(nextCoins);
    gameCoinsRef.current = nextCoins;
    localStorage.setItem('smartbin_game_coins', nextCoins.toString());

    setTruckCondition(100);
    truckConditionRef.current = 100;
    localStorage.setItem('smartbin_truck_condition', '100');

    playSound('collect');
    setNotification(`🛠️ Truck fully restored to 100% condition! (-${totalRepairCost} Coins)`);
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

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const isHoldingCollectRef = useRef(false);
  isHoldingCollectRef.current = isHoldingCollect;

  const isCrashedRef = useRef(false);
  const cameraShakeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const resetTruckTriggerRef = useRef(null);

  // Auto-synchronize 3D truck visuals in Garage showroom and City driving
  useEffect(() => {
    if (gameScreen === 'garage') {
      const modelId = truckKeysList[previewTruckIndex] || 'swachh_bharat_standard';
      applyTruckModelVisualsRef.current?.(modelId);
    } else if (gameScreen === 'city') {
      applyTruckModelVisualsRef.current?.(selectedTruckModel);
    }
  }, [gameScreen, previewTruckIndex, selectedTruckModel]);

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

    // Helper to generate dynamic circular GTA badge texture
    const createGTABadgeTex = (letter, bgColor, textColor) => {
      const cv = document.createElement('canvas');
      cv.width = 128; cv.height = 128;
      const cx = cv.getContext('2d');
      cx.fillStyle = bgColor;
      cx.beginPath();
      cx.arc(64, 64, 58, 0, Math.PI * 2);
      cx.fill();
      cx.lineWidth = 10;
      cx.strokeStyle = '#ffffff';
      cx.stroke();
      cx.fillStyle = textColor;
      cx.font = '900 82px system-ui, sans-serif';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText(letter, 64, 68);
      return new THREE.CanvasTexture(cv);
    };

    // 3D GTA "D" Beacon Badge above Dumpyard
    const dumpyardBadgeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.45, 24),
      new THREE.MeshBasicMaterial({ map: createGTABadgeTex('D', '#059669', '#ffffff') })
    );
    dumpyardBadgeMesh.rotation.x = Math.PI / 2;
    dumpyardBadgeMesh.position.set(dumpyardPos.x, 18.5, dumpyardPos.z + 6);
    dumpyardGroup.add(dumpyardBadgeMesh);

    // Beacon Tower
    const beaconTower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beaconTower.position.set(dumpyardPos.x, 10.0, dumpyardPos.z + 6);
    dumpyardGroup.add(beaconTower);

    scene.add(dumpyardGroup);

    // ─────────────────────────────────────────────────────────────
    // 5B. 3D MUNICIPAL GARAGE & TRUCK CUSTOMS SHOWROOM (At South x: 0, z: 115)
    // ─────────────────────────────────────────────────────────────
    const workshopPos = { x: 0, z: 115 };
    const workshopGroup = new THREE.Group();

    // Heavy Concrete Apron Pad & Approach Ramp
    const wsApron = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.4, 28),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    wsApron.position.set(workshopPos.x, 0.2, workshopPos.z);
    wsApron.receiveShadow = true;
    workshopGroup.add(wsApron);

    // Garage Driveway Apron connecting to Main Road
    const wsDriveway = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.35, 30),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    wsDriveway.position.set(workshopPos.x, 0.18, workshopPos.z - 18);
    workshopGroup.add(wsDriveway);

    // Glowing Cyan Entrance Border
    const wsCurb = new THREE.Mesh(
      new THREE.BoxGeometry(44.4, 0.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    wsCurb.position.set(workshopPos.x, 0.26, workshopPos.z - 13.8);
    workshopGroup.add(wsCurb);

    // Main 3D Garage Hangar Building
    const wsBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(34, 11, 16),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    wsBuilding.position.set(workshopPos.x, 5.7, workshopPos.z + 4);
    wsBuilding.castShadow = true;
    workshopGroup.add(wsBuilding);

    // 3 Service Bays Openings with Rollup Shutters
    [-9, 0, 9].forEach((bx) => {
      const bay = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 7.5, 0.4),
        new THREE.MeshLambertMaterial({ color: 0x020617 })
      );
      bay.position.set(workshopPos.x + bx, 4.0, workshopPos.z - 4.1);
      workshopGroup.add(bay);

      const rollup = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 2.2, 0.45),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      rollup.position.set(workshopPos.x + bx, 6.7, workshopPos.z - 4.1);
      workshopGroup.add(rollup);
    });

    // Glowing Neon Roof Signboard: "3D MUNICIPAL GARAGE & SHOWROOM"
    const wsSign = new THREE.Mesh(
      new THREE.BoxGeometry(32, 2.6, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    wsSign.position.set(workshopPos.x, 12.5, workshopPos.z - 4.2);
    workshopGroup.add(wsSign);

    // 3D GTA "G" Beacon Badge above Garage
    const garageBadgeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.0, 0.45, 24),
      new THREE.MeshBasicMaterial({ map: createGTABadgeTex('G', '#f59e0b', '#000000') })
    );
    garageBadgeMesh.rotation.x = Math.PI / 2;
    garageBadgeMesh.position.set(workshopPos.x, 17.5, workshopPos.z - 4);
    workshopGroup.add(garageBadgeMesh);

    // ── 4 DISPLAY PEDESTALS WITH 3D TRUCK PARTS ──
    // 1. Engine Block with Golden Spinning Turbo
    const engPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    engPed.position.set(workshopPos.x - 12, 0.8, workshopPos.z - 2);
    workshopGroup.add(engPed);
    const engBlock = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.4), new THREE.MeshLambertMaterial({ color: 0x64748b }));
    engBlock.position.set(workshopPos.x - 12, 1.9, workshopPos.z - 2);
    workshopGroup.add(engBlock);
    const turboTurbine = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    turboTurbine.rotation.z = Math.PI / 2;
    turboTurbine.position.set(workshopPos.x - 11.2, 2.2, workshopPos.z - 2);
    workshopGroup.add(turboTurbine);

    // 2. Hydraulic Compactor Ram (Hopper Capacity)
    const capPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    capPed.position.set(workshopPos.x - 4, 0.8, workshopPos.z - 2);
    workshopGroup.add(capPed);
    const ramMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.5), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
    ramMesh.position.set(workshopPos.x - 4, 2.1, workshopPos.z - 2);
    workshopGroup.add(ramMesh);

    // 3. Pneumatic Vacuum Lifter Arm
    const sucPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    sucPed.position.set(workshopPos.x + 4, 0.8, workshopPos.z - 2);
    workshopGroup.add(sucPed);
    const sucArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0xf97316 }));
    sucArm.rotation.z = 0.4;
    sucArm.position.set(workshopPos.x + 4, 2.3, workshopPos.z - 2);
    workshopGroup.add(sucArm);

    // 4. Vector Field Magnetic Coil
    const magPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.2, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    magPed.position.set(workshopPos.x + 12, 0.8, workshopPos.z - 2);
    workshopGroup.add(magPed);
    const magCoil = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.25, 12, 24), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    magCoil.rotation.x = Math.PI / 2;
    magCoil.position.set(workshopPos.x + 12, 2.2, workshopPos.z - 2);
    workshopGroup.add(magCoil);

    // Rotating Holographic Wrench Beacon
    const wrenchHolo = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.3, 12, 24),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true })
    );
    wrenchHolo.position.set(workshopPos.x, 15.5, workshopPos.z - 4);
    workshopGroup.add(wrenchHolo);

    scene.add(workshopGroup);

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

      });
    });

    // ─────────────────────────────────────────────────────────────
    // 6A. RANDOM SMARTBIN SPAWN ON GRAY FOOTPATHS (Wo Gray Jagah M Hi)
    // ─────────────────────────────────────────────────────────────
    const candidateGrayCurbs = [];
    blockCenters.forEach((bx) => {
      blockCenters.forEach((bz) => {
        const curbOffset = blockSize / 2 + 1.2;
        // Distribute potential spots along each curb face (left, center, right)
        [-8, 0, 8].forEach((slot) => {
          candidateGrayCurbs.push({ x: bx + slot, z: bz + curbOffset, rotY: Math.PI });
          candidateGrayCurbs.push({ x: bx + slot, z: bz - curbOffset, rotY: 0 });
          candidateGrayCurbs.push({ x: bx + curbOffset, z: bz + slot, rotY: -Math.PI / 2 });
          candidateGrayCurbs.push({ x: bx - curbOffset, z: bz + slot, rotY: Math.PI / 2 });
        });
      });
    });

    // Randomize and pick 6 well-spaced gray pavement spots with dynamic positions
    const shuffledCurbs = [...candidateGrayCurbs].sort(() => Math.random() - 0.5);
    const chosenCurbSpots = [];
    for (const spot of shuffledCurbs) {
      if (chosenCurbSpots.length >= 6) break;
      const isFarEnough = chosenCurbSpots.every(
        (chosen) => Math.hypot(chosen.x - spot.x, chosen.z - spot.z) >= 32
      );
      if (isFarEnough) {
        chosenCurbSpots.push(spot);
      }
    }
    for (const spot of shuffledCurbs) {
      if (chosenCurbSpots.length >= 6) break;
      if (!chosenCurbSpots.includes(spot)) chosenCurbSpots.push(spot);
    }

    chosenCurbSpots.forEach((spot, idx) => {
      const binId = idx + 1;
      const featureInfo = SPOT_APP_FEATURES[idx] || SPOT_APP_FEATURES[0];
      const wheelieBinGroup = new THREE.Group();
      if (spot.rotY !== undefined) wheelieBinGroup.rotation.y = spot.rotY;

      const binBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 2.2, 1.2),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(featureInfo.color).getHex() })
      );
      binBody.position.y = 1.2;
      binBody.castShadow = true;
      wheelieBinGroup.add(binBody);

      const binLid = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.25, 1.3),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      binLid.position.y = 2.4;
      wheelieBinGroup.add(binLid);

      const binWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 10);
      const binWheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      [-0.65, 0.65].forEach((wx) => {
        const bw = new THREE.Mesh(binWheelGeo, binWheelMat);
        bw.rotation.z = Math.PI / 2;
        bw.position.set(wx, 0.3, -0.55);
        wheelieBinGroup.add(bw);
      });

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

      wheelieBinGroup.position.set(spot.x, 0, spot.z);
      cityGroup.add(wheelieBinGroup);

      smartBins.push({
        id: binId,
        group: wheelieBinGroup,
        body: binBody,
        beacon: beacon,
        column: colMesh,
        x: spot.x,
        z: spot.z,
        category: featureInfo.category,
        feature: featureInfo,
        colorHex: new THREE.Color(featureInfo.color).getHex(),
        collected: false
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
    // 8. MODULAR PLAYABLE GARBAGE TRUCKS (Overdrive, Deflector & Standard)
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();
    const truckMeshContainer = new THREE.Group();
    truckGroup.add(truckMeshContainer);

    const vectorFieldContainer = new THREE.Group();
    vectorFieldContainer.position.y = 0.04;
    truckGroup.add(vectorFieldContainer);

    const wheels = [];
    const vectorOutwardArrows = [];
    const vectorDeflectionArcs = [];
    const deflectorCoils = [];
    let strobeBar = null;

    const setupTruckVisuals = (modelId) => {
      // Clear existing meshes
      while (truckMeshContainer.children.length > 0) {
        truckMeshContainer.remove(truckMeshContainer.children[0]);
      }
      while (vectorFieldContainer.children.length > 0) {
        vectorFieldContainer.remove(vectorFieldContainer.children[0]);
      }
      wheels.length = 0;
      vectorOutwardArrows.length = 0;
      vectorDeflectionArcs.length = 0;
      deflectorCoils.length = 0;
      strobeBar = null;

      if (modelId === 'overdrive') {
        // ─────────────────────────────────────────────────────────
        // OVERDRIVE: AMERICAN CAB-OVER HEAVY-DUTY GARBAGE TRUCK (Reference Matching)
        // Authentic Sea-Green/Teal Body, Chrome Visor & Bumper, Split Windshield,
        // Arch Compactor with ♻ Recycling Symbol, Tandem Dual Axles & Underglow
        // ─────────────────────────────────────────────────────────
        const tealMat = new THREE.MeshLambertMaterial({ color: 0x009e8a });
        const tealDarkMat = new THREE.MeshLambertMaterial({ color: 0x007869 });
        const silverChromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.28, metalness: 0.82 });
        const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x181e24 });
        const amberGlassMat = new THREE.MeshLambertMaterial({ color: 0xcaa05b, transparent: true, opacity: 0.88 });
        const glowingCyanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        const headlightWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const indicatorAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const taillightRed = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

        // 1. Dynamic ♻ Universal Recycling Logo Decal
        let recycleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        try {
          const recCanvas = document.createElement('canvas');
          recCanvas.width = 256;
          recCanvas.height = 256;
          const rCtx = recCanvas.getContext('2d');
          rCtx.clearRect(0, 0, 256, 256);
          rCtx.fillStyle = '#ffffff';
          rCtx.font = 'bold 190px "Segoe UI Symbol", sans-serif';
          rCtx.textAlign = 'center';
          rCtx.textBaseline = 'middle';
          rCtx.fillText('♻', 128, 138);
          const recTex = new THREE.CanvasTexture(recCanvas);
          recycleMat = new THREE.MeshBasicMaterial({ map: recTex, transparent: true, side: THREE.DoubleSide });
        } catch {
          // Fallback if canvas is unavailable
        }

        // 2. Dynamic Red & White Safety Reflective Tape Decal
        let stripeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        try {
          const sCanvas = document.createElement('canvas');
          sCanvas.width = 256;
          sCanvas.height = 32;
          const sCtx = sCanvas.getContext('2d');
          for (let sx = 0; sx < 256; sx += 32) {
            sCtx.fillStyle = (sx % 64 === 0) ? '#dc2626' : '#ffffff';
            sCtx.fillRect(sx, 0, 32, 32);
          }
          const sTex = new THREE.CanvasTexture(sCanvas);
          sTex.wrapS = THREE.RepeatWrapping;
          sTex.repeat.set(2, 1);
          stripeMat = new THREE.MeshBasicMaterial({ map: sTex, side: THREE.DoubleSide });
        } catch {}

        // ─────────────────────────────────────────────────────────
        // A. CHASSIS FRAME & HEAVY UNDERBODY
        // ─────────────────────────────────────────────────────────
        const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 7.8), darkMetalMat);
        mainChassis.position.set(0, 0.72, -0.4);
        mainChassis.castShadow = true;
        truckMeshContainer.add(mainChassis);

        // Electric Cyan Underside Kinetic Surge Glow
        const neonUnderglow = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.05, 6.4),
          new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
        );
        neonUnderglow.position.set(0, 0.16, -0.4);
        truckMeshContainer.add(neonUnderglow);

        // Heavy Front Steer Axle & Rear Tandem Axles Support Bars
        [2.3, -1.2, -2.7].forEach((axZ) => {
          const axleBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.7, 8), darkMetalMat);
          axleBeam.rotation.z = Math.PI / 2;
          axleBeam.position.set(0, 0.65, axZ);
          truckMeshContainer.add(axleBeam);
        });

        // ─────────────────────────────────────────────────────────
        // B. CAB-OVER-ENGINE (COE) FORWARD CABIN
        // ─────────────────────────────────────────────────────────
        const cabGroup = new THREE.Group();
        cabGroup.position.set(0, 0, 2.3);

        // Main Teal Cab Block
        const cabMain = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.1, 2.3), tealMat);
        cabMain.position.set(0, 1.95, 0);
        cabMain.castShadow = true;
        cabGroup.add(cabMain);

        // Lower Cab Skirt & Wheel Arch Wells
        const cabLowerSkirt = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.45, 2.32), tealDarkMat);
        cabLowerSkirt.position.set(0, 1.05, 0);
        cabGroup.add(cabLowerSkirt);

        // Front Fascia Plate
        const frontFascia = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.6, 0.08), tealMat);
        frontFascia.position.set(0, 1.85, 1.18);
        cabGroup.add(frontFascia);

        // Split Front Windshield (Two Tall Glass Panes separated by central post)
        [-0.62, 0.62].forEach((wx) => {
          // Glass Pane
          const wGlass = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 0.06), amberGlassMat);
          wGlass.position.set(wx, 2.22, 1.22);
          cabGroup.add(wGlass);

          // Black Rubber Window Gasket Frame
          const wFrame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.02, 0.04), darkMetalMat);
          wFrame.position.set(wx, 2.22, 1.2);
          cabGroup.add(wFrame);
        });

        // Central Windshield Post Divider (Teal)
        const centerPost = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.02, 0.08), tealMat);
        centerPost.position.set(0, 2.22, 1.23);
        cabGroup.add(centerPost);

        // Overhead Chrome/Silver Sun Visor Brow (Protruding forward at top of windshield)
        const sunVisor = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.15, 0.52), silverChromeMat);
        sunVisor.rotation.x = 0.22;
        sunVisor.position.set(0, 2.82, 1.34);
        cabGroup.add(sunVisor);

        // Bold Central Radiator Grille (Vertical Slats / Black Mesh with Chrome Border)
        const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.05, 0.08), silverChromeMat);
        grilleFrame.position.set(0, 1.48, 1.23);
        cabGroup.add(grilleFrame);

        const grilleMesh = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.92, 0.09), darkMetalMat);
        grilleMesh.position.set(0, 1.48, 1.24);
        cabGroup.add(grilleMesh);

        // Heavy Wrap-Around Metallic Chrome Front Bumper
        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.48, 0.45), silverChromeMat);
        frontBumper.position.set(0, 0.66, 1.36);
        frontBumper.castShadow = true;
        cabGroup.add(frontBumper);

        // Recessed Center Step / Plate Cutout on Bumper
        const bumperCutout = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.06), darkMetalMat);
        bumperCutout.position.set(0, 0.66, 1.6);
        cabGroup.add(bumperCutout);

        // Dual Square Headlights & Amber Turn Signal Clusters
        [-1.02, 1.02].forEach((lx) => {
          // Chrome Bezel Housing
          const lightHousing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.44, 0.12), silverChromeMat);
          lightHousing.position.set(lx, 1.45, 1.24);
          cabGroup.add(lightHousing);

          // Square White Low/High Beam Headlight
          const mainHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.04), headlightWhite);
          mainHeadlight.position.set(lx, 1.38, 1.31);
          cabGroup.add(mainHeadlight);

          // Amber Indicator Lamp above headlight
          const turnIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.04), indicatorAmber);
          turnIndicator.position.set(lx, 1.56, 1.31);
          cabGroup.add(turnIndicator);

          // Real Functional Night Spotlights
          const spot = new THREE.SpotLight(0x67e8f9, 5.0, 45, Math.PI / 5, 0.35);
          spot.position.set(lx, 1.38, 1.4);
          spot.target.position.set(lx, 0, 25);
          cabGroup.add(spot);
          cabGroup.add(spot.target);
        });

        // Side Cab Windows (Driver & Passenger)
        [-1.37, 1.37].forEach((sx) => {
          const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 0.95), amberGlassMat);
          sideGlass.position.set(sx, 2.18, 0.25);
          cabGroup.add(sideGlass);

          // Black Window Trim Frame
          const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.92, 1.02), darkMetalMat);
          sideFrame.position.set(sx, 2.18, 0.25);
          cabGroup.add(sideFrame);

          // Tall Chrome Dual Rear-View Side Mirrors with Outrigger Bracket Arms
          const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.25), silverChromeMat);
          mirrorHousing.position.set(sx > 0 ? sx + 0.38 : sx - 0.38, 2.2, 1.15);
          cabGroup.add(mirrorHousing);

          // Dual Horizontal Mirror Bracket Tubes
          [0.18, -0.18].forEach((by) => {
            const bracketArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), silverChromeMat);
            bracketArm.rotation.z = Math.PI / 2;
            bracketArm.position.set(sx > 0 ? sx + 0.18 : sx - 0.18, 2.2 + by, 1.15);
            cabGroup.add(bracketArm);
          });

          // Vertical Grab Handle on Cab Side
          const grabRail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 6), silverChromeMat);
          grabRail.position.set(sx > 0 ? sx + 0.04 : sx - 0.04, 1.65, -0.45);
          cabGroup.add(grabRail);

          // Cab Access Footstep
          const cabStep = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.5), silverChromeMat);
          cabStep.position.set(sx > 0 ? sx + 0.06 : sx - 0.06, 0.55, 0.2);
          cabGroup.add(cabStep);
        });

        // Cab Roof Circular Mushroom Air Cleaner Dome
        const airMushroom = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 16), tealDarkMat);
        airMushroom.position.set(0, 3.08, 0.3);
        cabGroup.add(airMushroom);

        const airCap = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 16), silverChromeMat);
        airCap.position.set(0, 3.18, 0.3);
        cabGroup.add(airCap);

        // 4 Amber Clearance Marker Lights on Front Cab Roof
        [-0.9, -0.3, 0.3, 0.9].forEach((rx) => {
          const marker = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), indicatorAmber);
          marker.position.set(rx, 3.04, 1.02);
          cabGroup.add(marker);
        });

        // Driver Side Vertical Air Cleaner Snorkel Stack behind Cab
        const snorkelPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 12), tealDarkMat);
        snorkelPipe.position.set(-1.25, 2.05, -0.95);
        cabGroup.add(snorkelPipe);

        const snorkelIntake = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.45, 12), silverChromeMat);
        snorkelIntake.position.set(-1.25, 3.25, -0.95);
        cabGroup.add(snorkelIntake);

        // Cyan Strobe Bar on Cab Roof
        const sBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.24), glowingCyanMat);
        sBar.position.set(0, 3.12, 0.85);
        cabGroup.add(sBar);
        strobeBar = sBar;

        truckMeshContainer.add(cabGroup);

        // ─────────────────────────────────────────────────────────
        // C. CURVED COMPACTOR BODY (ARCH ROOF & ♻ RECYCLING EMBLEM)
        // ─────────────────────────────────────────────────────────
        const bodyGroup = new THREE.Group();
        bodyGroup.position.set(0, 0, -1.35);

        // Main Rectangular Lower Container Section
        const compactorLower = new THREE.Mesh(new THREE.BoxGeometry(2.82, 1.95, 4.8), tealMat);
        compactorLower.position.set(0, 1.72, 0);
        compactorLower.castShadow = true;
        bodyGroup.add(compactorLower);

        // Curved Arch Top Roof (Semi-Cylindrical Arch matching reference photo!)
        const archTopGeo = new THREE.CylinderGeometry(1.41, 1.41, 4.8, 24, 1, false, 0, Math.PI);
        const archRoof = new THREE.Mesh(archTopGeo, tealMat);
        archRoof.rotation.z = Math.PI / 2;
        archRoof.rotation.y = Math.PI / 2;
        archRoof.position.set(0, 2.68, 0);
        archRoof.castShadow = true;
        bodyGroup.add(archRoof);

        // Front Bulkhead Collar Arch Frame (Protruding rib bordering front of compactor)
        const collarRib = new THREE.Mesh(new THREE.BoxGeometry(2.94, 2.3, 0.28), tealDarkMat);
        collarRib.position.set(0, 1.9, 2.32);
        bodyGroup.add(collarRib);

        // Prominent White ♻ Recycling Symbol Decals on Both Sides
        [-1.42, 1.42].forEach((rx) => {
          const recPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), recycleMat);
          recPlane.rotation.y = rx > 0 ? Math.PI / 2 : -Math.PI / 2;
          recPlane.position.set(rx, 2.15, 0.4);
          bodyGroup.add(recPlane);
        });

        // Red & White Safety Reflective Striping along Lower Body Skirt
        [-1.42, 1.42].forEach((sx) => {
          const stripeBarMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.7, 0.16), stripeMat);
          stripeBarMesh.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
          stripeBarMesh.position.set(sx, 0.88, 0);
          bodyGroup.add(stripeBarMesh);
        });

        // Side Skirt Structural Frame & Hydraulic Reservoir Tank (Driver Side)
        const hydraulicTank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.3, 16), silverChromeMat);
        hydraulicTank.rotation.z = Math.PI / 2;
        hydraulicTank.position.set(-1.18, 0.65, 1.4);
        bodyGroup.add(hydraulicTank);

        // Tool / Battery Compartment Box (Passenger Side)
        const toolBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 1.4), darkMetalMat);
        toolBox.position.set(1.18, 0.65, 1.4);
        bodyGroup.add(toolBox);

        // ─────────────────────────────────────────────────────────
        // D. SLANTED REAR COMPACTOR TAILGATE & HYDRAULIC HOPPER
        // ─────────────────────────────────────────────────────────
        const tailgateGroup = new THREE.Group();
        tailgateGroup.position.set(0, 0, -2.4);

        // Sloping Tailgate Housing
        const tailgateMain = new THREE.Mesh(new THREE.BoxGeometry(2.82, 2.3, 1.1), tealMat);
        tailgateMain.position.set(0, 1.8, -0.55);
        tailgateMain.rotation.x = -0.12; // Realistic backward slope
        tailgateMain.castShadow = true;
        tailgateGroup.add(tailgateMain);

        // Rear Compactor Loading Hopper Trough
        const rearHopperTrough = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 0.65), darkMetalMat);
        rearHopperTrough.position.set(0, 0.75, -1.05);
        tailgateGroup.add(rearHopperTrough);

        // Heavy Hydraulic Lift Cylinders on Tailgate Sides
        [-1.38, 1.38].forEach((px) => {
          const cylBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), silverChromeMat);
          cylBarrel.rotation.x = -0.28;
          cylBarrel.position.set(px, 1.9, -0.65);
          tailgateGroup.add(cylBarrel);

          const cylRod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), glowingCyanMat);
          cylRod.rotation.x = -0.28;
          cylRod.position.set(px, 1.3, -0.85);
          tailgateGroup.add(cylRod);
        });

        // Rear Heavy Bumper & Taillight Clusters
        const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.84, 0.32, 0.35), darkMetalMat);
        rearBumper.position.set(0, 0.48, -1.25);
        tailgateGroup.add(rearBumper);

        [-1.05, 1.05].forEach((tx) => {
          // Red Stop/Tail Lights
          const rLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.05), taillightRed);
          rLight.position.set(tx, 0.52, -1.43);
          tailgateGroup.add(rLight);

          // Amber Indicator
          const aLight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), indicatorAmber);
          aLight.position.set(tx > 0 ? tx + 0.22 : tx - 0.22, 0.52, -1.43);
          tailgateGroup.add(aLight);
        });

        bodyGroup.add(tailgateGroup);
        truckMeshContainer.add(bodyGroup);

        // ─────────────────────────────────────────────────────────
        // E. 3-AXLE HEAVY-DUTY WHEELS (1 FRONT STEER + TANDEM DUAL REAR)
        // ─────────────────────────────────────────────────────────
        // Front Steer Axle: z = 2.4 (Single Tires)
        // Tandem Rear Axles: z = -1.3, z = -2.8 (Dual Wheels)
        const tireGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.44, 20);
        const rimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.46, 16);
        const hubCapGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.49, 10);
        const cyanLugNutGeo = new THREE.TorusGeometry(0.36, 0.035, 6, 16);

        const createDetailedWheel = (isRearDual, isRightSide) => {
          const wGroup = new THREE.Group();

          // Outer Tire
          const tireMesh = new THREE.Mesh(tireGeo, darkMetalMat);
          tireMesh.rotation.z = Math.PI / 2;
          tireMesh.castShadow = true;
          wGroup.add(tireMesh);

          // Silver/Chrome Multi-Lug Rim
          const rimMesh = new THREE.Mesh(rimGeo, silverChromeMat);
          rimMesh.rotation.z = Math.PI / 2;
          wGroup.add(rimMesh);

          // Central Axle Hub Cap
          const hubCap = new THREE.Mesh(hubCapGeo, darkMetalMat);
          hubCap.rotation.z = Math.PI / 2;
          wGroup.add(hubCap);

          // Subtle Glowing Cyan Kinetic Ring on Hub
          const cyanNut = new THREE.Mesh(cyanLugNutGeo, glowingCyanMat);
          cyanNut.rotation.y = Math.PI / 2;
          cyanNut.position.x = isRightSide ? 0.24 : -0.24;
          wGroup.add(cyanNut);

          // If Rear Axle: Add Inner Dual Tire (Authentic Heavy Truck Tandem Dual Setup!)
          if (isRearDual) {
            const innerOffset = isRightSide ? -0.42 : 0.42;
            const innerTire = new THREE.Mesh(tireGeo, darkMetalMat);
            innerTire.rotation.z = Math.PI / 2;
            innerTire.position.x = innerOffset;
            innerTire.castShadow = true;
            wGroup.add(innerTire);

            const innerRim = new THREE.Mesh(rimGeo, silverChromeMat);
            innerRim.rotation.z = Math.PI / 2;
            innerRim.position.x = innerOffset;
            wGroup.add(innerRim);
          }

          return wGroup;
        };

        // Front Steer Axle (x = ±1.42, z = 2.4)
        [
          { x: -1.42, z: 2.35, isRear: false, isRight: false },
          { x: 1.42, z: 2.35, isRear: false, isRight: true },
          // Tandem Rear Drive Axle 1 (z = -1.25)
          { x: -1.35, z: -1.25, isRear: true, isRight: false },
          { x: 1.35, z: -1.25, isRear: true, isRight: true },
          // Tandem Rear Drive Axle 2 (z = -2.75)
          { x: -1.35, z: -2.75, isRear: true, isRight: false },
          { x: 1.35, z: -2.75, isRear: true, isRight: true },
        ].forEach((wp) => {
          const wheelAssembly = createDetailedWheel(wp.isRear, wp.isRight);
          wheelAssembly.position.set(wp.x, 0.72, wp.z);
          truckMeshContainer.add(wheelAssembly);
          wheels.push(wheelAssembly);
        });

        // Curved Tandem Fenders over Rear Dual Axles
        [-1.48, 1.48].forEach((fx) => {
          const rearFender = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 2.7), darkMetalMat);
          rearFender.position.set(fx, 1.48, -2.0);
          truckMeshContainer.add(rearFender);
        });

        // ── VECTOR FIELD VISUALS (OVERDRIVE: Cyan Rings & Outward Flowing Arrows) ──
        const inRing = new THREE.Mesh(
          new THREE.RingGeometry(11.5, 12.3, 48),
          new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
        );
        inRing.rotation.x = -Math.PI / 2;
        vectorFieldContainer.add(inRing);

        const outRing = new THREE.Mesh(
          new THREE.RingGeometry(26.2, 27.2, 64),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
        );
        outRing.rotation.x = -Math.PI / 2;
        vectorFieldContainer.add(outRing);

        // 8 Outward-Flowing Radial Directional Arrows
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const arrowGroup = new THREE.Group();
          arrowGroup.rotation.y = -angle;

          // Radial beam line
          const lineMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.02, 10.0),
            new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.75 })
          );
          lineMesh.position.set(0, 0, 18.0);
          arrowGroup.add(lineMesh);

          // Outward Cone Arrowhead
          const headMesh = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 2.2, 8),
            new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 })
          );
          headMesh.rotation.x = Math.PI / 2;
          headMesh.position.set(0, 0, 24.0);
          arrowGroup.add(headMesh);

          vectorFieldContainer.add(arrowGroup);
          vectorOutwardArrows.push(arrowGroup);
        }

      } else if (modelId === 'deflector') {
        // ─────────────────────────────────────────────────────────
        // DEFLECTOR: CHUNKY CYBERPUNK 8X8 COMPACTOR (John Fowler Reference Match)
        // Bright Aqua/Turquoise Body, Diagonal Yellow Hazard Chevrons, Orange Beacons,
        // Japanese "赤 05" Markings, Cobalt Visor & Bumper, Coral 8-Wheel Multi-Drive
        // ─────────────────────────────────────────────────────────
        const aquaMat = new THREE.MeshLambertMaterial({ color: 0x00c9c8 });
        const aquaDarkMat = new THREE.MeshLambertMaterial({ color: 0x009695 });
        const cobaltMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
        const darkBlueBumperMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        const orangeBeaconMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const coralWheelMat = new THREE.MeshLambertMaterial({ color: 0xdf5334 });
        const visorGlassMat = new THREE.MeshLambertMaterial({ color: 0x091428, transparent: true, opacity: 0.92 });
        const whiteHeadlight = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const yellowPixelMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const glowingPurpleMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const conduitMagentaMat = new THREE.MeshLambertMaterial({ color: 0xd946ef });
        const conduitOrangeMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
        const conduitCyanMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });

        // 1. Dynamic Japanese Cyber Decal Canvas ("赤 05" with yellow pixels)
        let kanjiMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        try {
          const kCanvas = document.createElement('canvas');
          kCanvas.width = 256; kCanvas.height = 256;
          const kCtx = kCanvas.getContext('2d');
          kCtx.clearRect(0, 0, 256, 256);
          // White Kanji "赤"
          kCtx.fillStyle = '#ffffff';
          kCtx.font = '900 130px "Segoe UI", sans-serif';
          kCtx.fillText('赤', 24, 150);
          // Number "05"
          kCtx.font = 'bold 74px monospace';
          kCtx.fillText('05', 155, 105);
          // Yellow pixel blocks
          kCtx.fillStyle = '#facc15';
          kCtx.fillRect(158, 122, 28, 28);
          kCtx.fillRect(196, 122, 28, 28);
          kCtx.fillRect(158, 160, 28, 28);
          const kTex = new THREE.CanvasTexture(kCanvas);
          kanjiMat = new THREE.MeshBasicMaterial({ map: kTex, transparent: true, side: THREE.DoubleSide });
        } catch {}

        // 2. Dynamic Diagonal Yellow & Aqua Hazard Chevron Warning Stripes
        let hazardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
        try {
          const hCanvas = document.createElement('canvas');
          hCanvas.width = 256; hCanvas.height = 128;
          const hCtx = hCanvas.getContext('2d');
          hCtx.fillStyle = '#00c9c8';
          hCtx.fillRect(0, 0, 256, 128);
          hCtx.fillStyle = '#facc15';
          for (let i = -128; i < 384; i += 48) {
            hCtx.beginPath();
            hCtx.moveTo(i, 0);
            hCtx.lineTo(i + 24, 0);
            hCtx.lineTo(i + 24 - 128, 128);
            hCtx.lineTo(i - 128, 128);
            hCtx.fill();
          }
          const hTex = new THREE.CanvasTexture(hCanvas);
          hTex.wrapS = THREE.RepeatWrapping;
          hTex.wrapT = THREE.RepeatWrapping;
          hTex.repeat.set(2, 1);
          hazardMat = new THREE.MeshBasicMaterial({ map: hTex, side: THREE.DoubleSide });
        } catch {}

        // 3. Dynamic Japanese Front License Plate Canvas ("をほ 55 13-9")
        let plateMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        try {
          const pCanvas = document.createElement('canvas');
          pCanvas.width = 128; pCanvas.height = 64;
          const pCtx = pCanvas.getContext('2d');
          pCtx.fillStyle = '#ffffff';
          pCtx.fillRect(0, 0, 128, 64);
          pCtx.fillStyle = '#0f172a';
          pCtx.font = 'bold 16px sans-serif';
          pCtx.fillText('をほ 55', 28, 22);
          pCtx.font = 'bold 28px sans-serif';
          pCtx.fillText('13-9', 32, 54);
          const pTex = new THREE.CanvasTexture(pCanvas);
          plateMat = new THREE.MeshBasicMaterial({ map: pTex });
        } catch {}

        // ─────────────────────────────────────────────────────────
        // A. CHUNKY LOWER CHASSIS & HEAVY ARMORED SUB-FRAME
        // ─────────────────────────────────────────────────────────
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 7.6), darkBlueBumperMat);
        chassis.position.set(0, 0.72, -0.4);
        chassis.castShadow = true;
        truckMeshContainer.add(chassis);

        // Purple Gravitational Vector Field Core Underglow
        const purpleUnderglow = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.05, 6.4),
          new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.85 })
        );
        purpleUnderglow.position.set(0, 0.16, -0.4);
        truckMeshContainer.add(purpleUnderglow);

        // ─────────────────────────────────────────────────────────
        // B. FORWARD SCI-FI CHUNKY CABIN
        // ─────────────────────────────────────────────────────────
        const cabGroup = new THREE.Group();
        cabGroup.position.set(0, 0, 2.2);

        // Main Aqua Cab Block
        const cabMain = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.2, 2.3), aquaMat);
        cabMain.position.set(0, 1.95, 0);
        cabMain.castShadow = true;
        cabGroup.add(cabMain);

        // Chamfered Cab Roof Collar
        const cabTopCollar = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.28, 2.1), aquaDarkMat);
        cabTopCollar.position.set(0, 3.1, 0);
        cabGroup.add(cabTopCollar);

        // Wide Panoramic Visor Windshield (Dark Sci-Fi Glass)
        const frontVisor = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.92, 0.08), visorGlassMat);
        frontVisor.position.set(0, 2.25, 1.18);
        cabGroup.add(frontVisor);

        // Cobalt Blue Overhead Sun Visor Brow (Angled forward above glass)
        const cobaltBrow = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.22, 0.52), cobaltMat);
        cobaltBrow.rotation.x = 0.24;
        cobaltBrow.position.set(0, 2.82, 1.32);
        cabGroup.add(cobaltBrow);

        // Protruding Front Fascia & Chin Plate with Yellow Pixel Badges
        const frontChin = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.95, 0.22), aquaDarkMat);
        frontChin.position.set(0, 1.35, 1.18);
        cabGroup.add(frontChin);

        [-0.4, 0.4].forEach((px) => {
          const pixelDecal = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), yellowPixelMat);
          pixelDecal.position.set(px, 1.5, 1.3);
          cabGroup.add(pixelDecal);
        });

        // Heavy Cobalt Blue Front Bumper Lip
        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.52, 0.5), darkBlueBumperMat);
        frontBumper.position.set(0, 0.64, 1.32);
        cabGroup.add(frontBumper);

        // Hanging Japanese License Plate ("をほ 55 13-9")
        const licensePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.35), plateMat);
        licensePlate.position.set(0, 0.55, 1.58);
        cabGroup.add(licensePlate);

        // Orange Bumper Corner Beacon Pods & White Projector Lights
        [-1.25, 1.25].forEach((bx) => {
          // Orange Cylindrical Corner Pod
          const bPod = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 16), orangeBeaconMat);
          bPod.rotation.z = Math.PI / 2;
          bPod.position.set(bx, 1.1, 1.35);
          cabGroup.add(bPod);

          // White Projector Light Lens
          const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), whiteHeadlight);
          hl.rotation.x = Math.PI / 2;
          hl.position.set(bx > 0 ? bx - 0.45 : bx + 0.45, 0.85, 1.58);
          cabGroup.add(hl);

          // Real Functional Light Source
          const spot = new THREE.SpotLight(0xa855f7, 5.0, 45, Math.PI / 5, 0.35);
          spot.position.set(bx, 1.1, 1.5);
          spot.target.position.set(bx, 0, 25);
          cabGroup.add(spot);
          cabGroup.add(spot.target);
        });

        // Two Orange Cylindrical Beacons on Cab Roof Corners
        [-1.05, 1.05].forEach((rx) => {
          const roofBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 16), orangeBeaconMat);
          roofBeacon.position.set(rx, 3.28, 0.7);
          cabGroup.add(roofBeacon);
        });

        // Angled Roof Communication Antenna
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.1, 6), darkBlueBumperMat);
        antenna.rotation.z = -0.15;
        antenna.position.set(-0.85, 3.7, 0.2);
        cabGroup.add(antenna);

        // Chunky Sci-Fi Wing Mirrors (Boxy with Yellow/Green highlight tabs)
        [-1.55, 1.55].forEach((mx) => {
          const mirrorBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, 0.42), aquaDarkMat);
          mirrorBox.position.set(mx, 2.2, 0.85);
          cabGroup.add(mirrorBox);

          const mirrorTab = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.18), yellowPixelMat);
          mirrorTab.position.set(mx, 2.4, 0.85);
          cabGroup.add(mirrorTab);
        });

        // Blue Battery / Hydrolink Canister on Cab Side (Driver Side)
        const sideCanister = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.95, 16), cobaltMat);
        sideCanister.position.set(-1.48, 1.25, -0.4);
        cabGroup.add(sideCanister);

        const canisterCap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 12), orangeBeaconMat);
        canisterCap.position.set(-1.48, 1.78, -0.4);
        cabGroup.add(canisterCap);

        // Purple Strobe Bar on Roof
        const sBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.24), glowingPurpleMat);
        sBar.position.set(0, 3.24, 0.2);
        cabGroup.add(sBar);
        strobeBar = sBar;

        truckMeshContainer.add(cabGroup);

        // ─────────────────────────────────────────────────────────
        // C. CURVED SCI-FI COMPACTOR HOPPER WITH TUBULAR SPINE RAILS
        // ─────────────────────────────────────────────────────────
        const bodyGroup = new THREE.Group();
        bodyGroup.position.set(0, 0, -1.35);

        // Main Aqua Hopper Body with Rounded Edges
        const hopperMain = new THREE.Mesh(new THREE.BoxGeometry(2.96, 2.25, 4.8), aquaMat);
        hopperMain.position.set(0, 1.88, 0);
        hopperMain.castShadow = true;
        bodyGroup.add(hopperMain);

        // Rounded Upper Roof Arch
        const archTop = new THREE.Mesh(
          new THREE.CylinderGeometry(1.48, 1.48, 4.8, 20, 1, false, 0, Math.PI),
          aquaMat
        );
        archTop.rotation.z = Math.PI / 2;
        archTop.rotation.y = Math.PI / 2;
        archTop.position.set(0, 3.0, 0);
        archTop.castShadow = true;
        bodyGroup.add(archTop);

        // Twin Longitudinal Guide Rails / Spine Pipes on Roof
        [-0.72, 0.72].forEach((gx) => {
          const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.8, 12), aquaDarkMat);
          rail.rotation.x = Math.PI / 2;
          rail.position.set(gx, 3.42, 0);
          bodyGroup.add(rail);
        });

        // Flexible Conduit Hoses Crossing from Cab to Compactor (Magenta, Orange, Cyan)
        const hoseDefs = [
          { mat: conduitMagentaMat, x: -0.32, y: 3.38 },
          { mat: conduitOrangeMat,  x:  0.0,  y: 3.44 },
          { mat: conduitCyanMat,    x:  0.32, y: 3.38 }
        ];
        hoseDefs.forEach((hd) => {
          const hoseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 10), hd.mat);
          hoseMesh.rotation.x = 0.55;
          hoseMesh.position.set(hd.x, hd.y, 2.45);
          bodyGroup.add(hoseMesh);
        });

        // Visible Gravitational Deflector Field Emitters (Shoulder Coils)
        [-1.38, 1.38].forEach((ex) => {
          const emitterPod = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.7, 12), darkBlueBumperMat);
          emitterPod.position.set(ex, 3.25, 1.2);
          bodyGroup.add(emitterPod);

          [0.15, 0.0, -0.15].forEach((ry) => {
            const coil = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 16), glowingPurpleMat);
            coil.rotation.x = Math.PI / 2;
            coil.position.set(ex, 3.25 + ry, 1.2);
            bodyGroup.add(coil);
            deflectorCoils.push(coil);
          });
        });

        // Japanese Cyber Decal ("赤 05") on Compactor Sides
        [-1.49, 1.49].forEach((kx) => {
          const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), kanjiMat);
          decalMesh.rotation.y = kx > 0 ? Math.PI / 2 : -Math.PI / 2;
          decalMesh.position.set(kx, 2.2, 0.4);
          bodyGroup.add(decalMesh);
        });

        // ─────────────────────────────────────────────────────────
        // D. REAR ANGLED COMPACTOR TAILGATE WITH YELLOW HAZARD CHEVRONS
        // ─────────────────────────────────────────────────────────
        const tailgateGroup = new THREE.Group();
        tailgateGroup.position.set(0, 0, -2.4);

        // Angled Rear Tailgate Body
        const rearTailgate = new THREE.Mesh(new THREE.BoxGeometry(2.96, 2.4, 1.2), aquaMat);
        rearTailgate.rotation.x = -0.14; // Backward sloping rear
        rearTailgate.position.set(0, 1.9, -0.6);
        tailgateGroup.add(rearTailgate);

        // Diagonal Yellow Hazard Chevron Plates on Angled Rear Quarter Sides!
        [-1.5, 1.5].forEach((hx) => {
          const chevronPlate = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.1), hazardMat);
          chevronPlate.rotation.y = hx > 0 ? Math.PI / 2 : -Math.PI / 2;
          chevronPlate.rotation.z = -0.14;
          chevronPlate.position.set(hx, 1.9, -0.6);
          tailgateGroup.add(chevronPlate);
        });

        // Rear Loading Hopper Opening & Compactor Blade Housing
        const rearHopperTrough = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 0.6), darkBlueBumperMat);
        rearHopperTrough.position.set(0, 0.78, -1.1);
        tailgateGroup.add(rearHopperTrough);

        // Rear Tailgate Warning Beacons
        [-1.3, 1.3].forEach((tx) => {
          const rearBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12), orangeBeaconMat);
          rearBeacon.position.set(tx, 2.85, -1.05);
          tailgateGroup.add(rearBeacon);
        });

        bodyGroup.add(tailgateGroup);

        // ─────────────────────────────────────────────────────────
        // E. STREAMLINED LOWER GROUND SKIRT WITH HAZARD STRIPES
        // ─────────────────────────────────────────────────────────
        [-1.49, 1.49].forEach((sx) => {
          const skirtMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 4.6), aquaMat);
          skirtMesh.position.set(sx, 0.95, -0.2);
          bodyGroup.add(skirtMesh);

          // Diagonal Yellow Hazard Stripe Decal along Skirt Bottom
          const skirtStripe = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.55), hazardMat);
          skirtStripe.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
          skirtStripe.position.set(sx > 0 ? sx + 0.07 : sx - 0.07, 0.95, -0.2);
          bodyGroup.add(skirtStripe);
        });

        truckMeshContainer.add(bodyGroup);

        // ─────────────────────────────────────────────────────────
        // F. CORAL/ORANGE 8-WHEEL MULTI-DRIVE (4 AXLES PER SIDE)
        // ─────────────────────────────────────────────────────────
        const coralTireGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.44, 20);
        const aquaHubGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.48, 16);
        const centerPinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.52, 10);

        const createChunkyCoralWheel = (isRightSide) => {
          const wGroup = new THREE.Group();

          // Vivid Coral/Orange Tire Body
          const tire = new THREE.Mesh(coralTireGeo, coralWheelMat);
          tire.rotation.z = Math.PI / 2;
          tire.castShadow = true;
          wGroup.add(tire);

          // Aqua/Teal Center Hub Cap
          const hub = new THREE.Mesh(aquaHubGeo, aquaMat);
          hub.rotation.z = Math.PI / 2;
          wGroup.add(hub);

          // Dark Pin Center
          const pin = new THREE.Mesh(centerPinGeo, darkBlueBumperMat);
          pin.rotation.z = Math.PI / 2;
          wGroup.add(pin);

          return wGroup;
        };

        // 8 Multi-Wheels (4 Axles along the chassis: z = 2.2, z = 0.4, z = -1.4, z = -2.8)
        [
          { x: -1.42, z:  2.2, isRight: false },
          { x:  1.42, z:  2.2, isRight: true  },
          { x: -1.42, z:  0.4, isRight: false },
          { x:  1.42, z:  0.4, isRight: true  },
          { x: -1.42, z: -1.4, isRight: false },
          { x:  1.42, z: -1.4, isRight: true  },
          { x: -1.42, z: -2.8, isRight: false },
          { x:  1.42, z: -2.8, isRight: true  }
        ].forEach((wp) => {
          const wheelAssembly = createChunkyCoralWheel(wp.isRight);
          wheelAssembly.position.set(wp.x, 0.68, wp.z);
          truckMeshContainer.add(wheelAssembly);
          wheels.push(wheelAssembly);
        });

        // ── VECTOR FIELD VISUALS (DEFLECTOR: Purple Energy Rings & Curved Deflection Vectors) ──
        const inRing = new THREE.Mesh(
          new THREE.RingGeometry(12.5, 13.5, 48),
          new THREE.MeshBasicMaterial({ color: 0x7e22ce, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
        );
        inRing.rotation.x = -Math.PI / 2;
        vectorFieldContainer.add(inRing);

        const outRing = new THREE.Mesh(
          new THREE.RingGeometry(26.2, 27.2, 64),
          new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
        );
        outRing.rotation.x = -Math.PI / 2;
        vectorFieldContainer.add(outRing);

        // 6 Curved Vector Lines / Chevrons around perimeter
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const arcGroup = new THREE.Group();
          arcGroup.rotation.y = -angle;

          // Curved tangential arc on road surface
          const curveMesh = new THREE.Mesh(
            new THREE.TorusGeometry(20.0, 0.22, 4, 16, Math.PI / 6),
            new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.85 })
          );
          curveMesh.rotation.x = Math.PI / 2;
          arcGroup.add(curveMesh);

          // Deflection Arrowhead
          const deflHead = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 2.0, 6),
            new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })
          );
          deflHead.rotation.x = Math.PI / 2;
          deflHead.rotation.z = -0.4;
          deflHead.position.set(5.2, 0, 19.5);
          arcGroup.add(deflHead);

          vectorFieldContainer.add(arcGroup);
          vectorDeflectionArcs.push(arcGroup);
        }

      } else {
        // ─────────────────────────────────────────────────────────
        // SWACHH BHARAT STANDARD: ORIGINAL MUNICIPAL COMPACTOR TRUCK
        // ─────────────────────────────────────────────────────────
        const cab = new THREE.Mesh(
          new THREE.BoxGeometry(2.7, 2.4, 2.4),
          new THREE.MeshLambertMaterial({ color: 0xf8fafc })
        );
        cab.position.set(0, 1.6, 2.1);
        cab.castShadow = true;
        truckMeshContainer.add(cab);

        const windshield = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 1.15, 0.2),
          new THREE.MeshLambertMaterial({ color: 0x0284c7 })
        );
        windshield.position.set(0, 2.05, 3.32);
        truckMeshContainer.add(windshield);

        const mirrorGeo = new THREE.BoxGeometry(0.2, 0.6, 0.3);
        const mirrorMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        [-1.5, 1.5].forEach((mx) => {
          const m = new THREE.Mesh(mirrorGeo, mirrorMat);
          m.position.set(mx, 2.0, 2.3);
          truckMeshContainer.add(m);
        });

        const grille = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.8, 0.2),
          new THREE.MeshLambertMaterial({ color: 0x1e293b })
        );
        grille.position.set(0, 1.1, 3.32);
        truckMeshContainer.add(grille);

        const bumper = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.45, 0.4),
          new THREE.MeshLambertMaterial({ color: 0x475569 })
        );
        bumper.position.set(0, 0.65, 3.4);
        truckMeshContainer.add(bumper);

        const sBar = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.25, 0.35),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        sBar.position.set(0, 2.92, 2.1);
        truckMeshContainer.add(sBar);
        strobeBar = sBar;

        const hornGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.8, 8);
        const hornMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
        [-0.5, 0.5].forEach((hx) => {
          const hn = new THREE.Mesh(hornGeo, hornMat);
          hn.rotation.x = Math.PI / 2;
          hn.position.set(hx, 2.95, 2.6);
          truckMeshContainer.add(hn);
        });

        const compactor = new THREE.Mesh(
          new THREE.BoxGeometry(2.85, 2.7, 5.0),
          new THREE.MeshLambertMaterial({ color: 0x105a39 })
        );
        compactor.position.set(0, 1.85, -1.8);
        compactor.castShadow = true;
        truckMeshContainer.add(compactor);

        const hazardStrip = new THREE.Mesh(
          new THREE.BoxGeometry(2.9, 0.2, 4.8),
          new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
        );
        hazardStrip.position.set(0, 2.9, -1.8);
        truckMeshContainer.add(hazardStrip);

        const tailgate = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 1.6, 0.6),
          new THREE.MeshLambertMaterial({ color: 0x064e3b })
        );
        tailgate.position.set(0, 1.3, -4.4);
        truckMeshContainer.add(tailgate);

        [-0.9, 0.9].forEach((hx) => {
          const hl = new THREE.SpotLight(0xffedd5, 4.0, 35, Math.PI / 6, 0.4);
          hl.position.set(hx, 1.5, 3.4);
          hl.target.position.set(hx, 0, 25);
          truckMeshContainer.add(hl);
          truckMeshContainer.add(hl.target);
        });

        const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.55, 16);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
        [
          { x: -1.5, y: 0.7, z: 2.1 }, { x: 1.5, y: 0.7, z: 2.1 },
          { x: -1.5, y: 0.7, z: -1.3 }, { x: 1.5, y: 0.7, z: -1.3 },
          { x: -1.5, y: 0.7, z: -3.1 }, { x: 1.5, y: 0.7, z: -3.1 }
        ].forEach((wp) => {
          const w = new THREE.Mesh(wheelGeo, wheelMat);
          w.rotation.z = Math.PI / 2;
          w.position.set(wp.x, wp.y, wp.z);
          w.castShadow = true;
          truckMeshContainer.add(w);
          wheels.push(w);
        });

        // Standard Sky Blue Vector Field Ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(13.5, 14.2, 48),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
        );
        ring.rotation.x = -Math.PI / 2;
        vectorFieldContainer.add(ring);
      }
    };

    // Register visual applicator ref & construct initial truck
    applyTruckModelVisualsRef.current = setupTruckVisuals;
    setupTruckVisuals(selectedTruckModelRef.current);

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

    // High-Density Urban Traffic (2x Truck Speed: ~0.60 base speed)
    const trafficData = [
      // Avenue H: Line -92 (North Perimeter)
      { avenue: 'h', line: -92, dir: 1, speed: 0.60, x: -80, z: -92 + 3.2 },
      { avenue: 'h', line: -92, dir: -1, speed: 0.58, x: 60, z: -92 - 3.2 },
      { avenue: 'h', line: -92, dir: 1, speed: 0.62, x: 10, z: -92 + 3.2 },

      // Avenue H: Line -46 (North Inner)
      { avenue: 'h', line: -46, dir: 1, speed: 0.60, x: -70, z: -46 + 3.2 },
      { avenue: 'h', line: -46, dir: 1, speed: 0.61, x: 20, z: -46 + 3.2 },
      { avenue: 'h', line: -46, dir: -1, speed: 0.59, x: 70, z: -46 - 3.2 },
      { avenue: 'h', line: -46, dir: -1, speed: 0.60, x: -30, z: -46 - 3.2 },

      // Avenue H: Line 0 (Center Crossway)
      { avenue: 'h', line: 0, dir: 1, speed: 0.60, x: -90, z: 3.2 },
      { avenue: 'h', line: 0, dir: 1, speed: 0.62, x: -10, z: 3.2 },
      { avenue: 'h', line: 0, dir: -1, speed: 0.59, x: 80, z: -3.2 },
      { avenue: 'h', line: 0, dir: -1, speed: 0.61, x: 15, z: -3.2 },

      // Avenue H: Line 46 (South Inner)
      { avenue: 'h', line: 46, dir: 1, speed: 0.60, x: -60, z: 46 + 3.2 },
      { avenue: 'h', line: 46, dir: -1, speed: 0.58, x: 70, z: 46 - 3.2 },
      { avenue: 'h', line: 46, dir: -1, speed: 0.60, x: -15, z: 46 - 3.2 },

      // Avenue H: Line 92 (South Perimeter)
      { avenue: 'h', line: 92, dir: 1, speed: 0.60, x: -75, z: 92 + 3.2 },
      { avenue: 'h', line: 92, dir: -1, speed: 0.59, x: 65, z: 92 - 3.2 },

      // Avenue V: Line -46 (West Inner)
      { avenue: 'v', line: -46, dir: 1, speed: 0.60, x: -46 + 3.2, z: -80 },
      { avenue: 'v', line: -46, dir: 1, speed: 0.62, x: -46 + 3.2, z: 10 },
      { avenue: 'v', line: -46, dir: -1, speed: 0.59, x: -46 - 3.2, z: 75 },
      { avenue: 'v', line: -46, dir: -1, speed: 0.61, x: -46 - 3.2, z: -25 },

      // Avenue V: Line 0 (Central North-South Boulevard)
      { avenue: 'v', line: 0, dir: 1, speed: 0.60, x: 3.2, z: -70 },
      { avenue: 'v', line: 0, dir: -1, speed: 0.59, x: -3.2, z: 90 },
      { avenue: 'v', line: 0, dir: -1, speed: 0.61, x: -3.2, z: 5 },

      // Avenue V: Line 46 (East Inner)
      { avenue: 'v', line: 46, dir: 1, speed: 0.61, x: 46 + 3.2, z: -60 },
      { avenue: 'v', line: 46, dir: -1, speed: 0.60, x: 46 - 3.2, z: 80 },
      { avenue: 'v', line: 46, dir: -1, speed: 0.58, x: 46 - 3.2, z: -20 },
    ];

    const activeDiffConfig = DIFFICULTY_TIERS[difficultyTierRef.current] || DIFFICULTY_TIERS.rookie;
    const activeTrafficSubset = trafficData.slice(0, activeDiffConfig.trafficCount || trafficData.length);

    activeTrafficSubset.forEach((td, idx) => {
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
        z: td.z,
        baseX: td.x,
        baseZ: td.z,
        deflectOffset: 0
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 11. FINITE CONTROL PHYSICS (0-30 KM/H STRICT CAP & SMOOTH TURNING)
    // ─────────────────────────────────────────────────────────────
    const halfRoad = roadWidth / 2 - 0.4;
    const isPointOnRoad = (px, pz) => {
      const onH = roadLines.some((rz) => Math.abs(pz - rz) <= halfRoad);
      const onV = roadLines.some((rx) => Math.abs(px - rx) <= halfRoad);
      const onDumpYard = (Math.abs(px - dumpyardPos.x) <= 22 && Math.abs(pz - dumpyardPos.z) <= 18);
      const onGarage = (Math.abs(px - workshopPos.x) <= 22 && Math.abs(pz - workshopPos.z) <= 18);
      const onGarageDriveway = (Math.abs(px) <= 8 && pz >= 88 && pz <= 126);
      return onH || onV || onDumpYard || onGarage || onGarageDriveway;
    };

    const keys = { forward: false, backward: false, left: false, right: false, nitro: false };
    const onKeyDown = (e) => {
      // If player is on garage screen, Left/Right arrow keys navigate trucks
      if (gameScreenRef.current === 'garage') {
        const truckKeys = Object.keys(TRUCK_MODELS_DATA);
        if (e.key === 'ArrowLeft') {
          const prevIdx = (previewTruckIndexRef.current - 1 + truckKeys.length) % truckKeys.length;
          setPreviewTruckIndex(prevIdx);
          previewTruckIndexRef.current = prevIdx;
          const nextModelId = truckKeys[prevIdx];
          setupTruckVisuals(nextModelId);
          playSound('horn');
          return;
        }
        if (e.key === 'ArrowRight') {
          const nextIdx = (previewTruckIndexRef.current + 1) % truckKeys.length;
          setPreviewTruckIndex(nextIdx);
          previewTruckIndexRef.current = nextIdx;
          const nextModelId = truckKeys[nextIdx];
          setupTruckVisuals(nextModelId);
          playSound('horn');
          return;
        }
        if (e.key === 'Escape') {
          setGameScreen('menu');
          gameScreenRef.current = 'menu';
          return;
        }
      }

      // In city screen: Esc toggles Pause Menu
      if (e.key === 'Escape') {
        if (gameScreenRef.current === 'city') {
          setIsPaused((p) => {
            const nextP = !p;
            isPausedRef.current = nextP;
            return nextP;
          });
          return;
        }
      }

      if (isPausedRef.current || gameScreenRef.current !== 'city') return;

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
      if (k === 'g' || (k === 'e' && isNearWorkshopRef.current)) {
        setGameScreen('garage');
        gameScreenRef.current = 'garage';
        playSound('horn');
        return;
      }
      if (k === 'q' && isNearWorkshopRef.current) {
        setShowGarageShop(true);
        return;
      }
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

    // Pointer / Mouse Handlers: Turntable 360 Drag (Garage) & Bin Collect (City)
    const onMouseDown = (e) => {
      if (gameScreenRef.current === 'garage' || gameScreenRef.current === 'menu') {
        isShowroomDraggingRef.current = true;
        showroomDragStartXRef.current = e.clientX;
        showroomDragStartAngleRef.current = showroomAngleRef.current;
        return;
      }
      if (e.button === 0) {
        isHoldingCollectRef.current = true;
        setIsHoldingCollect(true);
      }
    };

    const onMouseMove = (e) => {
      if (isShowroomDraggingRef.current) {
        const deltaX = e.clientX - showroomDragStartXRef.current;
        showroomAngleRef.current = showroomDragStartAngleRef.current - deltaX * 0.012;
      }
    };

    const onMouseUp = (e) => {
      if (isShowroomDraggingRef.current) {
        isShowroomDraggingRef.current = false;
      }
      if (e.button === 0) {
        isHoldingCollectRef.current = false;
        setIsHoldingCollect(false);
      }
    };

    const onTouchStart = (e) => {
      if ((gameScreenRef.current === 'garage' || gameScreenRef.current === 'menu') && e.touches.length > 0) {
        isShowroomDraggingRef.current = true;
        showroomDragStartXRef.current = e.touches[0].clientX;
        showroomDragStartAngleRef.current = showroomAngleRef.current;
      }
    };

    const onTouchMove = (e) => {
      if (isShowroomDraggingRef.current && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - showroomDragStartXRef.current;
        showroomAngleRef.current = showroomDragStartAngleRef.current - deltaX * 0.012;
      }
    };

    const onTouchEnd = () => {
      isShowroomDraggingRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

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

      // Prevent same continuous collision from damaging every rendered frame (2s contact cooldown)
      const now = performance.now();
      if (now - lastCollisionTimeRef.current < 1800) return;
      lastCollisionTimeRef.current = now;

      // Track collision count
      setCollisionCount((c) => {
        const nextC = c + 1;
        collisionCountRef.current = nextC;
        return nextC;
      });

      // Difficulty & Severity damage calculation
      const activeDiff = DIFFICULTY_TIERS[difficultyTierRef.current] || DIFFICULTY_TIERS.rookie;
      const speedRatio = Math.min(1.0, Math.abs(truckSpeed) / 0.30);
      let baseDamagePct = 8;
      if (speedRatio < 0.4) baseDamagePct = 4; // minor
      else if (speedRatio > 0.8) baseDamagePct = 16; // severe

      const damageAmount = Math.max(2, Math.round(baseDamagePct * (activeDiff.damageMultiplier || 1.0)));

      setTruckCondition((prevCond) => {
        const nextCond = Math.max(0, prevCond - damageAmount);
        truckConditionRef.current = nextCond;
        localStorage.setItem('smartbin_truck_condition', nextCond.toString());
        return nextCond;
      });

      setLives((prev) => {
        const rem = Math.max(0, prev - 1);
        livesRef.current = rem;
        if (rem === 0) {
          setShowRespawnCoinModal(true);
        }
        return rem;
      });

      if (livesRef.current > 0) {
        setCrashState({
          message: `COLLIDED WITH ${obstacleName.toUpperCase()}! (-${damageAmount}% Chassis Condition)`,
          countdown: 2
        });

        setTimeout(() => {
          resetTruck(`Repositioned after Collision with ${obstacleName}`);
        }, 2000);
      }
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

      // Active truck model & configuration for the current frame
      const activeModelId = (gameScreenRef.current === 'garage')
        ? (truckKeysList[previewTruckIndexRef.current] || selectedTruckModelRef.current)
        : selectedTruckModelRef.current;
      const activeTruckConfig = TRUCK_MODELS_DATA[activeModelId] || TRUCK_MODELS_DATA.swachh_bharat_standard;

      if (isPausedRef.current) {
        // Paused: Render frozen scene with camera
        renderer.render(scene, camera);
        return;
      }

      // Update Active Shift Timer in City Driving Mode
      if (gameScreenRef.current === 'city' && !isCrashedRef.current) {
        shiftTimeRef.current += delta;
        // Sync to React state once per second
        const currentSec = Math.floor(shiftTimeRef.current);
        setShiftTime((prevSec) => (prevSec !== currentSec ? currentSec : prevSec));
      }

      if (gameScreenRef.current !== 'city') {
        // In Garage Showroom or Main Menu: Truck rests on showroom turntable
        truckSpeed = 0;
        keys.forward = false;
        keys.backward = false;
        keys.left = false;
        keys.right = false;
      }

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

        // Condition Penalties (Reduced accel and top speed when damaged, as specified in STEP 5)
        const condPct = truckConditionRef.current;
        let conditionPenaltyFactor = 1.0;
        if (condPct < 40) conditionPenaltyFactor = 0.72; // severe damage penalty
        else if (condPct < 70) conditionPenaltyFactor = 0.88; // moderate damage penalty

        const currentMaxSpeed = (isNitro ? (activeTruckConfig.maxSpeedVal * 1.35) : activeTruckConfig.maxSpeedVal) * conditionPenaltyFactor;
        const currentAccel = activeTruckConfig.accelVal * conditionPenaltyFactor;
        const currentTurnSpeed = activeTruckConfig.turnSpeedVal * (condPct < 30 ? 0.85 : 1.0);

        if (isFwd) {
          truckSpeed = Math.min(currentMaxSpeed, truckSpeed + currentAccel);
        } else if (isBwd) {
          truckSpeed = Math.max(-currentMaxSpeed * 0.5, truckSpeed - currentAccel);
        } else {
          if (truckSpeed > 0) truckSpeed = Math.max(0, truckSpeed - deceleration);
          else if (truckSpeed < 0) truckSpeed = Math.min(0, truckSpeed + deceleration);
        }

        if (Math.abs(truckSpeed) > 0.005) {
          const dir = truckSpeed > 0 ? 1 : -1;
          if (isLft) truckAngle += currentTurnSpeed * dir;
          if (isRgt) truckAngle -= currentTurnSpeed * dir;
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

        // Strict Finite Speedometer matching truck specs (30 KM/H, 38 KM/H Overdrive, 32 KM/H Deflector)
        const baseKmh = activeTruckConfig.speedKmh;
        const speedKmh = Math.min(
          isNitro ? Math.round(baseKmh * 1.35) : baseKmh,
          Math.round((Math.abs(truckSpeed) / activeTruckConfig.maxSpeedVal) * baseKmh)
        );
        setCurrentSpeed(speedKmh);
      }

      // Flash Roof Strobe matching truck theme
      if (strobeBar && strobeBar.material) {
        if (activeModelId === 'overdrive') {
          strobeBar.material.color.setHex((Math.sin(time * 24) > 0) ? 0x22d3ee : 0x06b6d4);
        } else if (activeModelId === 'deflector') {
          strobeBar.material.color.setHex((Math.sin(time * 18) > 0) ? 0xc084fc : 0x7e22ce);
        } else {
          const strobeColor = (citizenLevelRef.current >= 5) 
            ? ((Math.sin(time * 20) > 0) ? 0xfbbf24 : 0xe2fd00)
            : ((Math.sin(time * 16) > 0) ? 0xf59e0b : 0xffffff);
          strobeBar.material.color.setHex(strobeColor);
        }
      }

      // Animate Active Truck's Vector Field Visualization
      if (vectorFieldContainer) {
        if (activeModelId === 'overdrive') {
          vectorFieldContainer.rotation.y += 0.008;
          // Outward directional arrows pulse with speed / ability intensity
          const arrowPulse = 1.0 + Math.sin(time * 7.0) * 0.15;
          vectorOutwardArrows.forEach((arr) => {
            arr.scale.set(1.0, 1.0, arrowPulse);
          });
        } else if (activeModelId === 'deflector') {
          vectorFieldContainer.rotation.y -= 0.006;
          // Curved purple deflection arcs pulse with active magnetic field
          const arcPulse = 1.0 + Math.sin(time * 4.5) * 0.12;
          vectorDeflectionArcs.forEach((arc) => {
            arc.scale.set(arcPulse, 1.0, arcPulse);
          });
          // Emitter coils pulse
          const coilGlow = 0.6 + Math.sin(time * 8.0) * 0.35;
          deflectorCoils.forEach((coil) => {
            if (coil.material) coil.material.opacity = coilGlow;
          });
        } else {
          vectorFieldContainer.rotation.y += 0.004;
        }
      }

      // Gently sway grapple claw over dumpyard scrap heap
      if (grapple) {
        grapple.position.x = Math.sin(time * 1.5) * 1.4;
      }

      // ─────────────────────────────────────────────────────────────
      // 13. TRAFFIC SIMULATION & SMART VECTOR FIELD PROXIMITY BEHAVIORS
      // ─────────────────────────────────────────────────────────────
      const VECTOR_FIELD_RADIUS = 28.0;
      const FULL_STOP_DISTANCE = 5.5;

      trafficCars.forEach((tc) => {
        const distToTruck = Math.hypot(truckGroup.position.x - tc.x, truckGroup.position.z - tc.z);
        let targetCarSpeed = tc.baseSpeed;

        if (activeModelId === 'overdrive') {
          // ── OVERDRIVE VECTOR FIELD: CARS DO NOT STOP! THEY SMOOTHLY SPEED UP (1.6x) ──
          if (distToTruck < VECTOR_FIELD_RADIUS) {
            targetCarSpeed = tc.baseSpeed * 1.6;
            if (tc.taillight) tc.taillight.material.color.setHex(0x06b6d4); // Cyan speed surge
          } else {
            targetCarSpeed = tc.baseSpeed;
            if (tc.taillight) tc.taillight.material.color.setHex(0x7f1d1d);
          }
          tc.deflectOffset += (0 - tc.deflectOffset) * 0.08;

        } else if (activeModelId === 'deflector') {
          // ── DEFLECTOR VECTOR FIELD: CARS DO NOT STOP! THEY SMOOTHLY BEND/DEFLECT AWAY ──
          if (distToTruck < VECTOR_FIELD_RADIUS) {
            targetCarSpeed = tc.baseSpeed;
            if (tc.taillight) tc.taillight.material.color.setHex(0xa855f7); // Purple deflection aura

            // Smoothly push / bend cars sideways away from the truck path
            const intensity = Math.max(0, 1 - distToTruck / VECTOR_FIELD_RADIUS);
            if (tc.avenue === 'h') {
              const diffZ = tc.z - truckGroup.position.z;
              const pushDir = Math.sign(diffZ) || 1;
              const targetOffset = pushDir * Math.min(4.2, intensity * 4.8);
              tc.deflectOffset += (targetOffset - tc.deflectOffset) * 0.09;
            } else {
              const diffX = tc.x - truckGroup.position.x;
              const pushDir = Math.sign(diffX) || 1;
              const targetOffset = pushDir * Math.min(4.2, intensity * 4.8);
              tc.deflectOffset += (targetOffset - tc.deflectOffset) * 0.09;
            }
          } else {
            // Outside field: smoothly return to normal lane alignment
            targetCarSpeed = tc.baseSpeed;
            tc.deflectOffset += (0 - tc.deflectOffset) * 0.08;
            if (tc.taillight) tc.taillight.material.color.setHex(0x7f1d1d);
          }

        } else {
          // ── SWACHH BHARAT STANDARD: CARS DO NOT STOP! THEY SMOOTHLY DECELERATE FROM 2x TO 1x ──
          if (distToTruck < VECTOR_FIELD_RADIUS) {
            // Smoothly drop from 2x (tc.baseSpeed) down to 1x (tc.baseSpeed * 0.5) near the truck
            const factor = Math.min(1.0, Math.max(0.5, distToTruck / VECTOR_FIELD_RADIUS));
            targetCarSpeed = tc.baseSpeed * factor;
            if (tc.taillight) tc.taillight.material.color.setHex(0xf59e0b); // Amber caution lights
          } else {
            targetCarSpeed = tc.baseSpeed;
            if (tc.taillight) tc.taillight.material.color.setHex(0x7f1d1d);
          }
          tc.deflectOffset += (0 - tc.deflectOffset) * 0.08;
        }

        tc.currentSpeed += (targetCarSpeed - tc.currentSpeed) * 0.16;

        if (tc.avenue === 'h') {
          tc.x += tc.dir * tc.currentSpeed;
          if (tc.x > fenceLimit - 6) tc.x = -fenceLimit + 6;
          if (tc.x < -fenceLimit + 6) tc.x = fenceLimit - 6;
          tc.group.position.x = tc.x;
          tc.group.position.z = tc.baseZ + tc.deflectOffset;
          // Realistic slight steering angle while deflecting
          if (Math.abs(tc.deflectOffset) > 0.05) {
            tc.group.rotation.y = (tc.dir > 0 ? Math.PI / 2 : -Math.PI / 2) - Math.min(0.25, Math.max(-0.25, tc.deflectOffset * 0.08)) * tc.dir;
          } else {
            tc.group.rotation.y = tc.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          }
        } else {
          tc.z += tc.dir * tc.currentSpeed;
          if (tc.z > fenceLimit - 6) tc.z = -fenceLimit + 6;
          if (tc.z < -fenceLimit + 6) tc.z = fenceLimit - 6;
          tc.group.position.z = tc.z;
          tc.group.position.x = tc.baseX + tc.deflectOffset;
          if (Math.abs(tc.deflectOffset) > 0.05) {
            tc.group.rotation.y = (tc.dir > 0 ? 0 : Math.PI) + Math.min(0.25, Math.max(-0.25, tc.deflectOffset * 0.08)) * tc.dir;
          } else {
            tc.group.rotation.y = tc.dir > 0 ? 0 : Math.PI;
          }
        }

        // ── TWO-WAY COLLISION SYSTEM (COLLISION FROM BOTH SIDES) ──
        // Trigger crash if player rams car OR if fast-moving traffic car rams into truck!
        if (!isCrashedRef.current) {
          // Check collision distance threshold between truck bounding box and traffic car
          if (distToTruck < 3.4) {
            const playerMoving = Math.abs(truckSpeed) > 0.08;
            const carMoving = (tc.currentSpeed || tc.baseSpeed) > 0.18;

            if (playerMoving) {
              // Player rammed traffic vehicle
              triggerCrash("Traffic Vehicle (Direct Impact)");
            } else if (carMoving) {
              // Traffic vehicle rammed player's truck from front, rear, or side!
              triggerCrash("Traffic Vehicle (Rear/Side Ramming)");
            }
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

            // Waste collection duration tied strictly to truck model:
            // Swachh Bharat Standard: 3.0s | Overdrive: 1.5s | Deflector: 2.0s
            const currentDuration = TRUCK_MODELS_DATA[selectedTruckModelRef.current]?.collectionDuration || 3.0;
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

              // Separate Currencies Earned:
              // Game Coins (in-game upgrades) + Eco-Points (citizen voucher redemption)
              const earnedCoins = 100;
              const earnedEcoPts = 50;

              setWasteCollected((prev) => {
                const nextVal = prev + 1;
                wasteCollectedRef.current = nextVal;
                if (nextVal >= smartBins.length) {
                  setNotification("🚀 ALL 6 BINS COLLECTED! Deliver cargo to Northern Dumpyard to Level Up & earn +2 Coins!");
                } else {
                  setNotification(`✅ Emptied Spot #${stoppedNearBin.id}! (+${earnedCoins} Coins, +${earnedEcoPts} Eco-Points)`);
                }
                return nextVal;
              });

              setCurrentLoad((prev) => {
                const nextLoad = Math.min(truckCapacity, prev + 25);
                currentLoadRef.current = nextLoad;
                return nextLoad;
              });

              setGameCoins((prev) => {
                const next = prev + earnedCoins;
                gameCoinsRef.current = next;
                localStorage.setItem('smartbin_game_coins', next.toString());
                return next;
              });

              setEcoPoints((prev) => {
                const nextPts = prev + earnedEcoPts;
                ecoPointsRef.current = nextPts;
                return nextPts;
              });

              // Save to Database (No data loss)
              saveCitizenPoints(earnedEcoPts);

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
      // 15. DUMPYARD UNLOADING & MISSION COMPLETION EVALUATION
      // ─────────────────────────────────────────────────────────────
      const distToDumpyard = Math.hypot(truckGroup.position.x - dumpyardPos.x, truckGroup.position.z - dumpyardPos.z);
      if (distToDumpyard < 14.0 && currentLoadRef.current > 0 && Math.abs(truckSpeed) < 0.05 && !isCrashedRef.current && !missionResultData) {
        playSound('dump');
        setCurrentLoad(0);
        currentLoadRef.current = 0;

        const activeDiff = DIFFICULTY_TIERS[difficultyTierRef.current] || DIFFICULTY_TIERS.rookie;
        const timeLimitSec = activeDiff.timeLimit || 240;
        const elapsedSec = Math.floor(shiftTimeRef.current);
        const withinDeadline = elapsedSec <= timeLimitSec;
        const timeRemaining = Math.max(0, timeLimitSec - elapsedSec);

        const binsEmptied = wasteCollectedRef.current;
        const reqBins = activeDiff.requiredBins || 4;
        const mandatoryCompleted = binsEmptied >= reqBins;
        const allBinsDone = binsEmptied >= smartBins.length;
        const noCollisions = collisionCountRef.current === 0;

        // Reward Formula (as specified in Step 2 / Progression Spec):
        // Net Coins = Base Reward + Collection Bonus + Time Bonus + Optional Objective Bonuses - Mission Penalties
        const baseCoins = mandatoryCompleted ? Math.round(activeDiff.baseReward * activeDiff.rewardMultiplier) : Math.round(activeDiff.baseReward * 0.4);
        const fullCollectBonus = allBinsDone ? activeDiff.fullCollectionBonus : 0;
        const timeBonus = withinDeadline ? activeDiff.timeBonus : 0;
        const zeroCrashBonus = noCollisions ? activeDiff.optionalObjectiveBonus : 0;
        const collisionPenalties = collisionCountRef.current * 15;

        const netCoins = Math.max(25, baseCoins + fullCollectBonus + timeBonus + zeroCrashBonus - collisionPenalties);

        // XP Reward Calculation:
        // Complete mission: 100 XP, Target bins: 25 XP, Deadline: 30 XP, No collision: 20 XP, All bins: 40 XP
        let earnedXp = 0;
        if (mandatoryCompleted) {
          earnedXp += activeDiff.xpComplete; // 100+
          earnedXp += 25; // Target bins
          if (withinDeadline) earnedXp += 30; // Deadline
          if (noCollisions) earnedXp += 20; // Zero collisions
          if (allBinsDone) earnedXp += 40; // Optional all bins
        } else {
          earnedXp = Math.min(20, binsEmptied * 5); // Partial failed progress
        }

        // Apply XP progression
        addDriverExperience(earnedXp);

        // Credit Net Coins
        setGameCoins((prev) => {
          const next = prev + netCoins;
          gameCoinsRef.current = next;
          localStorage.setItem('smartbin_game_coins', next.toString());
          return next;
        });

        // Credit Eco-Points for civic app
        const bonusEcoPts = mandatoryCompleted ? 150 : 40;
        setEcoPoints((prev) => {
          const next = prev + bonusEcoPts;
          ecoPointsRef.current = next;
          return next;
        });

        setMissionResultData({
          success: mandatoryCompleted,
          tierName: activeDiff.name,
          binsEmptied,
          reqBins,
          allBinsDone,
          elapsedSec,
          timeLimitSec,
          withinDeadline,
          timeRemaining,
          collisions: collisionCountRef.current,
          baseCoins,
          fullCollectBonus,
          timeBonus,
          zeroCrashBonus,
          collisionPenalties,
          netCoins,
          earnedXp,
          earnedEcoPts: bonusEcoPts,
          conditionRemaining: truckConditionRef.current
        });

        playSound('level_up');
        setMissionComplete(true);
        setNotification(`🏆 Mission Evaluated: +${netCoins} Coins, +${earnedXp} XP, +${bonusEcoPts} Eco-Points!`);
      }

      // ── TIME LIMIT EXPIRATION (Deadline Failure Trigger) ──
      const activeDiff = DIFFICULTY_TIERS[difficultyTierRef.current] || DIFFICULTY_TIERS.rookie;
      if (!missionResultData && !missionComplete && shiftTimeRef.current > (activeDiff.timeLimit + 10)) {
        // Trigger mission expiration if time passed beyond deadline
        const binsEmptied = wasteCollectedRef.current;
        const reqBins = activeDiff.requiredBins || 4;
        const mandatoryCompleted = binsEmptied >= reqBins;
        const earnedXp = Math.min(20, binsEmptied * 5);
        const netCoins = 40; // minimal compensation

        addDriverExperience(earnedXp);
        setGameCoins((prev) => {
          const next = prev + netCoins;
          gameCoinsRef.current = next;
          localStorage.setItem('smartbin_game_coins', next.toString());
          return next;
        });

        setMissionResultData({
          success: false,
          failureReason: "Shift Deadline Exceeded!",
          tierName: activeDiff.name,
          binsEmptied,
          reqBins,
          allBinsDone: false,
          elapsedSec: Math.floor(shiftTimeRef.current),
          timeLimitSec: activeDiff.timeLimit,
          withinDeadline: false,
          timeRemaining: 0,
          collisions: collisionCountRef.current,
          baseCoins: 40,
          fullCollectBonus: 0,
          timeBonus: 0,
          zeroCrashBonus: 0,
          collisionPenalties: collisionCountRef.current * 10,
          netCoins,
          earnedXp,
          earnedEcoPts: 20,
          conditionRemaining: truckConditionRef.current
        });
        setMissionComplete(true);
      }

      // Animate Workshop holographic wrench & pedestals
      if (wrenchHolo) {
        wrenchHolo.rotation.y += 0.02;
        wrenchHolo.rotation.x += 0.01;
      }
      if (dumpyardBadgeMesh) dumpyardBadgeMesh.rotation.y += 0.02;
      if (garageBadgeMesh) garageBadgeMesh.rotation.y += 0.02;
      if (turboTurbine) turboTurbine.rotation.x += 0.08;
      if (magCoil) magCoil.rotation.z += 0.04;

      // Check Workshop Proximity (At South x: 0, z: 115)
      const distToWorkshop = Math.hypot(truckGroup.position.x - workshopPos.x, truckGroup.position.z - workshopPos.z);
      if (distToWorkshop < 14.0) {
        setIsNearWorkshop(true);
        isNearWorkshopRef.current = true;
      } else {
        setIsNearWorkshop(false);
        isNearWorkshopRef.current = false;
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
          workshop: workshopPos,
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
      // 17. CAMERA VIEWS (SHOWROOM TURNTABLE VS CITY CHASE / TOPDOWN)
      // ─────────────────────────────────────────────────────────────
      const isShowroom = (gameScreenRef.current === 'garage' || gameScreenRef.current === 'menu');

      if (isShowroom) {
        // Slow automatic idle rotation if not dragging
        if (!isShowroomDraggingRef.current) {
          showroomAngleRef.current += delta * 0.45;
        }

        // Dr. Driving Garage Showroom Turntable
        const angle = showroomAngleRef.current;
        const camDistance = 8.8;
        const camElevation = 2.8;

        // Position camera around the truck centered at origin
        camera.position.x = Math.sin(angle) * camDistance;
        camera.position.y = camElevation;
        camera.position.z = Math.cos(angle) * camDistance;
        camera.lookAt(0, 1.3, 0);

        // Keep truck group centered on the turntable in garage view
        truckGroup.position.set(0, 0, 0);
        truckGroup.rotation.y = 0;
      } else {
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
      {/* ─────────────────────────────────────────────────────────────
          TOP STATUS BAR & DRIVER CONTROLS (Rendered in City Mode)
          User instruction: "upar m bahut sare bars ho gaye unko hata k sirf player nam aur points dikha"
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'city' && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          
          {/* Left: Player Profile & Dual Currency Badge */}
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-black text-emerald-400">
              <User size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{getCitizenUser()?.name || 'Citizen Driver'}</span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Lvl {citizenLevel}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mt-0.5">
                <span className="text-amber-400 font-black flex items-center gap-1" title="Game Coins for Truck Upgrades & Workshop">
                  <span>🪙</span>
                  <span>{gameCoins}</span>
                  <span className="text-[9px] text-amber-500/90 font-bold uppercase">Coins</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[#e2fd00] font-black flex items-center gap-1" title="Eco-Points for Citizen Voucher Redemption">
                  <span>🌱</span>
                  <span>{ecoPoints}</span>
                  <span className="text-[9px] text-emerald-400/90 font-bold uppercase">Eco-Pts</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Active Shift Timer, XP Progression & Truck Condition */}
          <div className="pointer-events-auto flex items-center gap-3">
            {/* Shift Timer & Difficulty */}
            <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Timer size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded" style={{ backgroundColor: `${DIFFICULTY_TIERS[difficultyTier]?.color || '#22c55e'}30`, color: DIFFICULTY_TIERS[difficultyTier]?.color || '#22c55e' }}>
                    {DIFFICULTY_TIERS[difficultyTier]?.name || 'Rookie'}
                  </span>
                </div>
                <span className="font-black text-sm text-amber-400 tracking-wider">
                  {String(Math.floor(shiftTime / 60)).padStart(2, '0')}:{String(shiftTime % 60).padStart(2, '0')}
                  <span className="text-[10px] text-slate-400 font-semibold ml-1">/ {Math.floor((DIFFICULTY_TIERS[difficultyTier]?.timeLimit || 300) / 60)}m</span>
                </span>
              </div>
            </div>

            {/* Driver Level XP Progress Bar */}
            <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl border border-white/10 text-white min-w-[140px] hidden md:block">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-slate-400">Level {citizenLevel} XP</span>
                <span className="font-black text-cyan-400">{levelXP} / {getRequiredXp(citizenLevel)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (levelXP / getRequiredXp(citizenLevel)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Truck Chassis Condition Meter */}
            <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl border border-white/10 text-white min-w-[130px] hidden sm:block">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Chassis</span>
                </span>
                <span className={`font-black ${truckCondition > 70 ? 'text-emerald-400' : truckCondition > 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {truckCondition}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${truckCondition > 70 ? 'bg-emerald-400' : truckCondition > 35 ? 'bg-amber-400' : 'bg-rose-500'}`}
                  style={{ width: `${truckCondition}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Garage Quick-Switch, Pause, Audio & Exit */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                const curIdx = truckKeysList.indexOf(selectedTruckModel);
                setPreviewTruckIndex(curIdx >= 0 ? curIdx : 0);
                previewTruckIndexRef.current = curIdx >= 0 ? curIdx : 0;
                applyTruckModelVisualsRef.current?.(selectedTruckModel);
                setGameScreen('garage');
                gameScreenRef.current = 'garage';
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-emerald-950/80 border border-white/10 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              title="Open 3D Truck Garage"
            >
              <Truck size={14} />
              <span className="hidden sm:inline">Garage</span>
            </button>

            <button
              onClick={() => {
                setIsPaused((p) => {
                  const nextP = !p;
                  isPausedRef.current = nextP;
                  return nextP;
                });
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              title="Pause Game [Esc]"
            >
              <span>⏸</span>
              <span className="hidden sm:inline">Pause</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-lg"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-400" />}
            </button>
            
            <button
              onClick={handleSignOutImmediate}
              className="px-3.5 py-2 rounded-xl bg-slate-900/85 hover:bg-rose-950/80 border border-white/10 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              title="Exit / Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      )}

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
          BUILDING INSPECTION NOTIFICATION TOAST
          User instruction: "ye aaise upar mat khol notification type kar"
          ───────────────────────────────────────────────────────────── */}
      {gameMode === 'game' && activeBuildingInfo && !showBuildingPieceModal && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in slide-in-from-bottom-2">
          <div className="bg-slate-950/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-3 text-white">
            <span className="text-base">🏢</span>
            <div className="text-left">
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">
                NEARBY ZONE AUDIT (+{activeBuildingInfo.points} PTS)
              </span>
              <span className="text-xs font-black text-white">
                {activeBuildingInfo.name}
              </span>
            </div>
            <button
              onClick={() => setShowBuildingPieceModal(activeBuildingInfo)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase shadow transition cursor-pointer flex items-center gap-1"
            >
              <span>Inspect</span>
              <span className="hidden sm:inline bg-slate-900/30 px-1 rounded text-[10px]">[E]</span>
            </button>
            <button
              onClick={() => setActiveBuildingInfo(null)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WORKSHOP BAY INTERACTIVE PROMPT (At South x: 0, z: 115)
          User instruction: "shop game m bana de eak jagah waha p disply m truck k parts dikha"
          ───────────────────────────────────────────────────────────── */}
      {isNearWorkshop && !showGarageShop && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in zoom-in-95 flex items-center gap-3">
          <button
            onClick={() => {
              setGameScreen('garage');
              gameScreenRef.current = 'garage';
              playSound('horn');
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-2.5 active:scale-95 transition cursor-pointer uppercase"
          >
            <span className="text-base">🚗</span>
            <span>[ PRESS E / CLICK ] ENTER 3D GARAGE</span>
          </button>

          <button
            onClick={() => setShowGarageShop(true)}
            className="bg-slate-950/95 border-2 border-[#e2fd00] text-white px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(226,253,0,0.4)] flex items-center gap-2 active:scale-95 transition cursor-pointer font-black text-xs"
          >
            <span>🛠️</span>
            <span>[ Q ] PARTS WORKSHOP</span>
          </button>
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
                    eco_points: 0
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
          MISSION RESULTS & DRIVER EVALUATION SCREEN (STEP 9 SPEC)
          ───────────────────────────────────────────────────────────── */}
      {missionComplete && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-center space-y-5 text-white max-h-[92vh] overflow-y-auto">
            
            {/* Status Icon & Title */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${missionResultData?.success !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
              {missionResultData?.success !== false ? <Award size={36} className="animate-bounce" /> : <AlertTriangle size={36} />}
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ backgroundColor: `${DIFFICULTY_TIERS[difficultyTier]?.color || '#22c55e'}25`, color: DIFFICULTY_TIERS[difficultyTier]?.color || '#22c55e' }}>
                {missionResultData?.tierName || DIFFICULTY_TIERS[difficultyTier]?.name} MISSION
              </div>
              <h2 className="text-2xl font-black text-white">
                {missionResultData?.success !== false ? '🎉 MISSION COMPLETED!' : '⚠️ MISSION INCOMPLETE'}
              </h2>
              <p className="text-slate-300 text-xs mt-1">
                {missionResultData?.failureReason || 'Municipal waste collection evaluated against operational deadlines and safety protocols.'}
              </p>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bins Cleaned</span>
                <span className="text-base font-black text-emerald-400">
                  {missionResultData?.binsEmptied || wasteCollected} / {missionResultData?.reqBins || 4}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Taken</span>
                <span className={`text-base font-black ${missionResultData?.withinDeadline ? 'text-amber-400' : 'text-rose-400'}`}>
                  {missionResultData?.elapsedSec || shiftTime}s
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Collisions</span>
                <span className={`text-base font-black ${(missionResultData?.collisions || 0) === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {missionResultData?.collisions || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Chassis Cond.</span>
                <span className={`text-base font-black ${truckCondition > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {truckCondition}%
                </span>
              </div>
            </div>

            {/* Economy & XP Reward Breakdown Formula (Net Coins Formula) */}
            <div className="bg-slate-950/90 p-4 rounded-2xl border border-white/10 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                <span>REWARDS & PENALTIES BREAKDOWN</span>
                <span className="text-amber-400 font-black">FORMULA</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Mission Reward:</span>
                <span className="font-bold text-white">+{missionResultData?.baseCoins || 200} Coins</span>
              </div>
              {(missionResultData?.fullCollectBonus || 0) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Full Collection Target Bonus:</span>
                  <span className="font-bold">+{missionResultData?.fullCollectBonus} Coins</span>
                </div>
              )}
              {(missionResultData?.timeBonus || 0) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Deadline Completion Bonus:</span>
                  <span className="font-bold">+{missionResultData?.timeBonus} Coins</span>
                </div>
              )}
              {(missionResultData?.zeroCrashBonus || 0) > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>Zero Collision Clean Bonus:</span>
                  <span className="font-bold">+{missionResultData?.zeroCrashBonus} Coins</span>
                </div>
              )}
              {(missionResultData?.collisionPenalties || 0) > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Collision Damage Penalties:</span>
                  <span className="font-bold">-{missionResultData?.collisionPenalties} Coins</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-black">
                <span className="text-white">NET REWARD:</span>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">+{missionResultData?.earnedXp || 0} XP</span>
                  <span className="text-amber-400">🪙 +{missionResultData?.netCoins || 100} Coins</span>
                </div>
              </div>
            </div>

            {/* Driver Progression Status Bar */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-left">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white">Driver Level {citizenLevel} Progress:</span>
                <span className="text-cyan-400">{levelXP} / {getRequiredXp(citizenLevel)} XP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (levelXP / getRequiredXp(citizenLevel)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Repair Truck Prompt if Damaged */}
            {truckCondition < 100 && (
              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between text-left text-xs">
                <div>
                  <span className="text-amber-400 font-bold block">Chassis Damaged ({truckCondition}%)</span>
                  <span className="text-slate-400 text-[11px]">Restore condition to remove performance penalties</span>
                </div>
                <button
                  onClick={repairTruckInGarage}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  Repair (-{(100 - truckCondition) * (DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1)} Coins)
                </button>
              </div>
            )}

            {/* Action Buttons: Retry / Garage / Dashboard */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={() => {
                  setMissionComplete(false);
                  setMissionResultData(null);
                  setWasteCollected(0);
                  wasteCollectedRef.current = 0;
                  setShiftTime(0);
                  shiftTimeRef.current = 0;
                  setCollisionCount(0);
                  collisionCountRef.current = 0;
                  handleManualRespawn();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer transition active:scale-95"
              >
                Start New Shift
              </button>
              <button
                onClick={() => {
                  setMissionComplete(false);
                  setMissionResultData(null);
                  setGameScreen('garage');
                  gameScreenRef.current = 'garage';
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer transition active:scale-95"
              >
                Go to Garage
              </button>
              <button
                onClick={onExit}
                className="sm:w-32 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-black text-xs uppercase rounded-xl border border-white/10 cursor-pointer transition"
              >
                App Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GTA-STYLE CIRCULAR MINI-MAP RADAR HUD (Bottom-Left)
          Fixed Arrow in Center (Always Points Up), Map Rotates Underneath!
          (Rendered only in City driving mode)
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'city' && (() => {
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

                    {/* Dumpyard Salvage Landfill Ground Pad */}
                    <rect x="-24" y="-132" width="48" height="28" fill="#064e3b" rx="4" stroke="#10b981" strokeWidth="1.2" />
                    {/* GTA-STYLE BLIP: DUMPYARD 'D' (Always counter-rotates so letter D stays upright!) */}
                    <g transform={`translate(${radarData.dumpyard.x}, ${radarData.dumpyard.z}) rotate(${-mapRotationDeg})`}>
                      <circle cx="0" cy="0" r="7.8" fill="#10b981" stroke="#ffffff" strokeWidth="1.6" />
                      <text cx="0" cy="0.5" textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="system-ui, sans-serif">D</text>
                    </g>

                    {/* Garage Showroom Apron Pad */}
                    <rect x="-22" y="103" width="44" height="26" fill="#1e1b4b" rx="4" stroke="#f59e0b" strokeWidth="1.2" />
                    {/* GTA-STYLE BLIP: GARAGE 'G' (Always counter-rotates so letter G stays upright!) */}
                    <g transform={`translate(${radarData.workshop?.x || 0}, ${radarData.workshop?.z || 115}) rotate(${-mapRotationDeg})`}>
                      <circle cx="0" cy="0" r="7.8" fill="#f59e0b" stroke="#000000" strokeWidth="1.6" />
                      <text cx="0" cy="0.5" textAnchor="middle" dominantBaseline="central" fill="#000000" fontSize="9.5" fontWeight="900" fontFamily="system-ui, sans-serif">G</text>
                    </g>

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
          BOTTOM STATUS & SPEEDOMETER (Rendered in City Mode)
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'city' && (
        <div className="absolute bottom-6 right-6 flex items-center gap-4 pointer-events-none z-20">
          
          {/* Speedometer */}
          <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4 pointer-events-auto text-white">
            <div className="text-center">
              <span className="text-3xl font-black text-white tracking-tight">{currentSpeed}</span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">KM / H (MAX {activeTruckConfig.speedKmh})</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{activeTruckConfig.name}</p>
              <p className="font-extrabold text-xs text-emerald-400">Cap: {activeTruckConfig.speedKmh} KM/H</p>
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
      )}

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
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-amber-400 text-sm flex items-center gap-1.5">
                        <Gift size={16} /> CITIZEN REWARDS VOUCHERS CATALOG
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Redeem civic discounts earned through source segregation and street audits.
                      </p>
                    </div>
                    <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-right shrink-0 ml-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Voucher Wallet</span>
                      <span className="text-[#e2fd00] font-black text-xs">🌱 {ecoPoints} Eco-Pts</span>
                    </div>
                  </div>

                  {/* Vouchers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {MUNICIPAL_VOUCHERS.map((v) => {
                      const redeemed = redeemedVouchers.find((r) => r.id === v.id);
                      const canAfford = ecoPoints >= v.cost;

                      return (
                        <div
                          key={v.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                            redeemed
                              ? 'bg-emerald-950/40 border-emerald-500/40'
                              : 'bg-slate-900 border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-xs text-white">{v.brand}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{v.category}</span>
                            </div>
                            <h5 className="font-extrabold text-[11px] text-amber-300">{v.title}</h5>
                            <p className="text-[10px] text-slate-300 mt-1 leading-tight">{v.desc}</p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                            {redeemed ? (
                              <div className="w-full flex items-center justify-between gap-1">
                                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check size={10} /> REDEEMED
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard?.writeText(redeemed.code);
                                    setCopiedVoucherCode(redeemed.code);
                                    setTimeout(() => setCopiedVoucherCode(null), 2000);
                                  }}
                                  className="text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-emerald-400 flex items-center gap-1 cursor-pointer"
                                  title="Click to copy voucher promo code"
                                >
                                  <Copy size={10} />
                                  <span>{copiedVoucherCode === redeemed.code ? 'COPIED!' : redeemed.code}</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-[11px] font-black text-[#e2fd00]">🌱 {v.cost} Pts</span>
                                <button
                                  disabled={!canAfford}
                                  onClick={() => {
                                    if (canAfford) {
                                      const nextPts = ecoPoints - v.cost;
                                      setEcoPoints(nextPts);
                                      ecoPointsRef.current = nextPts;
                                      saveCitizenPoints(-v.cost);
                                      const generatedCode = `${v.codePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
                                      const updated = [...redeemedVouchers, { id: v.id, code: generatedCode, date: new Date().toLocaleDateString(), brand: v.brand, title: v.title }];
                                      setRedeemedVouchers(updated);
                                      localStorage.setItem('smartbin_redeemed_vouchers', JSON.stringify(updated));
                                      playSound('collect');
                                      setNotification(`🎉 Claimed ${v.title}! Promo Code: ${generatedCode}`);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition cursor-pointer ${
                                    canAfford
                                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {canAfford ? 'Redeem Voucher' : `Need ${v.cost - ecoPoints} Pts`}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* More Rewards Coming Soon Banner (User requested) */}
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-dashed border-amber-500/40 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Sparkles size={13} />
                      <span>More Rewards Coming Soon...</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Upcoming partnerships with Reliance Smart Superstore, Indian Oil Clean Fuel, and IRCTC Rail Credits!
                    </p>
                  </div>
                </div>
              ) : showBuildingPieceModal.id === 'block-10' ? (
                /* Block 10: SmartBin GIS Fleet Command HQ */
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sky-400 text-xs flex items-center gap-1.5">
                      <Cpu size={14} /> C++ VRP Fleet Routing & IoT LoRa Telemetry
                    </span>
                    <span className="text-emerald-400 font-extrabold text-[11px]">GIS Mesh Online</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Fuel Saved</span>
                      <strong className="text-emerald-400 text-sm">3.4 Litres</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">CO2 Diverted</span>
                      <strong className="text-sky-400 text-sm">24.2 kg</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">VRP Runtime</span>
                      <strong className="text-amber-400 text-sm">1.8 ms (C++)</strong>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Live City Bin Fill Status (LoRa Sensors):</span>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      {['Spot #1: 78%', 'Spot #2: 92%', 'Spot #3: 45%', 'Spot #4: 64%', 'Spot #5: 88%', 'Spot #6: 55%'].map((st, i) => (
                        <div key={i} className="bg-slate-900/90 px-2 py-1 rounded text-slate-300 font-bold border border-white/5 flex items-center justify-between">
                          <span>{st.split(':')[0]}</span>
                          <span className="text-emerald-400">{st.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : showBuildingPieceModal.category === 'cafe' ? (
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-800 p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-400 text-xs flex items-center gap-1.5">
                      <Coffee size={14} /> Commercial Food Waste Composter & Biogas
                    </span>
                    <span className="text-emerald-300 font-bold text-[11px]">32 kg Daily Scrap</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Biogas Diverted</span>
                      <strong className="text-white">100% Organic (18.4 m³)</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Customer Discount</span>
                      <strong className="text-[#e2fd00]">10% Off with QR Stamp</strong>
                    </div>
                  </div>
                </div>
              ) : showBuildingPieceModal.category === 'residential' ? (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-400 text-xs flex items-center gap-1.5">
                      <Home size={14} /> Decentralized Housing Society Waste Tracker
                    </span>
                    <span className="text-emerald-300 font-bold text-[11px]">94% Source Segregated</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Rotary Composter</span>
                      <strong className="text-white">Active Aerobic Drum (54°C)</strong>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Civic Rebate</span>
                      <strong className="text-[#e2fd00]">5% Municipal Tax Credit</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">IoT Ultrasonic Telemetry:</span>
                    <span className="text-[#e2fd00] font-black">Connected (LoRaWAN Grid)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">Earned Exploration Credit:</span>
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
          GAME MAIN MENU OVERLAY (gameScreen === 'menu')
          Standalone 3D Game experience entry hub
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'menu' && (
        <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 sm:p-10 pointer-events-none bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/70 backdrop-blur-[2px]">
          {/* Menu Top Bar */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-black text-emerald-400 shadow-xl">
                <Truck size={26} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  <span>SMARTBIN: 3D CITY RUN</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">GAME</span>
                </h1>
                <p className="text-xs text-slate-300">Clean the living city • Master vector forces • Unlock heavy haulers</p>
              </div>
            </div>

            {/* Profile & Wallet */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 text-xs">
                <span className="text-amber-400 font-black flex items-center gap-1">
                  <span>🪙</span>
                  <span>{gameCoins}</span>
                  <span className="text-[9px] uppercase font-bold text-amber-500">Coins</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[#e2fd00] font-black flex items-center gap-1">
                  <span>🌱</span>
                  <span>{ecoPoints}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-400">Eco-Pts</span>
                </span>
              </div>
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-rose-950/80 border border-white/10 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                title="Return to SmartBin Municipal App"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Exit to App</span>
              </button>
            </div>
          </div>

          {/* Menu Center Deck: Difficulty Tiers & Driver Progression */}
          <div className="max-w-2xl mx-auto w-full pointer-events-auto my-auto space-y-4">
            {/* Driver Profile & XP Progress Card */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                  {citizenLevel}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-white">Driver Level {citizenLevel}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                      {levelXP} / {getRequiredXp(citizenLevel)} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {getRequiredXp(citizenLevel) - levelXP} XP to Level {citizenLevel + 1} • Earn XP by finishing shifts & safe driving
                  </p>
                </div>
              </div>

              {/* Chassis Condition */}
              <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Truck Condition</span>
                  <span className={`font-black text-sm ${truckCondition > 70 ? 'text-emerald-400' : truckCondition > 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {truckCondition}% Chassis
                  </span>
                </div>
                {truckCondition < 100 && (
                  <button
                    onClick={repairTruckInGarage}
                    className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    Repair
                  </button>
                )}
              </div>
            </div>

            {/* Mission Difficulty Tier Selector (Step 2 Matrix) */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 text-white shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Select Mission Difficulty Tier</span>
                <span className="text-[11px] font-bold text-emerald-400">
                  {DIFFICULTY_TIERS[difficultyTier]?.name} ({DIFFICULTY_TIERS[difficultyTier]?.trafficCount} Cars • {DIFFICULTY_TIERS[difficultyTier]?.timeLimit}s)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(DIFFICULTY_TIERS).map((diff) => {
                  const isSelected = difficultyTier === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => {
                        setDifficultyTier(diff.id);
                        difficultyTierRef.current = diff.id;
                        localStorage.setItem('smartbin_difficulty_tier', diff.id);
                        playSound('horn');
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-slate-800 border-2 shadow-lg'
                          : 'bg-slate-950/60 border-white/5 hover:bg-slate-800/60'
                      }`}
                      style={{ borderColor: isSelected ? diff.color : undefined }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: diff.color }}>
                        {diff.badge}
                      </span>
                      <strong className="text-xs font-extrabold text-white block mt-0.5 truncate">{diff.name}</strong>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        ⏱️ {diff.timeLimit}s • {diff.requiredBins} Bins
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Bottom Action Deck */}
          <div className="max-w-xl mx-auto w-full pointer-events-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                applyTruckModelVisualsRef.current?.(selectedTruckModel);
                setGameScreen('city');
                gameScreenRef.current = 'city';
                setIsPaused(false);
                isPausedRef.current = false;
                setShiftTime(0);
                shiftTimeRef.current = 0;
                setCollisionCount(0);
                collisionCountRef.current = 0;
                setMissionResultData(null);
                playSound('horn');
                setNotification(`🚀 Shift started! [${DIFFICULTY_TIERS[difficultyTier]?.name}] Deliver bins to Northern Dumpyard within ${DIFFICULTY_TIERS[difficultyTier]?.timeLimit}s!`);
              }}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.4)] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Gamepad2 size={20} />
              <span>START {DIFFICULTY_TIERS[difficultyTier]?.name?.toUpperCase()} SHIFT</span>
            </button>

            <button
              onClick={() => {
                const curIdx = truckKeysList.indexOf(selectedTruckModel);
                setPreviewTruckIndex(curIdx >= 0 ? curIdx : 0);
                previewTruckIndexRef.current = curIdx >= 0 ? curIdx : 0;
                applyTruckModelVisualsRef.current?.(selectedTruckModel);
                setGameScreen('garage');
                gameScreenRef.current = 'garage';
                playSound('horn');
              }}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-slate-900/95 hover:bg-slate-800 border-2 border-emerald-500/60 text-white font-black text-sm uppercase tracking-wider shadow-2xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Wrench size={18} className="text-emerald-400" />
              <span>TRUCK SHOP / GARAGE</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DR. DRIVING INSPIRED 3D TRUCK GARAGE & SHOWROOM (gameScreen === 'garage')
          - Vehicle showcased on 3D turntable center stage with slow rotation and drag inspection
          - Prominent Left (<) and Right (>) navigation arrows on screen edges
          - Keyboard arrow navigation (Left/Right)
          - Live vehicle stats (Speed, Accel, Handling, Capacity, Pickup, Vector Ability, Trade-Off)
          - Buy Truck, Equip, Direct Launch "Play With This Truck", Upgrades drawer
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'garage' && (() => {
        const currentPreviewId = truckKeysList[previewTruckIndex] || 'swachh_bharat_standard';
        const truck = TRUCK_MODELS_DATA[currentPreviewId] || TRUCK_MODELS_DATA.swachh_bharat_standard;
        const isOwned = ownedTrucks.includes(truck.id);
        const isSelected = selectedTruckModel === truck.id;
        const canAfford = gameCoins >= truck.cost;

        const handleNavigateGarage = (dir) => {
          const nextIdx = dir === 'next'
            ? (previewTruckIndex + 1) % truckKeysList.length
            : (previewTruckIndex - 1 + truckKeysList.length) % truckKeysList.length;
          setPreviewTruckIndex(nextIdx);
          previewTruckIndexRef.current = nextIdx;
          const nextModelId = truckKeysList[nextIdx];
          applyTruckModelVisualsRef.current?.(nextModelId);
          playSound('horn');
        };

        return (
          <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 pointer-events-none select-none bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/75">
            
            {/* Top Garage Bar: Header, Coins, Back */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    applyTruckModelVisualsRef.current?.(selectedTruckModel);
                    setGameScreen('menu');
                    gameScreenRef.current = 'menu';
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                >
                  <span>←</span>
                  <span>Back to Menu</span>
                </button>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>MUNICIPAL 3D GARAGE</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">DR. DRIVING SHOWROOM</span>
                  </h2>
                </div>
              </div>

              {/* Wallet & Vehicle Indicator */}
              <div className="flex items-center gap-3">
                <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Garage Bank</span>
                  <span className="text-amber-400 font-black text-sm">🪙 {gameCoins} Coins</span>
                </div>
                <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-black text-slate-300">
                  {previewTruckIndex + 1} / {truckKeysList.length}
                </div>
              </div>
            </div>

            {/* Dr. Driving Signature Big Floating Navigation Arrows on Left and Right Edges */}
            <div className="absolute inset-y-0 left-3 sm:left-6 flex items-center pointer-events-auto z-50">
              <button
                onClick={() => handleNavigateGarage('prev')}
                className="w-14 h-24 sm:w-16 sm:h-28 rounded-2xl bg-slate-900/85 hover:bg-emerald-600/90 active:scale-95 border-2 border-white/20 hover:border-emerald-400 text-white font-black text-3xl flex items-center justify-center transition shadow-2xl cursor-pointer backdrop-blur-md group"
                title="Previous Truck [Left Arrow]"
              >
                <span className="group-hover:-translate-x-1 transition-transform">❮</span>
              </button>
            </div>

            <div className="absolute inset-y-0 right-3 sm:right-6 flex items-center pointer-events-auto z-50">
              <button
                onClick={() => handleNavigateGarage('next')}
                className="w-14 h-24 sm:w-16 sm:h-28 rounded-2xl bg-slate-900/85 hover:bg-emerald-600/90 active:scale-95 border-2 border-white/20 hover:border-emerald-400 text-white font-black text-3xl flex items-center justify-center transition shadow-2xl cursor-pointer backdrop-blur-md group"
                title="Next Truck [Right Arrow]"
              >
                <span className="group-hover:translate-x-1 transition-transform">❯</span>
              </button>
            </div>

            {/* Middle: 3D Turntable Drag Hint & Vehicle Name Banner */}
            <div className="pointer-events-none text-center my-auto flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                360° TURNTABLE • DRAG TO ROTATE
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mt-2">
                {truck.name}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 drop-shadow">
                {truck.tagline}
              </p>
            </div>

            {/* Bottom Card: Dr. Driving Vehicle Stats, Ability, Buy / Equip & Direct Play */}
            <div className="pointer-events-auto max-w-4xl mx-auto w-full bg-slate-900/95 backdrop-blur-xl border-2 border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-white space-y-4">
              
              {/* Stats Bar Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Speed */}
                <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Top Speed</span>
                    <strong className="text-emerald-400 font-black">{truck.speedKmh} KM/H</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(truck.speedKmh / 45) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Capacity</span>
                    <strong className="text-white font-black">{truck.capacity} kg</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(truck.capacity / 500) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Pickup Speed */}
                <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Bin Pickup</span>
                    <strong className="text-amber-300 font-black">{truck.collectionDuration}s</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((3 - truck.collectionDuration) / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Vector Aura */}
                <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Vector Field</span>
                    <strong className="text-purple-300 font-black">{truck.fieldRadius}m Radius</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-400 h-full rounded-full transition-all duration-300"
                      style={{ width: '80%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Vector Field & Trade-off Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${truck.accentColor}30`, color: truck.accentColor }}>
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="font-extrabold block text-xs" style={{ color: truck.accentColor }}>{truck.fieldName}</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{truck.fieldDesc}</p>
                  </div>
                </div>

                <div className="bg-amber-950/30 p-3 rounded-2xl border border-amber-500/20 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ⚠️
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-400 block text-xs">Chassis Trade-Off</span>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">{truck.tradeoff}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Buy / Equip + Direct Play in City */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                {isSelected ? (
                  <div className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-black text-xs uppercase flex items-center justify-center gap-2">
                    <Check size={16} /> CURRENTLY EQUIPPED
                  </div>
                ) : isOwned ? (
                  <button
                    onClick={() => {
                      setSelectedTruckModel(truck.id);
                      selectedTruckModelRef.current = truck.id;
                      localStorage.setItem('smartbin_active_truck', truck.id);
                      playSound('collect');
                      setNotification(`🚛 Equipped ${truck.name}! (${truck.fieldName})`);
                    }}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    EQUIP TRUCK
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      if (canAfford) {
                        const nextCoins = gameCoins - truck.cost;
                        setGameCoins(nextCoins);
                        gameCoinsRef.current = nextCoins;
                        localStorage.setItem('smartbin_game_coins', nextCoins.toString());
                        const updated = [...ownedTrucks, truck.id];
                        setOwnedTrucks(updated);
                        localStorage.setItem('smartbin_owned_trucks', JSON.stringify(updated));
                        setSelectedTruckModel(truck.id);
                        selectedTruckModelRef.current = truck.id;
                        localStorage.setItem('smartbin_active_truck', truck.id);
                        playSound('collect');
                        setNotification(`🎉 Purchased & equipped ${truck.name} for ${truck.cost} Coins!`);
                      }
                    }}
                    className={`w-full sm:flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? `BUY TRUCK FOR 🪙 ${truck.cost} COINS` : `LOCKED (NEED ${truck.cost - gameCoins} MORE COINS)`}
                  </button>
                )}

                {/* Direct Launch Play With This Truck */}
                <button
                  disabled={!isOwned && !isSelected}
                  onClick={() => {
                    if (isOwned || isSelected) {
                      setSelectedTruckModel(truck.id);
                      selectedTruckModelRef.current = truck.id;
                      localStorage.setItem('smartbin_active_truck', truck.id);
                      applyTruckModelVisualsRef.current?.(truck.id);
                      setGameScreen('city');
                      gameScreenRef.current = 'city';
                      setIsPaused(false);
                      isPausedRef.current = false;
                      playSound('horn');
                      setNotification(`🚀 Launched in city with ${truck.name}! Happy driving!`);
                    }
                  }}
                  className={`w-full sm:flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 ${
                    isOwned || isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Gamepad2 size={16} />
                  <span>PLAY WITH THIS TRUCK</span>
                </button>

                {/* Parts Upgrade Dialog Toggle */}
                <button
                  onClick={() => setShowGarageShop(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wrench size={15} />
                  <span>UPGRADES</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          IN-GAME PAUSE MENU (isPaused === true in City Mode)
          Resume, Visit Garage / Switch Truck, Restart Shift, Return to Menu / App
          ───────────────────────────────────────────────────────────── */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto animate-in fade-in zoom-in-95">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⏸️
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">GAME PAUSED</h3>
              <p className="text-xs text-slate-400 mt-1">Municipal truck engine idling • Progress preserved</p>
            </div>

            {/* Quick Shift Summary */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bins</span>
                <strong className="text-emerald-400">{wasteCollected} / {totalBins}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cargo</span>
                <strong className="text-amber-400">{currentLoad} kg</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Coins</span>
                <strong className="text-[#e2fd00]">🪙 {gameCoins}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer"
              >
                RESUME DRIVING [ESC]
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                  setGameScreen('garage');
                  gameScreenRef.current = 'garage';
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck size={15} />
                <span>VISIT GARAGE / SWITCH TRUCK</span>
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                  resetTruckTriggerRef.current?.("Restarted Shift");
                  setWasteCollected(0);
                  wasteCollectedRef.current = 0;
                  setCurrentLoad(0);
                  currentLoadRef.current = 0;
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} />
                <span>RESTART SHIFT</span>
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                  setGameScreen('menu');
                  gameScreenRef.current = 'menu';
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                MAIN MENU
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-rose-950/80 hover:text-rose-400 text-slate-500 font-bold text-xs transition cursor-pointer"
              >
                EXIT TO SMARTBIN MUNICIPAL APP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PARTS UPGRADES DRAWER (Can be opened from Garage or South Workshop Bay)
          ───────────────────────────────────────────────────────────── */}
      {showGarageShop && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  <Wrench size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>MUNICIPAL PERFORMANCE PARTS WORKSHOP</span>
                  </h3>
                  <p className="text-xs text-slate-400">Upgrade engine, hopper, tipper & vector coils using Game Coins</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Balance</span>
                  <span className="text-amber-400 font-black text-sm">🪙 {gameCoins} Coins</span>
                </div>
                <button
                  onClick={() => setShowGarageShop(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* TRUCK CHASSIS CONDITION & REPAIR BAY (STEP 5 SPEC) */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${truckCondition > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : truckCondition > 35 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">Chassis Structural Condition:</span>
                    <span className={`font-black text-sm ${truckCondition > 70 ? 'text-emerald-400' : truckCondition > 35 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {truckCondition}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {truckCondition === 100 
                      ? "Chassis in showroom condition. Full acceleration and top speed active." 
                      : `Repair cost: ${(100 - truckCondition) * (DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1)} Coins (${DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1} Coin/%)`}
                  </p>
                </div>
              </div>

              {truckCondition < 100 && (
                <button
                  onClick={repairTruckInGarage}
                  disabled={gameCoins < (100 - truckCondition) * (DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-lg shrink-0 cursor-pointer ${
                    gameCoins >= (100 - truckCondition) * (DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1)
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Repair Truck (-{(100 - truckCondition) * (DIFFICULTY_TIERS[difficultyTier]?.repairCostPerPct || 1)} Coins)
                </button>
              )}
            </div>

            {/* PERFORMANCE PARTS UPGRADES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-1">
              {Object.values(UPGRADE_CONFIGS).map((part) => {
                const currentLvl = truckUpgrades[part.id] || 1;
                const nextLvlObj = part.levels.find((l) => l.lvl === currentLvl + 1);
                const maxed = !nextLvlObj;
                const canAfford = nextLvlObj && gameCoins >= nextLvlObj.cost;

                return (
                  <div key={part.id} className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-white flex items-center gap-1.5">
                          <span>{part.icon}</span>
                          <span>{part.title}</span>
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Tier {currentLvl} / {part.levels.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mb-2.5">{part.desc}</p>
                      <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 border border-white/5 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Tier:</span>
                          <span className="text-emerald-400 font-bold">{part.levels.find((l) => l.lvl === currentLvl)?.label}</span>
                        </div>
                        {!maxed && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Next Tier:</span>
                            <span className="text-[#e2fd00] font-bold">{nextLvlObj.label}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      {maxed ? (
                        <span className="text-[10px] font-black text-emerald-400 w-full text-center py-1">
                          ★ MAXIMUM TIER REACHED
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-black text-amber-400">🪙 {nextLvlObj.cost} Coins</span>
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              if (canAfford) {
                                const nextCoins = gameCoins - nextLvlObj.cost;
                                setGameCoins(nextCoins);
                                gameCoinsRef.current = nextCoins;
                                localStorage.setItem('smartbin_game_coins', nextCoins.toString());
                                const updated = { ...truckUpgrades, [part.id]: currentLvl + 1 };
                                setTruckUpgrades(updated);
                                truckUpgradesRef.current = updated;
                                localStorage.setItem('smartbin_truck_upgrades', JSON.stringify(updated));
                                playSound('collect');
                                setNotification(`🛠️ Upgraded ${part.title} to Tier ${currentLvl + 1}!`);
                              }
                            }}
                            className={`px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase transition cursor-pointer ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Upgrade Tier
                          </button>
                        </>
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
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3RD COLLISION DEATH RESPAWN MODAL
          User requirement: "3 death p 1 coin respawn puch nai to kuch nai milega"
          ───────────────────────────────────────────────────────────── */}
      {showRespawnCoinModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in-95 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 text-white">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={36} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">3 VEHICLE COLLISIONS</span>
              <h3 className="text-2xl font-black text-white mt-1">OUT OF LIVES!</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Truck has sustained critical collision damage. Pay 1 Game Coin to respawn and protect your cargo, or forfeit your shift.
            </p>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Collected Bins:</span>
                <strong className="text-emerald-400">{wasteCollected} / {totalBins} Bins</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Current Payload:</span>
                <strong className="text-amber-400">{currentLoad} kg</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Coin Balance:</span>
                <strong className="text-[#e2fd00]">🪙 {gameCoins} Coins</strong>
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              <button
                disabled={gameCoins < 1}
                onClick={() => {
                  if (gameCoins >= 1) {
                    const next = gameCoins - 1;
                    setGameCoins(next);
                    gameCoinsRef.current = next;
                    localStorage.setItem('smartbin_game_coins', next.toString());
                    setLives(3);
                    livesRef.current = 3;
                    setShowRespawnCoinModal(false);
                    resetTruckTriggerRef.current?.("Paid 1 Coin: Truck Repaired & Cargo Intact");
                    playSound('collect');
                  }
                }}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  gameCoins >= 1
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>🪙 PAY 1 COIN TO RESPAWN (KEEP CARGO)</span>
              </button>
              <button
                onClick={() => {
                  setLives(3);
                  livesRef.current = 3;
                  setWasteCollected(0);
                  wasteCollectedRef.current = 0;
                  setCurrentLoad(0);
                  currentLoadRef.current = 0;
                  setShowRespawnCoinModal(false);
                  resetTruckTriggerRef.current?.("Shift Forfeited");
                  setNotification("⚠️ Shift forfeited: Cargo discarded and progress reset to zero.");
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-950/80 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-bold text-xs border border-white/5 transition cursor-pointer"
              >
                Forfeit Shift (Zero Reward)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE TOUCH ON-SCREEN CONTROLS (Rendered only in City Driving Mode)
          Ensures phone users can comfortably drive and collect without a physical keyboard
          ───────────────────────────────────────────────────────────── */}
      {gameScreen === 'city' && (
        <>
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
        </>
      )}

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
