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
  X
} from 'lucide-react';

/**
 * SMARTBIN APP FEATURES DATASET
 * Showcased dynamically at each of the 6 city garbage collection spots.
 */
const SPOT_APP_FEATURES = [
  {
    id: 1,
    title: "AI Multi-Modal Waste Classifier",
    subtitle: "Gemini 2.5 Flash Neural Vision Engine",
    category: "Plastic & Packaging",
    color: "#3b82f6",
    icon: "Bot",
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
    icon: "Radio",
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
    icon: "Navigation",
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
    icon: "Award",
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
    icon: "Gift",
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
    icon: "Building2",
    highlight: "Bilaspur Municipal Real-Time GIS",
    description: "City administrators view live heatmap clusters, track garbage fleet GPS in real time, and audit contractor cleaning verifications.",
    statLabel: "City Coverage",
    statValue: "100% Ward GIS",
    route: "/dashboard/analytics"
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
  const [currentTargetName, setCurrentTargetName] = useState("SmartBin #1 (Plastic)");
  const [targetDistance, setTargetDistance] = useState(0);
  const [notification, setNotification] = useState("Shift Started: Slower, smooth steering activated. Follow GTA Radar at bottom-left!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('chase');
  const [showHelp, setShowHelp] = useState(false);
  
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

      if (type === 'suction') {
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
      } else if (type === 'horn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(311.13, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
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

    // Hazard Signs on Fences
    const signGeo = new THREE.BoxGeometry(7, 1.8, 0.2);
    const signMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    [
      { x: 0, z: -fenceLimit + 0.4, rotY: 0 },
      { x: 0, z: fenceLimit - 0.4, rotY: Math.PI },
      { x: -fenceLimit + 0.4, z: 0, rotY: Math.PI / 2 },
      { x: fenceLimit - 0.4, z: 0, rotY: -Math.PI / 2 }
    ].forEach((sp) => {
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(sp.x, 4.2, sp.z);
      sign.rotation.y = sp.rotY;
      fenceGroup.add(sign);
    });

    scene.add(fenceGroup);

    // ─────────────────────────────────────────────────────────────
    // 5. MUNICIPAL DUMPYARD & RECYCLING FACILITY
    // ─────────────────────────────────────────────────────────────
    const dumpyardPos = { x: 0, z: -115 };
    const dumpyardGroup = new THREE.Group();

    // Apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.4, 24),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    apron.position.set(dumpyardPos.x, 0.2, dumpyardPos.z);
    apron.receiveShadow = true;
    dumpyardGroup.add(apron);

    // Striped Curb
    const curbStripe = new THREE.Mesh(
      new THREE.BoxGeometry(36.4, 0.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    curbStripe.position.set(dumpyardPos.x, 0.26, dumpyardPos.z + 11.8);
    dumpyardGroup.add(curbStripe);

    // Hangar
    const hangar = new THREE.Mesh(
      new THREE.BoxGeometry(32, 13, 16),
      new THREE.MeshLambertMaterial({ color: 0x0f766e })
    );
    hangar.position.set(dumpyardPos.x, 6.7, dumpyardPos.z - 4);
    hangar.castShadow = true;
    dumpyardGroup.add(hangar);

    // Signboard
    const dumpSign = new THREE.Mesh(
      new THREE.BoxGeometry(26, 2.8, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
    );
    dumpSign.position.set(dumpyardPos.x, 14.8, dumpyardPos.z + 4.2);
    dumpyardGroup.add(dumpSign);

    // Sorting Dumpsters
    const sorterColors = [0x2563eb, 0x475569, 0x16a34a];
    [-10, 0, 10].forEach((sx, idx) => {
      const sorter = new THREE.Mesh(
        new THREE.BoxGeometry(7, 3.2, 5.5),
        new THREE.MeshLambertMaterial({ color: sorterColors[idx] })
      );
      sorter.position.set(dumpyardPos.x + sx, 1.8, dumpyardPos.z + 5.5);
      sorter.castShadow = true;
      dumpyardGroup.add(sorter);
    });

    // Beacon Tower
    const beaconTower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beaconTower.position.set(dumpyardPos.x, 10.0, dumpyardPos.z + 6);
    dumpyardGroup.add(beaconTower);

    const beaconPulsar = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 3.2, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    beaconPulsar.rotation.x = -Math.PI / 2;
    beaconPulsar.position.set(dumpyardPos.x, 18.0, dumpyardPos.z + 6);
    dumpyardGroup.add(beaconPulsar);

    scene.add(dumpyardGroup);

    // ─────────────────────────────────────────────────────────────
    // 6. CITY BLOCKS: PARKS / BOTANICAL GARDENS, CAFES, HOUSES & TOWERS
    // ─────────────────────────────────────────────────────────────
    const cityGroup = new THREE.Group();
    const smartBins = [];
    let blockIndex = 0;

    blockCenters.forEach((bx) => {
      blockCenters.forEach((bz) => {
        blockIndex++;

        // Plot Base Sidewalk
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, 0.4, blockSize),
          new THREE.MeshLambertMaterial({ color: 0xcfd8dc })
        );
        platform.position.set(bx, 0.2, bz);
        platform.receiveShadow = true;
        cityGroup.add(platform);

        const isGarden = (blockIndex === 6 || blockIndex === 11);
        const isCafe = (blockIndex === 1 || blockIndex === 7 || blockIndex === 14);
        const isHouse = (blockIndex === 3 || blockIndex === 8 || blockIndex === 13);

        if (isGarden) {
          // Public Botanical Garden & Park
          const lawn = new THREE.Mesh(
            new THREE.BoxGeometry(blockSize - 2, 0.35, blockSize - 2),
            new THREE.MeshLambertMaterial({ color: 0x16a34a })
          );
          lawn.position.set(bx, 0.38, bz);
          lawn.receiveShadow = true;
          cityGroup.add(lawn);

          // Fountain
          const fPool = new THREE.Mesh(
            new THREE.CylinderGeometry(4.2, 4.2, 0.7, 24),
            new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
          );
          fPool.position.set(bx, 0.7, bz);
          fPool.castShadow = true;
          cityGroup.add(fPool);

          const fWater = new THREE.Mesh(
            new THREE.CylinderGeometry(3.6, 3.6, 0.1, 24),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          fWater.position.set(bx, 1.05, bz);
          cityGroup.add(fWater);

          // Trees
          const treeOffsets = [
            { x: -9, z: -9 }, { x: 9, z: -9 }, { x: -9, z: 9 }, { x: 9, z: 9 }
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
              new THREE.MeshLambertMaterial({ color: 0x15803d })
            );
            foliage.position.set(bx + to.x, 4.2, bz + to.z);
            foliage.castShadow = true;
            cityGroup.add(foliage);
          });

        } else if (isCafe) {
          // Cafe
          const cafeW = 20, cafeD = 18, cafeH = 7.5;
          const cafeBody = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW, cafeH, cafeD),
            new THREE.MeshLambertMaterial({ color: 0x292524 })
          );
          cafeBody.position.set(bx, cafeH / 2 + 0.4, bz);
          cafeBody.castShadow = true;
          cityGroup.add(cafeBody);

          const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(cafeW * 0.85, 4.2),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 })
          );
          glass.position.set(bx, 2.8, bz + cafeD / 2 + 0.05);
          cityGroup.add(glass);

        } else if (isHouse) {
          // Residential Gable House
          const houseW = 18, houseD = 18, houseH = 8.0;
          const houseBody = new THREE.Mesh(
            new THREE.BoxGeometry(houseW, houseH, houseD),
            new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
          );
          houseBody.position.set(bx, houseH / 2 + 0.4, bz);
          houseBody.castShadow = true;
          cityGroup.add(houseBody);

          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(houseW * 0.75, 5.0, 4),
            new THREE.MeshLambertMaterial({ color: 0xb45309 })
          );
          roof.rotation.y = Math.PI / 4;
          roof.position.set(bx, houseH + 2.7, bz);
          roof.castShadow = true;
          cityGroup.add(roof);

        } else {
          // Commercial Tower
          const corpW = 22, corpD = 22, corpH = 22 + ((blockIndex * 5) % 18);
          const corpTower = new THREE.Mesh(
            new THREE.BoxGeometry(corpW, corpH, corpD),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          corpTower.position.set(bx, corpH / 2 + 0.4, bz);
          corpTower.castShadow = true;
          cityGroup.add(corpTower);

          const windowGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(corpW * 0.88, corpH * 0.82),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
          );
          windowGlass.position.set(bx, corpH / 2 + 0.4, bz + corpD / 2 + 0.05);
          cityGroup.add(windowGlass);
        }

        // Place 6 Wheelie SmartBins on designated curbs
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
    // 9. SLOW & REALISTIC TRAFFIC PASSENGER CARS
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

    // IoT Smart Fleet Vector Field Holographic Ground Ring (around truck)
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

    // Slower, calm city speeds (0.13 to 0.17)
    const trafficData = [
      { avenue: 'h', line: -46, dir: 1, speed: 0.15, x: -70, z: -46 + 3.2 },
      { avenue: 'h', line: 46, dir: -1, speed: 0.14, x: 70, z: 46 - 3.2 },
      { avenue: 'v', line: -46, dir: 1, speed: 0.16, x: -46 + 3.2, z: -80 },
      { avenue: 'v', line: 46, dir: -1, speed: 0.15, x: 46 - 3.2, z: 80 },
      { avenue: 'h', line: 0, dir: 1, speed: 0.17, x: -90, z: 3.2 },
      { avenue: 'v', line: 0, dir: -1, speed: 0.14, x: -3.2, z: 90 }
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
    // 10. ROBUST ROAD CONFINEMENT & TUNED DRIVING PHYSICS
    // ─────────────────────────────────────────────────────────────
    const halfRoad = roadWidth / 2 - 0.4; // 6.6 units (forgiving road margin for smooth cornering)
    
    const isPointOnRoad = (px, pz) => {
      const onH = roadLines.some((rz) => Math.abs(pz - rz) <= halfRoad);
      const onV = roadLines.some((rx) => Math.abs(px - rx) <= halfRoad);
      const onDumpYard = (Math.abs(px - dumpyardPos.x) <= 17 && Math.abs(pz - dumpyardPos.z) <= 16);
      return onH || onV || onDumpYard;
    };

    const keys = { forward: false, backward: false, left: false, right: false };
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = true;
      if (k === 's' || k === 'arrowdown') keys.backward = true;
      if (k === 'a' || k === 'arrowleft') keys.left = true;
      if (k === 'd' || k === 'arrowright') keys.right = true;
      if (k === 'h') playSound('horn');
      if (k === 'r' && isCrashedRef.current) handleManualRespawn();
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = false;
      if (k === 's' || k === 'arrowdown') keys.backward = false;
      if (k === 'a' || k === 'arrowleft') keys.left = false;
      if (k === 'd' || k === 'arrowright') keys.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Tuned Slower, Easy-to-Control Driving Physics
    let truckSpeed = 0;
    const maxSpeed = 0.32;       // Slower, calm, pleasant city cruising speed
    const acceleration = 0.016;  // Gentle, predictable acceleration
    const deceleration = 0.028;  // Fast auto-braking when releasing keys
    const turnSpeed = 0.055;     // Responsive, tight turning radius for 90° corners
    let truckAngle = 0;

    let activeCollectionBin = null;
    let collectionTimer = 0;
    const COLLECTION_DURATION = 2.5;

    // Respawn Procedure with PROGRESS 100% PRESERVED
    const resetTruck = (reason = "Route Repaired") => {
      // Find nearest safe avenue intersection to current position or depot
      let bestX = 0;
      let bestZ = 0;
      let minD = 99999;
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
      setNotification(`✅ ${reason}: Truck safely repositioned. Progress preserved! (Bins: ${wasteCollectedRef.current}/6)`);
    };
    resetTruckTriggerRef.current = resetTruck;

    // Collision Trigger (Zero Progress Lost)
    const triggerCrash = (obstacleName = "Traffic Vehicle") => {
      if (isCrashedRef.current) return;
      isCrashedRef.current = true;
      playSound('crash');
      cameraShakeRef.current = 0.6;

      const hitPos = truckGroup.position.clone();
      crashParticles.forEach((cp) => {
        cp.mesh.visible = true;
        cp.mesh.position.copy(hitPos);
        cp.vel.set(
          (Math.random() - 0.5) * 0.5,
          Math.random() * 0.4 + 0.2,
          (Math.random() - 0.5) * 0.5
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
    // 11. MAIN ANIMATION & GAME LOOP
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
        // Driving Input
        if (keys.forward) {
          truckSpeed = Math.min(maxSpeed, truckSpeed + acceleration);
        } else if (keys.backward) {
          truckSpeed = Math.max(-maxSpeed * 0.5, truckSpeed - acceleration);
        } else {
          if (truckSpeed > 0) truckSpeed = Math.max(0, truckSpeed - deceleration);
          else if (truckSpeed < 0) truckSpeed = Math.min(0, truckSpeed + deceleration);
        }

        if (Math.abs(truckSpeed) > 0.005) {
          const dir = truckSpeed > 0 ? 1 : -1;
          if (keys.left) truckAngle += turnSpeed * dir;
          if (keys.right) truckAngle -= turnSpeed * dir;
        }

        // Proposed Position
        const nextX = truckGroup.position.x + Math.sin(truckAngle) * truckSpeed;
        const nextZ = truckGroup.position.z + Math.cos(truckAngle) * truckSpeed;

        // Perimeter Check
        if (Math.abs(nextX) >= fenceLimit - 2 || Math.abs(nextZ) >= fenceLimit - 2) {
          if (Math.abs(truckSpeed) > 0.22) {
            triggerCrash("Perimeter Security Fence");
          } else {
            truckSpeed = 0;
          }
        } else if (isPointOnRoad(nextX, nextZ)) {
          truckGroup.position.x = nextX;
          truckGroup.position.z = nextZ;
        } else {
          // Check for smooth wall glide (slide on X or Z if one component is on road)
          if (isPointOnRoad(nextX, truckGroup.position.z)) {
            truckGroup.position.x = nextX;
            truckSpeed *= 0.85; // Gentle friction slide
          } else if (isPointOnRoad(truckGroup.position.x, nextZ)) {
            truckGroup.position.z = nextZ;
            truckSpeed *= 0.85;
          } else {
            if (Math.abs(truckSpeed) > 0.28) {
              triggerCrash("Sidewalk Curb / Building");
            } else {
              truckSpeed = 0; // Gentle stop, no crash at low speed
            }
          }
        }

        truckGroup.rotation.y = truckAngle;

        // Wheel Rotation
        if (Math.abs(truckSpeed) > 0.03) {
          wheels.forEach((w) => (w.rotation.x += truckSpeed * 2.2));
          truckGroup.position.y = Math.sin(time * 16) * 0.02;
        } else {
          truckGroup.position.y = 0;
        }

        setCurrentSpeed(Math.round(Math.abs(truckSpeed) * 85));
      }

      // Flash Roof Strobe & Pulse Vector Field Ring
      strobeBar.material.color.setHex((Math.sin(time * 16) > 0) ? 0xf59e0b : 0xffffff);
      if (vectorFieldRing) {
        vectorFieldRing.material.opacity = 0.22 + Math.sin(time * 3.5) * 0.12;
        vectorFieldRing.rotation.z += 0.005;
      }

      // ─────────────────────────────────────────────────────────────
      // 12. TRAFFIC SIMULATION & SMART VECTOR FIELD PROXIMITY BRAKING
      // ─────────────────────────────────────────────────────────────
      // Cars slow down inside the 28m vector field and come to a FULL STOP at 8.5m
      const VECTOR_FIELD_RADIUS = 28.0;
      const FULL_STOP_DISTANCE = 8.5;

      trafficCars.forEach((tc) => {
        const distToTruck = Math.hypot(truckGroup.position.x - tc.x, truckGroup.position.z - tc.z);
        let targetCarSpeed = tc.baseSpeed;

        if (distToTruck < FULL_STOP_DISTANCE) {
          // Cars completely halt & yield before hitting the player!
          targetCarSpeed = 0;
          if (tc.taillight) tc.taillight.material.color.setHex(0xff0000); // Glowing brake light
        } else if (distToTruck < VECTOR_FIELD_RADIUS) {
          // Inside player's vector field: smooth deceleration
          const ratio = (distToTruck - FULL_STOP_DISTANCE) / (VECTOR_FIELD_RADIUS - FULL_STOP_DISTANCE);
          targetCarSpeed = tc.baseSpeed * Math.max(0.04, ratio * ratio);
          if (tc.taillight) tc.taillight.material.color.setHex(0xef4444);
        } else {
          // Normal cruising
          targetCarSpeed = tc.baseSpeed;
          if (tc.taillight) tc.taillight.material.color.setHex(0x7f1d1d);
        }

        // Smooth speed transition
        tc.currentSpeed += (targetCarSpeed - tc.currentSpeed) * 0.16;

        // Move car
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

        // Collision only triggers if the PLAYER drives into the car at speed:
        // (AI cars will NEVER ram the player because they halt at 8.5m distance!)
        if (!isCrashedRef.current) {
          if (Math.abs(truckSpeed) > 0.16 && distToTruck < 3.2) {
            triggerCrash("Traffic Vehicle");
          }
        }
      });

      // ─────────────────────────────────────────────────────────────
      // 13. TRUCK STOPPED AT BIN → SUCTION & FEATURE SPOTLIGHT
      // ─────────────────────────────────────────────────────────────
      const stoppedNearBin = smartBins.find(
        (b) => !b.collected && Math.hypot(truckGroup.position.x - b.x, truckGroup.position.z - b.z) < 7.5
      );

      if (stoppedNearBin && Math.abs(truckSpeed) < 0.08 && !isCrashedRef.current) {
        if (activeCollectionBin !== stoppedNearBin.id) {
          activeCollectionBin = stoppedNearBin.id;
          collectionTimer = 0;
          setCollectingBinId(stoppedNearBin.id);
          playSound('suction');

          // Trigger feature spotlight for this spot
          if (stoppedNearBin.feature) {
            setActiveFeatureSpotlight(stoppedNearBin.feature);
            setDiscoveredFeatures((prev) => {
              if (!prev.includes(stoppedNearBin.feature.id)) {
                return [...prev, stoppedNearBin.feature.id];
              }
              return prev;
            });
          }
        }

        collectionTimer += delta;
        const progressPct = Math.min(100, Math.round((collectionTimer / COLLECTION_DURATION) * 100));
        setCollectProgress(progressPct);

        // Debris Flying Particles
        const binPos = new THREE.Vector3(stoppedNearBin.x, 2.0, stoppedNearBin.z);
        const compactorPos = new THREE.Vector3(0, 1.8, -2.4).applyMatrix4(truckGroup.matrixWorld);

        particles.forEach((p) => {
          p.mesh.visible = true;
          p.progress = (p.progress + p.speed) % 1;
          p.mesh.position.lerpVectors(binPos, compactorPos, p.progress);
          p.mesh.position.addScaledVector(p.offset, (1 - p.progress) * 0.5);
        });

        if (collectionTimer >= COLLECTION_DURATION) {
          // Bin Completed
          stoppedNearBin.collected = true;
          stoppedNearBin.beacon.material.color.setHex(0x10b981);
          stoppedNearBin.column.material.color.setHex(0x10b981);
          stoppedNearBin.body.material.color.setHex(0x10b981);

          playSound('collect');

          particles.forEach((p) => (p.mesh.visible = false));
          activeCollectionBin = null;
          setCollectingBinId(null);
          setCollectProgress(0);

          setWasteCollected((prev) => {
            const nextVal = prev + 1;
            wasteCollectedRef.current = nextVal;
            if (nextVal >= smartBins.length) {
              setNotification("🚀 ALL 6 BINS COLLECTED! Proceed to northern Municipal Dumpyard to finish!");
            } else {
              setNotification(`✅ Emptied Spot #${stoppedNearBin.id}! (+25kg waste, +100 Eco-Points)`);
            }
            return nextVal;
          });

          setCurrentLoad((prev) => {
            const nextLoad = Math.min(truckCapacity, prev + 25);
            currentLoadRef.current = nextLoad;
            return nextLoad;
          });

          setEcoPoints((prev) => {
            const nextPts = prev + 100;
            ecoPointsRef.current = nextPts;
            return nextPts;
          });
        }
      } else {
        if (activeCollectionBin !== null) {
          activeCollectionBin = null;
          setCollectingBinId(null);
          setCollectProgress(0);
          particles.forEach((p) => (p.mesh.visible = false));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 14. DUMPYARD UNLOADING & VICTORY SHIFT TRIGGER
      // ─────────────────────────────────────────────────────────────
      const distToDumpyard = Math.hypot(truckGroup.position.x - dumpyardPos.x, truckGroup.position.z - dumpyardPos.z);
      if (distToDumpyard < 12.0 && currentLoadRef.current > 0 && Math.abs(truckSpeed) < 0.08 && !isCrashedRef.current) {
        playSound('dump');
        setCurrentLoad(0);
        currentLoadRef.current = 0;
        setEcoPoints((prev) => prev + 500);
        setMissionComplete(true);
        setNotification("🏆 SHIFT COMPLETE: All waste processed at Municipal Facility! (+500 Bonus Points)");
      }

      // ─────────────────────────────────────────────────────────────
      // 15. GTA-STYLE RADAR DATA SYNC
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
      }

      // ─────────────────────────────────────────────────────────────
      // 16. CAMERA VIEWS WITH CRASH SCREEN-SHAKE
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
        
        {/* Left: Brand Badge & Lives Counter */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center font-black">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">SmartBin Living City</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  PRECISION MODE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Features Discovered:</span>
                <span className="text-[11px] font-extrabold text-[#e2fd00]">
                  {discoveredFeatures.length} / 6
                </span>
              </div>
            </div>
          </div>
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

          <button
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-white/10 text-white flex items-center justify-center hover:bg-slate-800 transition shadow-lg cursor-pointer"
            title="Controls & Mission Guide"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={onExit}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase shadow-lg transition hover:scale-105 cursor-pointer"
          >
            Exit Sim
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ACTIVE SUCTION COUNTDOWN & DEBRIS FLOW MODAL
          ───────────────────────────────────────────────────────────── */}
      {collectingBinId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white p-5 rounded-3xl border border-emerald-500 shadow-2xl backdrop-blur-xl flex items-center gap-5 z-30 animate-in fade-in zoom-in-95 pointer-events-none">
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
              <Truck size={14} className="animate-bounce" />
              <span>Hydraulic Compactor Suction</span>
            </div>
            <h4 className="font-extrabold text-white text-base">Emptying SmartBin #{collectingBinId}...</h4>
            <p className="text-slate-400 text-xs mt-0.5">Physical waste particles flying into truck compactor</p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SMARTBIN PLATFORM FEATURE SPOTLIGHT MODAL (At each spot)
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
                All SmartBins emptied, platform features audited, and waste unloaded at Central Recycling Depot.
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
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto flex flex-col gap-2">
        <div className="relative w-44 h-44 rounded-full bg-slate-950/90 border-4 border-slate-700/80 shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center">
          
          <div className="absolute inset-0 rounded-full border border-slate-800/60 pointer-events-none" />
          <span className="absolute top-1 text-[9px] font-black text-rose-500 z-10">N</span>
          <span className="absolute bottom-1 text-[9px] font-black text-slate-500 z-10">S</span>
          <span className="absolute left-1 text-[9px] font-black text-slate-500 z-10">W</span>
          <span className="absolute right-1 text-[9px] font-black text-slate-500 z-10">E</span>

          <svg className="w-full h-full" viewBox="-130 -130 260 260">
            <circle cx="0" cy="0" r="128" fill="#090d16" />

            {/* Roads */}
            {[-92, -46, 0, 46, 92].map((coord) => (
              <React.Fragment key={coord}>
                <line x1="-125" y1={coord} x2="125" y2={coord} stroke="#1e293b" strokeWidth="14" />
                <line x1={coord} y1="-125" x2={coord} y2="125" stroke="#1e293b" strokeWidth="14" />
                <line x1="-125" y1={coord} x2="125" y2={coord} stroke="#eab308" strokeWidth="0.8" strokeDasharray="3, 3" />
                <line x1={coord} y1="-125" x2={coord} y2="125" stroke="#eab308" strokeWidth="0.8" strokeDasharray="3, 3" />
              </React.Fragment>
            ))}

            {/* Gardens */}
            <rect x="-85" y="9" width="32" height="32" fill="#16a34a" rx="4" opacity="0.85" />
            <rect x="7" y="-37" width="32" height="32" fill="#16a34a" rx="4" opacity="0.85" />

            {/* Dumpyard */}
            <rect x="-18" y="-125" width="36" height="20" fill="#0f766e" rx="3" />
            <circle cx={radarData.dumpyard.x} cy={radarData.dumpyard.z} r="4.5" fill="#10b981" />

            {/* AI Traffic */}
            {radarData.traffic.map((tc, idx) => (
              <circle key={idx} cx={tc.x} cy={tc.z} r="2.2" fill="#facc15" />
            ))}

            {/* SmartBins */}
            {radarData.bins.map((b) => (
              <circle
                key={b.id}
                cx={b.x}
                cy={b.z}
                r={b.collected ? 2.5 : 4.0}
                fill={b.collected ? '#64748b' : (b.id % 3 === 1 ? '#3b82f6' : (b.id % 3 === 2 ? '#22c55e' : '#f97316'))}
                stroke="#ffffff"
                strokeWidth={b.collected ? 0.5 : 1.2}
              />
            ))}

            {/* Target Route Line */}
            {radarData.target && (
              <line
                x1={radarData.playerX}
                y1={radarData.playerZ}
                x2={radarData.target.x}
                y2={radarData.target.z}
                stroke="#e2fd00"
                strokeWidth="1.8"
                strokeDasharray="4, 3"
                opacity="0.9"
              />
            )}

            {/* IoT Fleet Vector Field Aura on Radar (28m radius) */}
            <circle
              cx={radarData.playerX}
              cy={radarData.playerZ}
              r="28"
              fill="rgba(56, 189, 248, 0.08)"
              stroke="#38bdf8"
              strokeWidth="0.8"
              strokeDasharray="3, 3"
              opacity="0.65"
            />

            {/* Player Blip */}
            <g transform={`translate(${radarData.playerX}, ${radarData.playerZ}) rotate(${(-radarData.playerAngle * 180) / Math.PI})`}>
              <polygon points="0,-7 5,6 0,3 -5,6" fill="#ffffff" stroke="#000000" strokeWidth="1" />
            </g>
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

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM STATUS & SPEEDOMETER
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 pointer-events-none z-20">
        
        {/* Speedometer */}
        <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4 pointer-events-auto text-white">
          <div className="text-center">
            <span className="text-3xl font-black text-white tracking-tight">{currentSpeed}</span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">KM / H</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Proximity Field</p>
            <p className="font-extrabold text-xs text-cyan-400">IoT Auto-Brake (AI Yields)</p>
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
                <p><strong className="text-white">Precision Control:</strong> W/A/S/D or Arrow Keys. Speed is capped for smooth, calm handling. Release W to auto-brake.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-white">GTA Radar (Bottom-Left):</strong> Follow yellow dashed line to the next SmartBin.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-white">App Features at Every Spot:</strong> Each bin reveals a real feature of the SmartBin platform (AI Classifier, IoT Telemetry, C++ VRP, etc.).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <p><strong className="text-white">Zero Progress Loss:</strong> Even if a collision occurs, your collected bins and load stay 100% saved.</p>
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
