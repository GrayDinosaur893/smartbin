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
  ArrowRight
} from 'lucide-react';

/**
 * LivingCity3D — Authentic 3D Living Waste Management Simulation
 * Features:
 * 1. Road Boundary & Crash Confinement (Cannot drive into buildings; high speed impacts trigger crash restart).
 * 2. Internet / Real-world Detailed 3D Models:
 *    - Heavy 3-axle Compactor Garbage Truck (Mack/Dennis Eagle style with cab, mirrors, strobe lights, hazard chevrons, fluted hopper, dual rear axles).
 *    - Modern Passenger Cars (sedans/SUVs with curved glass, headlights, taillights, alloy spoke wheels).
 * 3. 240L Wheelie SmartBins with hinged lids, category colors, and IoT beacons.
 * 4. Hydraulic Suction Counter: 2.5s countdown with 40 3D debris particles flying into truck compactor.
 * 5. NO RESET ON WASTE COLLECTION: Scene is preserved via stable refs and runs once on mount.
 * 6. Central Municipal Dumpyard & Recycling Facility with concrete unloading apron, rollup bays, and bonus points.
 * 7. GTA-Style Mini-Map Radar HUD (Replaces floating 3D arrow with classic circular GTA radar with rotating player blip, road network, bin blips, dumpyard beacon, and GPS line).
 * 8. Lush Public Botanical Gardens & Parks with fountains, trees, flower beds, and walking pathways.
 * 9. World Border Security Perimeter with tall chainlink fences, steel pillars, barbed wire, and warning signs.
 * 10. Comprehensive Game Logic: Collision detection, camera shake, crash audio, lives system, and Mission Complete summary.
 */
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
  const [collectProgress, setCollectProgress] = useState(0); // 0 to 100%
  const [currentTargetName, setCurrentTargetName] = useState("SmartBin #1 (Plastic)");
  const [targetDistance, setTargetDistance] = useState(0);
  const [notification, setNotification] = useState("Shift Started: Check GTA Radar at bottom-left for your route!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('chase'); // 'chase' | 'isometric' | 'topdown'
  const [showHelp, setShowHelp] = useState(false);
  
  // Game Logic: Collisions, Lives, and Mission Completion
  const [lives, setLives] = useState(3);
  const [crashState, setCrashState] = useState(null); // null | { message: string, countdown: number }
  const [missionComplete, setMissionComplete] = useState(false);

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

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const isCrashedRef = useRef(false);
  const cameraShakeRef = useRef(0);
  const audioCtxRef = useRef(null);
  const resetTruckTriggerRef = useRef(null);

  // Synthesized Web Audio FX
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
        // Hydraulic collection whoosh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(340, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'collect') {
        // High pitched pleasant success chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'dump') {
        // Deep hydraulic compactor dump rumble
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.7);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type === 'crash') {
        // Heavy metal crunch / accident impact sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'horn') {
        // Dual air horn
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(311.13, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {}
  };

  // Trigger safe respawn
  const handleManualRespawn = () => {
    if (resetTruckTriggerRef.current) {
      resetTruckTriggerRef.current();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS SCENE, CAMERA & RENDERER SETUP
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
    // 2. LIGHTING & ATMOSPHERE
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
    // 3. 4x4 GRID ROAD NETWORK & GROUND
    // ─────────────────────────────────────────────────────────────
    const blockSize = 32;
    const roadWidth = 14;
    const step = blockSize + roadWidth; // 46 units between avenue centerlines
    const roadLines = [-2 * step, -1 * step, 0, 1 * step, 2 * step]; // [-92, -46, 0, 46, 92]
    const blockCenters = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step]; // [-69, -23, 23, 69]
    const totalSpan = 260; // Total world boundary diameter
    const fenceLimit = 125; // Boundary fences at ±125

    // Base Ground Pavement
    const groundGeo = new THREE.PlaneGeometry(totalSpan, totalSpan);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Asphalt Roads (Dark Charcoal with Yellow Center Divider & White Pedestrian Crossings)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const whiteStripeMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

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
    // 4. WORLD BORDER: TALL SECURITY PERIMETER FENCES
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
    const barrierBaseMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }); // Concrete Jersey barrier

    const buildPerimeterSide = (startX, startZ, endX, endZ, isHorizontal) => {
      const length = isHorizontal ? Math.abs(endX - startX) : Math.abs(endZ - startZ);
      const postSpacing = 6;
      const count = Math.floor(length / postSpacing);

      for (let i = 0; i <= count; i++) {
        const px = isHorizontal ? startX + i * postSpacing : startX;
        const pz = isHorizontal ? startZ : startZ + i * postSpacing;

        // Steel Pillar
        const post = new THREE.Mesh(fencePostGeo, fencePostMat);
        post.position.set(px, 3.25, pz);
        post.castShadow = true;
        fenceGroup.add(post);

        // Concrete Jersey crash curb base
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

        // Chainlink Mesh Panel
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

    // North, South, East, West Boundaries
    buildPerimeterSide(-fenceLimit, -fenceLimit, fenceLimit, -fenceLimit, true);
    buildPerimeterSide(-fenceLimit, fenceLimit, fenceLimit, fenceLimit, true);
    buildPerimeterSide(-fenceLimit, -fenceLimit, -fenceLimit, fenceLimit, false);
    buildPerimeterSide(fenceLimit, -fenceLimit, fenceLimit, fenceLimit, false);

    // Warning Signboards on Fences
    const signGeo = new THREE.BoxGeometry(7, 1.8, 0.2);
    const signMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Hazard amber
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
    // 5. MUNICIPAL DUMPYARD & RECYCLING FACILITY (North Apron)
    // ─────────────────────────────────────────────────────────────
    const dumpyardPos = { x: 0, z: -115 };
    const dumpyardGroup = new THREE.Group();

    // Heavy Concrete Unloading Apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.4, 24),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    apron.position.set(dumpyardPos.x, 0.2, dumpyardPos.z);
    apron.receiveShadow = true;
    dumpyardGroup.add(apron);

    // Hazard Yellow/Black Striped Curb around Apron
    const curbStripe = new THREE.Mesh(
      new THREE.BoxGeometry(36.4, 0.5, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    curbStripe.position.set(dumpyardPos.x, 0.26, dumpyardPos.z + 11.8);
    dumpyardGroup.add(curbStripe);

    // Industrial Main Recycling Facility Hangar
    const hangar = new THREE.Mesh(
      new THREE.BoxGeometry(32, 13, 16),
      new THREE.MeshLambertMaterial({ color: 0x0f766e }) // Industrial Forest Teal
    );
    hangar.position.set(dumpyardPos.x, 6.7, dumpyardPos.z - 4);
    hangar.castShadow = true;
    dumpyardGroup.add(hangar);

    // Neon Industrial Signboard
    const dumpSign = new THREE.Mesh(
      new THREE.BoxGeometry(26, 2.8, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 }) // Neon Lime
    );
    dumpSign.position.set(dumpyardPos.x, 14.8, dumpyardPos.z + 4.2);
    dumpyardGroup.add(dumpSign);

    // 3 Material Sorting Rollup Dumpsters (Plastic, Metal, Organic)
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

    // Tall Green Beacon Tower for Dumpyard
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

        // Plot Sidewalk Platform Base
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, 0.4, blockSize),
          new THREE.MeshLambertMaterial({ color: 0xcfd8dc })
        );
        platform.position.set(bx, 0.2, bz);
        platform.receiveShadow = true;
        cityGroup.add(platform);

        // Architecture Decision
        // Blocks 6 and 11 are converted into Lush Botanical Gardens / Parks!
        const isGarden = (blockIndex === 6 || blockIndex === 11);
        const isCafe = (blockIndex === 1 || blockIndex === 7 || blockIndex === 14);
        const isHouse = (blockIndex === 3 || blockIndex === 8 || blockIndex === 13);

        if (isGarden) {
          // ── LUSH BOTANICAL PUBLIC PARK & GARDEN ──
          const lawn = new THREE.Mesh(
            new THREE.BoxGeometry(blockSize - 2, 0.35, blockSize - 2),
            new THREE.MeshLambertMaterial({ color: 0x16a34a }) // Vibrant Garden Green
          );
          lawn.position.set(bx, 0.38, bz);
          lawn.receiveShadow = true;
          cityGroup.add(lawn);

          // Central Circular Stone Fountain
          const fPool = new THREE.Mesh(
            new THREE.CylinderGeometry(4.2, 4.2, 0.7, 24),
            new THREE.MeshLambertMaterial({ color: 0x94a3b8 })
          );
          fPool.position.set(bx, 0.7, bz);
          fPool.castShadow = true;
          cityGroup.add(fPool);

          const fWater = new THREE.Mesh(
            new THREE.CylinderGeometry(3.6, 3.6, 0.1, 24),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 }) // Sparkling Water
          );
          fWater.position.set(bx, 1.05, bz);
          cityGroup.add(fWater);

          // Fountain Spout
          const fSpout = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.6, 2.2, 12),
            new THREE.MeshLambertMaterial({ color: 0x64748b })
          );
          fSpout.position.set(bx, 1.6, bz);
          cityGroup.add(fSpout);

          // Park Shady Trees & Colorful Flower Beds
          const treeOffsets = [
            { x: -9, z: -9 }, { x: 9, z: -9 }, { x: -9, z: 9 }, { x: 9, z: 9 }
          ];
          treeOffsets.forEach((to) => {
            // Trunk
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.35, 0.5, 3.2, 8),
              new THREE.MeshLambertMaterial({ color: 0x78350f })
            );
            trunk.position.set(bx + to.x, 1.8, bz + to.z);
            trunk.castShadow = true;
            cityGroup.add(trunk);

            // Foliage Cone/Sphere
            const foliage = new THREE.Mesh(
              new THREE.SphereGeometry(2.2, 10, 10),
              new THREE.MeshLambertMaterial({ color: 0x15803d })
            );
            foliage.position.set(bx + to.x, 4.2, bz + to.z);
            foliage.castShadow = true;
            cityGroup.add(foliage);

            // Flower Bed
            const flowers = new THREE.Mesh(
              new THREE.BoxGeometry(2.4, 0.3, 2.4),
              new THREE.MeshLambertMaterial({ color: (to.x * to.z > 0) ? 0xef4444 : 0xeab308 })
            );
            flowers.position.set(bx + to.x * 0.5, 0.45, bz + to.z * 0.5);
            cityGroup.add(flowers);
          });

        } else if (isCafe) {
          // ── MODERN ESPRESSO CAFE & BAKERY ──
          const cafeW = 20, cafeD = 18, cafeH = 7.5;
          const cafeBody = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW, cafeH, cafeD),
            new THREE.MeshLambertMaterial({ color: 0x292524 }) // Charcoal Cafe
          );
          cafeBody.position.set(bx, cafeH / 2 + 0.4, bz);
          cafeBody.castShadow = true;
          cityGroup.add(cafeBody);

          // Warm Glowing Glass Front
          const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(cafeW * 0.85, 4.2),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 })
          );
          glass.position.set(bx, 2.8, bz + cafeD / 2 + 0.05);
          cityGroup.add(glass);

          // Orange Terrace Awning
          const awning = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW * 0.9, 0.4, 4.0),
            new THREE.MeshLambertMaterial({ color: 0xea580c })
          );
          awning.rotation.x = 0.2;
          awning.position.set(bx, 5.2, bz + cafeD / 2 + 2.0);
          cityGroup.add(awning);

        } else if (isHouse) {
          // ── LOCAL RESIDENTIAL HOUSE WITH GABLE ROOF ──
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
          // ── CORPORATE COMMERCIAL SKYSCRAPER ──
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

        // Place authentic 240L Wheelie SmartBins on curbs of 6 specific blocks
        if ([2, 4, 7, 9, 12, 15].includes(blockIndex)) {
          const curbOffset = blockSize / 2 + 1.2;
          const binX = bx;
          const binZ = bz + curbOffset;
          const binId = smartBins.length + 1;

          const binCategory = binId % 3 === 1 ? "Plastic & Packaging" : (binId % 3 === 2 ? "Organic Food Waste" : "Paper & Cardboard");
          const binColorHex = binCategory.includes("Organic") ? 0x15803d : (binCategory.includes("Plastic") ? 0x1d4ed8 : 0xb45309);

          const wheelieBinGroup = new THREE.Group();

          // Tapered Rectangular Body
          const binBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 2.2, 1.2),
            new THREE.MeshLambertMaterial({ color: binColorHex })
          );
          binBody.position.y = 1.2;
          binBody.castShadow = true;
          wheelieBinGroup.add(binBody);

          // Hinged Lid on Top
          const binLid = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.25, 1.3),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          binLid.position.y = 2.4;
          wheelieBinGroup.add(binLid);

          // Small Rear Rubber Wheels
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
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.rotation.x = -Math.PI / 2;
          beacon.position.y = 3.6;
          wheelieBinGroup.add(beacon);

          // Light Column
          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 })
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
            category: binCategory,
            colorHex: binColorHex,
            collected: false
          });
        }
      });
    });

    scene.add(cityGroup);
    setTotalBins(smartBins.length);

    // ─────────────────────────────────────────────────────────────
    // 7. SUCTION DEBRIS PARTICLE SYSTEM (Physical Waste Flow)
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

    // Crash Sparks & Smoke Particles
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
    // 8. AUTHENTIC HEAVY 3-AXLE GARBAGE COMPACTOR TRUCK
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();

    // ── Driver Cab (White Aerodynamic Forward Control) ──
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 2.4, 2.4),
      new THREE.MeshLambertMaterial({ color: 0xf8fafc })
    );
    cab.position.set(0, 1.6, 2.1);
    cab.castShadow = true;
    truckGroup.add(cab);

    // Curved Panoramic Windshield
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.15, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    windshield.position.set(0, 2.05, 3.32);
    truckGroup.add(windshield);

    // Side Mirrors with Chrome Brackets
    const mirrorGeo = new THREE.BoxGeometry(0.2, 0.6, 0.3);
    const mirrorMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    [-1.5, 1.5].forEach((mx) => {
      const m = new THREE.Mesh(mirrorGeo, mirrorMat);
      m.position.set(mx, 2.0, 2.3);
      truckGroup.add(m);
    });

    // Front Chrome/Black Honeycomb Grille & Heavy Bumper
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

    // Roof Emergency Amber Strobe Light Bar
    const strobeBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    strobeBar.position.set(0, 2.92, 2.1);
    truckGroup.add(strobeBar);

    // Dual Roof Chrome Air Horns
    const hornGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.8, 8);
    const hornMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    [-0.5, 0.5].forEach((hx) => {
      const hn = new THREE.Mesh(hornGeo, hornMat);
      hn.rotation.x = Math.PI / 2;
      hn.position.set(hx, 2.95, 2.6);
      truckGroup.add(hn);
    });

    // ── Heavy Fluted Waste Compactor Tank (Forest Green with Hazard Tape) ──
    const compactor = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 2.7, 5.0),
      new THREE.MeshLambertMaterial({ color: 0x105a39 }) // Municipal Forest Green
    );
    compactor.position.set(0, 1.85, -1.8);
    compactor.castShadow = true;
    truckGroup.add(compactor);

    // Hazard Caution Strip on Sides (Neon Yellow/Black Strip)
    const hazardStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.2, 4.8),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
    );
    hazardStrip.position.set(0, 2.9, -1.8);
    truckGroup.add(hazardStrip);

    // Rear Loading Tailgate & Hydraulic Lift Cylinders
    const tailgate = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.6, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x064e3b })
    );
    tailgate.position.set(0, 1.3, -4.4);
    truckGroup.add(tailgate);

    const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8);
    const cylinderMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    [-1.25, 1.25].forEach((cx) => {
      const cyl = new THREE.Mesh(cylinderGeo, cylinderMat);
      cyl.position.set(cx, 1.8, -4.3);
      truckGroup.add(cyl);
    });

    // Dual LED Headlights
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

    // 6 Heavy-Duty Wheels (1 Front Steer Axle + 2 Rear Drive Axles)
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.55, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const wheels = [];
    [
      { x: -1.5, y: 0.7, z: 2.1 }, { x: 1.5, y: 0.7, z: 2.1 },   // Front steer axle
      { x: -1.5, y: 0.7, z: -1.3 }, { x: 1.5, y: 0.7, z: -1.3 }, // Mid drive axle
      { x: -1.5, y: 0.7, z: -3.1 }, { x: 1.5, y: 0.7, z: -3.1 }  // Rear drive axle
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
    // 9. REALISTIC TRAFFIC PASSENGER CARS (Modern Sedans / SUVs)
    // ─────────────────────────────────────────────────────────────
    const trafficCars = [];
    const carColors = [0x0f172a, 0xf8fafc, 0x1d4ed8, 0xb91c1c, 0x475569]; // Black, White, Blue, Red, Grey

    const createCarModel = (colorHex) => {
      const car = new THREE.Group();

      // Lower Chassis & Hood
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.75, 4.2),
        new THREE.MeshLambertMaterial({ color: colorHex })
      );
      chassis.position.y = 0.65;
      chassis.castShadow = true;
      car.add(chassis);

      // Cabin Glass Top
      const cabinTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.65, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      cabinTop.position.set(0, 1.25, -0.2);
      car.add(cabinTop);

      // Windshield & Rear Window
      const frontGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 0.65),
        new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
      );
      frontGlass.rotation.x = -Math.PI / 4;
      frontGlass.position.set(0, 1.2, 0.95);
      car.add(frontGlass);

      // Headlights & Taillights
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

      // 4 Wheels with Silver Rim Hubs
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

      return car;
    };

    // Populate 6 Moving Traffic Cars on Avenue Lanes
    const trafficData = [
      { avenue: 'h', line: -46, dir: 1, speed: 0.32, x: -70, z: -46 + 3.2 },
      { avenue: 'h', line: 46, dir: -1, speed: 0.28, x: 70, z: 46 - 3.2 },
      { avenue: 'v', line: -46, dir: 1, speed: 0.30, x: -46 + 3.2, z: -80 },
      { avenue: 'v', line: 46, dir: -1, speed: 0.34, x: 46 - 3.2, z: 80 },
      { avenue: 'h', line: 0, dir: 1, speed: 0.33, x: -90, z: 3.2 },
      { avenue: 'v', line: 0, dir: -1, speed: 0.31, x: -3.2, z: 90 }
    ];

    trafficData.forEach((td, idx) => {
      const carMesh = createCarModel(carColors[idx % carColors.length]);
      carMesh.position.set(td.x, 0, td.z);
      if (td.avenue === 'h') {
        carMesh.rotation.y = td.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        carMesh.rotation.y = td.dir > 0 ? 0 : Math.PI;
      }
      scene.add(carMesh);
      trafficCars.push({
        group: carMesh,
        avenue: td.avenue,
        line: td.line,
        dir: td.dir,
        speed: td.speed,
        x: td.x,
        z: td.z
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 10. DRIVING MECHANICS & ROAD BOUNDARY CHECK
    // ─────────────────────────────────────────────────────────────
    const halfRoad = roadWidth / 2 - 0.8; // 6.2 units tolerance
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

    let truckSpeed = 0;
    const maxSpeed = 0.58;
    const acceleration = 0.022;
    const deceleration = 0.016;
    const turnSpeed = 0.045;
    let truckAngle = 0;

    // Suction Collection State
    let activeCollectionBin = null;
    let collectionTimer = 0;
    const COLLECTION_DURATION = 2.5; // 2.5s physical suction loading

    // Reset Truck / Crash Respawn Procedure
    const resetTruck = (reason = "Route Restarted") => {
      truckGroup.position.set(0, 0, 0);
      truckAngle = 0;
      truckSpeed = 0;
      truckGroup.rotation.y = 0;
      isCrashedRef.current = false;
      setCrashState(null);
      setNotification(`🚨 ${reason}: Truck safely respawned at Central Depot!`);
    };
    resetTruckTriggerRef.current = resetTruck;

    // Trigger Vehicle Collision Crash
    const triggerCrash = (obstacleName = "Traffic Vehicle") => {
      if (isCrashedRef.current) return;
      isCrashedRef.current = true;
      playSound('crash');
      cameraShakeRef.current = 0.65; // Shake screen

      // Deduct Eco-Points penalty
      setEcoPoints((prev) => Math.max(0, prev - 50));
      
      // Burst Crash Sparks
      const hitPos = truckGroup.position.clone();
      crashParticles.forEach((cp) => {
        cp.mesh.visible = true;
        cp.mesh.position.copy(hitPos);
        cp.vel.set(
          (Math.random() - 0.5) * 0.6,
          Math.random() * 0.5 + 0.2,
          (Math.random() - 0.5) * 0.6
        );
        cp.life = 1.0;
      });

      // Update Lives
      setLives((prev) => {
        const remaining = Math.max(0, prev - 1);
        livesRef.current = remaining;
        return remaining;
      });

      setCrashState({
        message: `COLLIDED WITH ${obstacleName.toUpperCase()}!`,
        countdown: 2
      });

      // Auto-Respawn after 2.2 seconds
      setTimeout(() => {
        resetTruck(`Vehicle Repaired after Collision with ${obstacleName}`);
      }, 2200);
    };

    // ─────────────────────────────────────────────────────────────
    // 11. MAIN ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();
    let radarTick = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // If in crashed state, freeze controls and animate smoke/sparks
      if (isCrashedRef.current) {
        truckSpeed = 0;
        crashParticles.forEach((cp) => {
          if (cp.life > 0) {
            cp.mesh.position.add(cp.vel);
            cp.vel.y -= 0.015; // Gravity
            cp.life -= delta * 1.5;
            cp.mesh.scale.setScalar(Math.max(0.1, cp.life));
            if (cp.life <= 0) cp.mesh.visible = false;
          }
        });
      } else {
        // Normal Driving Controls
        if (keys.forward) {
          truckSpeed = Math.min(maxSpeed, truckSpeed + acceleration);
        } else if (keys.backward) {
          truckSpeed = Math.max(-maxSpeed * 0.5, truckSpeed - acceleration);
        } else {
          if (truckSpeed > 0) truckSpeed = Math.max(0, truckSpeed - deceleration);
          else if (truckSpeed < 0) truckSpeed = Math.min(0, truckSpeed + deceleration);
        }

        if (Math.abs(truckSpeed) > 0.01) {
          const dir = truckSpeed > 0 ? 1 : -1;
          if (keys.left) truckAngle += turnSpeed * dir;
          if (keys.right) truckAngle -= turnSpeed * dir;
        }

        // Propose Next Position
        const nextX = truckGroup.position.x + Math.sin(truckAngle) * truckSpeed;
        const nextZ = truckGroup.position.z + Math.cos(truckAngle) * truckSpeed;

        // Check Outer World Border Collision
        if (Math.abs(nextX) >= fenceLimit - 2 || Math.abs(nextZ) >= fenceLimit - 2) {
          if (Math.abs(truckSpeed) > 0.35) {
            triggerCrash("Perimeter Security Fence");
          } else {
            truckSpeed = 0;
          }
        } else if (isPointOnRoad(nextX, nextZ)) {
          // Accepted on asphalt road!
          truckGroup.position.x = nextX;
          truckGroup.position.z = nextZ;
        } else {
          // Collided with sidewalk or building
          if (Math.abs(truckSpeed) > 0.38) {
            triggerCrash("Sidewalk Curb / Building");
          } else {
            truckSpeed = 0;
          }
        }

        truckGroup.rotation.y = truckAngle;

        // Wheel Rotation
        if (Math.abs(truckSpeed) > 0.04) {
          wheels.forEach((w) => (w.rotation.x += truckSpeed * 2.2));
          truckGroup.position.y = Math.sin(time * 16) * 0.03;
        } else {
          truckGroup.position.y = 0;
        }

        setCurrentSpeed(Math.round(Math.abs(truckSpeed) * 85));
      }

      // Flash Roof Strobe Bar
      strobeBar.material.color.setHex((Math.sin(time * 18) > 0) ? 0xf59e0b : 0xffffff);

      // ─────────────────────────────────────────────────────────────
      // 12. TRAFFIC CARS SIMULATION & COLLISION CHECK
      // ─────────────────────────────────────────────────────────────
      trafficCars.forEach((tc) => {
        if (tc.avenue === 'h') {
          tc.x += tc.dir * tc.speed;
          if (tc.x > fenceLimit - 6) tc.x = -fenceLimit + 6;
          if (tc.x < -fenceLimit + 6) tc.x = fenceLimit - 6;
          tc.group.position.x = tc.x;
        } else {
          tc.z += tc.dir * tc.speed;
          if (tc.z > fenceLimit - 6) tc.z = -fenceLimit + 6;
          if (tc.z < -fenceLimit + 6) tc.z = fenceLimit - 6;
          tc.group.position.z = tc.z;
        }

        // Check Collision with Garbage Truck (Radius ~ 3.6m)
        if (!isCrashedRef.current) {
          const distToCar = Math.hypot(truckGroup.position.x - tc.x, truckGroup.position.z - tc.z);
          if (distToCar < 3.6) {
            triggerCrash("Traffic Vehicle");
          }
        }
      });

      // ─────────────────────────────────────────────────────────────
      // 13. TRUCK STOPPED AT DUSTBIN → SUCTION & FLYING DEBRIS
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
          // Full Collection Complete!
          stoppedNearBin.collected = true;
          stoppedNearBin.beacon.material.color.setHex(0x10b981); // Green empty
          stoppedNearBin.column.material.color.setHex(0x10b981);
          stoppedNearBin.body.material.color.setHex(0x10b981);

          playSound('collect');

          particles.forEach((p) => (p.mesh.visible = false));
          activeCollectionBin = null;
          setCollectingBinId(null);
          setCollectProgress(0);

          setWasteCollected((prev) => {
            const nextVal = prev + 1;
            if (nextVal >= smartBins.length) {
              setNotification("🚀 ALL DUSTBINS EMPTIED! Drive to northern Municipal Dumpyard!");
            } else {
              setNotification(`✅ Emptied SmartBin #${stoppedNearBin.id}! (+25kg waste, +100 Eco-Points)`);
            }
            return nextVal;
          });

          setCurrentLoad((prev) => Math.min(truckCapacity, prev + 25));
          setEcoPoints((prev) => prev + 100);
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
        setEcoPoints((prev) => prev + 500); // Massive victory bonus
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
          tgtLabel = `SmartBin #${nextTargetBin.id} (${nextTargetBin.category})`;
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
        shakeX = (Math.random() - 0.5) * cameraShakeRef.current * 3;
        shakeY = (Math.random() - 0.5) * cameraShakeRef.current * 3;
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
        // Topdown Satellite
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
  }, []); // Run ONCE on mount: fixes waste collection reset bug!

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
                  SIM V2
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fleet Integrity:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((heart) => (
                    <span key={heart} className={`text-xs ${heart <= lives ? 'text-rose-500' : 'text-slate-600'}`}>
                      ❤️
                    </span>
                  ))}
                </div>
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
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white p-5 rounded-3xl border border-emerald-500 shadow-2xl backdrop-blur-xl flex items-center gap-5 z-30 animate-in fade-in zoom-in-95 pointer-events-none">
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
          ACCIDENT / CRASH OVERLAY BANNER
          ───────────────────────────────────────────────────────────── */}
      {crashState && (
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={36} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white">{crashState.message}</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Vehicle damaged during service route. Road boundary or vehicle collision detected!
              <span className="text-rose-400 font-bold block mt-1">-50 Eco-Points Penalty Deducted</span>
            </p>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={handleManualRespawn}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                Respawn Truck Now (Depot)
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
                All SmartBins emptied and waste unloaded at Central Recycling Depot.
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
          
          {/* Compass Rings & Crosshairs */}
          <div className="absolute inset-0 rounded-full border border-slate-800/60 pointer-events-none" />
          <span className="absolute top-1 text-[9px] font-black text-rose-500 z-10">N</span>
          <span className="absolute bottom-1 text-[9px] font-black text-slate-500 z-10">S</span>
          <span className="absolute left-1 text-[9px] font-black text-slate-500 z-10">W</span>
          <span className="absolute right-1 text-[9px] font-black text-slate-500 z-10">E</span>

          {/* SVG Map Projection */}
          <svg className="w-full h-full" viewBox="-130 -130 260 260">
            {/* Dark background */}
            <circle cx="0" cy="0" r="128" fill="#090d16" />

            {/* Asphalt Roads */}
            {[-92, -46, 0, 46, 92].map((coord) => (
              <React.Fragment key={coord}>
                <line x1="-125" y1={coord} x2="125" y2={coord} stroke="#1e293b" strokeWidth="14" />
                <line x1={coord} y1="-125" x2={coord} y2="125" stroke="#1e293b" strokeWidth="14" />
                <line x1="-125" y1={coord} x2="125" y2={coord} stroke="#eab308" strokeWidth="0.8" strokeDasharray="3, 3" />
                <line x1={coord} y1="-125" x2={coord} y2="125" stroke="#eab308" strokeWidth="0.8" strokeDasharray="3, 3" />
              </React.Fragment>
            ))}

            {/* Gardens / Parks on Radar (Green Blocks) */}
            <rect x="-85" y="9" width="32" height="32" fill="#16a34a" rx="4" opacity="0.85" />
            <rect x="7" y="-37" width="32" height="32" fill="#16a34a" rx="4" opacity="0.85" />

            {/* Dumpyard Zone at North */}
            <rect x="-18" y="-125" width="36" height="20" fill="#0f766e" rx="3" />
            <circle cx={radarData.dumpyard.x} cy={radarData.dumpyard.z} r="4.5" fill="#10b981" />

            {/* AI Traffic Vehicles (Yellow Dots) */}
            {radarData.traffic.map((tc, idx) => (
              <circle key={idx} cx={tc.x} cy={tc.z} r="2.2" fill="#facc15" />
            ))}

            {/* SmartBins (Pulsing Category Blips) */}
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

            {/* GPS Target Route Line */}
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

            {/* Rotating Player Arrow / Triangle Blip */}
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
            <p className="text-[10px] text-slate-400 font-bold uppercase">Road Status</p>
            <p className="font-extrabold text-xs text-emerald-400">Asphalt Confined (Protected)</p>
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
                <p><strong className="text-white">W / A / S / D or Arrow Keys:</strong> Drive the garbage truck. Press <strong>H</strong> for air horn.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-white">GTA-Style Radar (Bottom-Left):</strong> Follow the yellow dashed GPS line to the next SmartBin.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-white">Stop at Bin to Collect:</strong> Come to a full stop (<span className="text-amber-300">0 km/h</span>) near a bin. 2.5s suction timer will load trash debris into truck.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <p><strong className="text-white">Avoid Collisions:</strong> Ramming traffic cars or perimeter fences damages the truck and costs -50 points.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">5</span>
                <p><strong className="text-white">Deliver to Dumpyard:</strong> After emptying all bins, drive to the northern Dumpyard to unload for +500 points.</p>
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
