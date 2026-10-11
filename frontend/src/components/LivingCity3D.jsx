import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Truck, 
  Trash2, 
  Navigation, 
  Award, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Zap,
  MapPin,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';

/**
 * LivingCity3D — Precision 4x4 Road Grid with:
 * 1. Road Boundary Confinement: Truck cannot drive into buildings/gray sidewalks!
 * 2. Internet / Real-world Detailed Smart Wheelie Bins with hinged lids and recycling logos.
 * 3. Hydraulic Suction Counter & Particle Animation: When stopped near a bin, a 3-second loader counts down
 *    and physical garbage debris particles fly into the truck's rear compactor!
 * 4. Municipal Dumpyard & Recycling Facility at northern corner.
 * 5. Dynamic GPS Route Pointer: Floating 3D arrow & minimap pointer directing the driver to the next
 *    overflowing SmartBin, and once all bins are collected, guiding directly to the Dumpyard!
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
  const [dumpedAtYard, setDumpedAtYard] = useState(false);
  const [currentTargetName, setCurrentTargetName] = useState("SmartBin #1 (Plastic)");
  const [targetDistance, setTargetDistance] = useState(0);
  const [notification, setNotification] = useState("Follow the GPS Arrow to your first assigned SmartBin!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('chase'); // 'chase' | 'isometric' | 'topdown'
  const [showHelp, setShowHelp] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'suction') {
        // Hydraulic collection whoosh / rumble
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'collect') {
        // High pitched pleasant chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'dump') {
        // Heavy hydraulic dumping sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {}
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS SCENE SETUP
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe);
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.005);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 600);
    camera.position.set(0, 25, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. LIGHTING & ENVIRONMENT
    // ─────────────────────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    sunLight.position.set(70, 110, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const shadowD = 120;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    // ─────────────────────────────────────────────────────────────
    // 3. EXACT 4x4 GRID (16 BLOCKS + ROAD NETWORK)
    // ─────────────────────────────────────────────────────────────
    const blockSize = 32;   // Size of each block
    const roadWidth = 14;   // Width of clear asphalt road
    const step = blockSize + roadWidth; // 46 units between road centers
    const roadLines = [-2 * step, -1 * step, 0, 1 * step, 2 * step];
    const blockCenters = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step];
    const totalGridSpan = 5 * step + 40;

    // Ground Pavement Base
    const groundGeo = new THREE.PlaneGeometry(totalGridSpan, totalGridSpan);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Roads (Dark Charcoal Asphalt with Yellow Dividers)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Horizontal Avenues
    roadLines.forEach((rz) => {
      const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(totalGridSpan, roadWidth), roadMat);
      hRoad.rotation.x = -Math.PI / 2;
      hRoad.position.set(0, 0.02, rz);
      hRoad.receiveShadow = true;
      scene.add(hRoad);

      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(totalGridSpan, 0.4), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(0, 0.03, rz);
      scene.add(yLine);
    });

    // Vertical Avenues
    roadLines.forEach((rx) => {
      const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, totalGridSpan), roadMat);
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set(rx, 0.02, 0);
      vRoad.receiveShadow = true;
      scene.add(vRoad);

      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, totalGridSpan), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(rx, 0.03, 0);
      scene.add(yLine);
    });

    // ─────────────────────────────────────────────────────────────
    // 4. MUNICIPAL RECYCLING DUMPYARD (At Far North Corner: X=0, Z=-115)
    // ─────────────────────────────────────────────────────────────
    const dumpyardPos = { x: 0, z: -115 };
    const dumpyardGroup = new THREE.Group();

    // Concrete Yard Platform
    const yardPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(40, 0.6, 26),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    yardPlatform.position.set(dumpyardPos.x, 0.3, dumpyardPos.z);
    dumpyardGroup.add(yardPlatform);

    // Municipal Recycling Center Warehouse Building
    const yardBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(34, 12, 18),
      new THREE.MeshLambertMaterial({ color: 0x0f766e }) // Industrial Teal
    );
    yardBuilding.position.set(dumpyardPos.x, 6.3, dumpyardPos.z - 3);
    yardBuilding.castShadow = true;
    dumpyardGroup.add(yardBuilding);

    // High Neon Signboard: "CENTRAL MUNICIPAL DUMPYARD & RECYCLING DEPOT"
    const yardSign = new THREE.Mesh(
      new THREE.BoxGeometry(28, 2.5, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 }) // Acid Lime
    );
    yardSign.position.set(dumpyardPos.x, 14.5, dumpyardPos.z + 6);
    dumpyardGroup.add(yardSign);

    // Dump Dumpster Bay
    const bayMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 6),
      new THREE.MeshLambertMaterial({ color: 0xd97706 }) // Industrial Orange
    );
    bayMesh.position.set(dumpyardPos.x, 1.5, dumpyardPos.z + 8);
    dumpyardGroup.add(bayMesh);

    // Tall Beacon Pole for Dumpyard
    const yardBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 14, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    yardBeacon.position.set(dumpyardPos.x, 9.0, dumpyardPos.z + 8);
    dumpyardGroup.add(yardBeacon);

    const yardRing = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 2.8, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    yardRing.rotation.x = -Math.PI / 2;
    yardRing.position.set(dumpyardPos.x, 16.0, dumpyardPos.z + 8);
    dumpyardGroup.add(yardRing);

    scene.add(dumpyardGroup);

    // ─────────────────────────────────────────────────────────────
    // 5. THE 16 BLOCKS & REALISTIC WHEELIE SMARTBINS
    // ─────────────────────────────────────────────────────────────
    const buildingsGroup = new THREE.Group();
    const binGroup = new THREE.Group();
    const smartBins = [];
    let blockCounter = 0;

    blockCenters.forEach((bx) => {
      blockCenters.forEach((bz) => {
        blockCounter++;

        // Plot Base Sidewalk Platform
        const plotPlatform = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, 0.4, blockSize),
          new THREE.MeshLambertMaterial({ color: 0xcfd8dc })
        );
        plotPlatform.position.set(bx, 0.2, bz);
        plotPlatform.receiveShadow = true;
        buildingsGroup.add(plotPlatform);

        // Architecture Variety
        let buildingType = 'corporate';
        if (blockCounter === 1 || blockCounter === 7) buildingType = 'cafe';
        else if (blockCounter === 5 || blockCounter === 11 || blockCounter === 14) buildingType = 'house';
        else if (blockCounter === 6 || blockCounter === 10) buildingType = 'park';

        if (buildingType === 'cafe') {
          // Modern Espresso Cafe
          const cafeW = 20, cafeD = 18, cafeH = 7.5;
          const cafeBody = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW, cafeH, cafeD),
            new THREE.MeshLambertMaterial({ color: 0x292524 })
          );
          cafeBody.position.set(bx, cafeH / 2 + 0.4, bz);
          cafeBody.castShadow = true;
          buildingsGroup.add(cafeBody);

          // Glass Display with warm lighting
          const cafeGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(cafeW * 0.85, 4.2),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 })
          );
          cafeGlass.position.set(bx, 2.8, bz + cafeD / 2 + 0.05);
          buildingsGroup.add(cafeGlass);

          // Orange Awning
          const awning = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW * 0.9, 0.4, 4.0),
            new THREE.MeshLambertMaterial({ color: 0xea580c })
          );
          awning.rotation.x = 0.2;
          awning.position.set(bx, 5.2, bz + cafeD / 2 + 2.0);
          buildingsGroup.add(awning);

        } else if (buildingType === 'house') {
          // Local House with Pitched Gable Roof
          const houseW = 18, houseD = 18, houseH = 8.0;
          const houseBody = new THREE.Mesh(
            new THREE.BoxGeometry(houseW, houseH, houseD),
            new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
          );
          houseBody.position.set(bx, houseH / 2 + 0.4, bz);
          houseBody.castShadow = true;
          buildingsGroup.add(houseBody);

          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(houseW * 0.75, 5.0, 4),
            new THREE.MeshLambertMaterial({ color: 0xb45309 })
          );
          roof.rotation.y = Math.PI / 4;
          roof.position.set(bx, houseH + 2.7, bz);
          roof.castShadow = true;
          buildingsGroup.add(roof);

        } else if (buildingType === 'park') {
          // Lush Eco-Park
          const lawn = new THREE.Mesh(
            new THREE.BoxGeometry(blockSize - 4, 0.3, blockSize - 4),
            new THREE.MeshLambertMaterial({ color: 0x15803d })
          );
          lawn.position.set(bx, 0.4, bz);
          buildingsGroup.add(lawn);

          const fountain = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 0.6, 16),
            new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
          );
          fountain.position.set(bx, 0.6, bz);
          buildingsGroup.add(fountain);

        } else {
          // Corporate Skyscraper
          const corpW = 22, corpD = 22, corpH = 22 + ((blockCounter * 6) % 18);
          const corpTower = new THREE.Mesh(
            new THREE.BoxGeometry(corpW, corpH, corpD),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          corpTower.position.set(bx, corpH / 2 + 0.4, bz);
          corpTower.castShadow = true;
          buildingsGroup.add(corpTower);

          const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(corpW * 0.88, corpH * 0.82),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
          );
          glass.position.set(bx, corpH / 2 + 0.4, bz + corpD / 2 + 0.05);
          buildingsGroup.add(glass);
        }

        // Place authentic Wheelie SmartBin on curbs of 6 specific blocks
        if ([2, 4, 7, 9, 12, 15].includes(blockCounter)) {
          const curbOffset = blockSize / 2 + 1.2; // Placed strictly right on curb edge facing road
          const binX = bx;
          const binZ = bz + curbOffset;
          const binIdx = smartBins.length + 1;

          const binCategory = binIdx % 3 === 1 ? "Plastic & Packaging" : (binIdx % 3 === 2 ? "Organic Food Waste" : "Paper & Cardboard");
          const binColorHex = binCategory.includes("Organic") ? 0x15803d : (binCategory.includes("Plastic") ? 0x1d4ed8 : 0xb45309);

          // Authentic 240L Wheelie Bin Geometry
          const wheelieBinGroup = new THREE.Group();

          // Tapered Rectangular Bin Body
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
            new THREE.MeshLambertMaterial({ color: 0x0f172a }) // Dark grey handle/lid
          );
          binLid.position.y = 2.4;
          wheelieBinGroup.add(binLid);

          // Small Back Wheels
          const binWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 10);
          const binWheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
          [-0.65, 0.65].forEach((wx) => {
            const bw = new THREE.Mesh(binWheelGeo, binWheelMat);
            bw.rotation.z = Math.PI / 2;
            bw.position.set(wx, 0.3, -0.55);
            wheelieBinGroup.add(bw);
          });

          // Holographic Beacon Ring
          const beaconGeo = new THREE.RingGeometry(0.8, 1.4, 24);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.rotation.x = -Math.PI / 2;
          beacon.position.y = 3.6;
          wheelieBinGroup.add(beacon);

          // Vertical Light Column
          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 })
          );
          colMesh.position.y = 5.6;
          wheelieBinGroup.add(colMesh);

          wheelieBinGroup.position.set(binX, 0, binZ);
          binGroup.add(wheelieBinGroup);

          smartBins.push({
            id: binIdx,
            group: wheelieBinGroup,
            body: binBody,
            beacon: beacon,
            column: colMesh,
            x: binX,
            z: binZ,
            category: binCategory,
            collected: false
          });
        }
      });
    });

    scene.add(buildingsGroup);
    scene.add(binGroup);
    setTotalBins(smartBins.length);

    // ─────────────────────────────────────────────────────────────
    // 6. SUCTION DEBRIS PARTICLE SYSTEM (Physical Waste Flow into Truck)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 40;
    const particleGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Orange/golden waste scrap
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

    // ─────────────────────────────────────────────────────────────
    // 7. DRIVABLE MUNICIPAL WASTE TRUCK
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();

    // Truck Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.3, 2.4),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    cabin.position.set(0, 1.5, 2.0);
    cabin.castShadow = true;
    truckGroup.add(cabin);

    // Windshield
    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 1.1, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    windshield.position.set(0, 1.9, 3.25);
    truckGroup.add(windshield);

    // Emerald Green Compactor Tank
    const compactor = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.7, 4.8),
      new THREE.MeshLambertMaterial({ color: 0x105a39 })
    );
    compactor.position.set(0, 1.8, -1.8);
    compactor.castShadow = true;
    truckGroup.add(compactor);

    // Neon Yellow Fill Gauge Strip on top
    const fillStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.82, 0.25, 4.4),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
    );
    fillStrip.position.set(0, 3.2, -1.8);
    truckGroup.add(fillStrip);

    // Headlights
    const hlLeft = new THREE.SpotLight(0xffedd5, 4.0, 35, Math.PI / 6, 0.4);
    hlLeft.position.set(-0.9, 1.5, 3.3);
    hlLeft.target.position.set(-0.9, 0, 20);
    truckGroup.add(hlLeft);
    truckGroup.add(hlLeft.target);

    const hlRight = new THREE.SpotLight(0xffedd5, 4.0, 35, Math.PI / 6, 0.4);
    hlRight.position.set(0.9, 1.5, 3.3);
    hlRight.target.position.set(0.9, 0, 20);
    truckGroup.add(hlRight);
    truckGroup.add(hlRight.target);

    // Wheels (6 Rugged Wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.55, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const wheels = [];
    [
      { x: -1.5, y: 0.7, z: 2.0 }, { x: 1.5, y: 0.7, z: 2.0 },
      { x: -1.5, y: 0.7, z: -1.4 }, { x: 1.5, y: 0.7, z: -1.4 },
      { x: -1.5, y: 0.7, z: -3.2 }, { x: 1.5, y: 0.7, z: -3.2 }
    ].forEach((wp) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wp.x, wp.y, wp.z);
      w.castShadow = true;
      truckGroup.add(w);
      wheels.push(w);
    });

    // ─────────────────────────────────────────────────────────────
    // 8. 3D DYNAMIC FLOATING GPS POINTER ARROW
    // ─────────────────────────────────────────────────────────────
    const arrowGroup = new THREE.Group();
    const arrowCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 2.2, 12),
      new THREE.MeshBasicMaterial({ color: 0xe2fd00 }) // Glowing Neon Lime
    );
    arrowCone.rotation.x = Math.PI / 2;
    arrowGroup.add(arrowCone);

    arrowGroup.position.set(0, 4.8, 0); // Floats right above truck roof
    truckGroup.add(arrowGroup);

    truckGroup.position.set(0, 0, 0);
    scene.add(truckGroup);

    // ─────────────────────────────────────────────────────────────
    // 9. ROAD CONFINEMENT HELPER (Car Cannot Drive into Gray Sidewalks)
    // ─────────────────────────────────────────────────────────────
    // Returns true if a point (x, z) is safely on asphalt road or intersection
    const halfRoad = roadWidth / 2 - 0.8; // Safe road margin
    const isPointOnRoad = (px, pz) => {
      // Check if within any horizontal avenue
      const onH = roadLines.some((rz) => Math.abs(pz - rz) <= halfRoad);
      // Check if within any vertical avenue
      const onV = roadLines.some((rx) => Math.abs(px - rx) <= halfRoad);
      // Also allow northern dumpyard apron
      const onDumpYard = (Math.abs(px - dumpyardPos.x) <= 16 && Math.abs(pz - dumpyardPos.z) <= 18);
      return onH || onV || onDumpYard;
    };

    // ─────────────────────────────────────────────────────────────
    // 10. CONTROLS & TRUCK DRIVING
    // ─────────────────────────────────────────────────────────────
    const keys = { forward: false, backward: false, left: false, right: false };

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = true;
      if (k === 's' || k === 'arrowdown') keys.backward = true;
      if (k === 'a' || k === 'arrowleft') keys.left = true;
      if (k === 'd' || k === 'arrowright') keys.right = true;
      if (k === 'h') playSound('horn');
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

    // Active collection counter timer
    let activeCollectionBin = null;
    let collectionTimer = 0; // In seconds
    const COLLECTION_DURATION = 2.5; // 2.5 second hydraulic suction loading

    // ─────────────────────────────────────────────────────────────
    // 11. ANIMATION & RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Driving input
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

      // Propose new position
      const nextX = truckGroup.position.x + Math.sin(truckAngle) * truckSpeed;
      const nextZ = truckGroup.position.z + Math.cos(truckAngle) * truckSpeed;

      // ROAD BOUNDARY CONFINEMENT TEST:
      // If proposed next position is on asphalt road, accept it!
      // Otherwise, collide / halt truck against sidewalk curb!
      if (isPointOnRoad(nextX, nextZ)) {
        truckGroup.position.x = nextX;
        truckGroup.position.z = nextZ;
      } else {
        // Prevent driving onto gray sidewalk plots
        truckSpeed = 0; // Stop on curb collision
      }

      truckGroup.rotation.y = truckAngle;

      // Wheel spin & suspension
      if (Math.abs(truckSpeed) > 0.04) {
        wheels.forEach((w) => (w.rotation.x += truckSpeed * 2.2));
        truckGroup.position.y = Math.sin(time * 16) * 0.03;
      } else {
        truckGroup.position.y = 0;
      }

      setCurrentSpeed(Math.round(Math.abs(truckSpeed) * 85));

      // ─────────────────────────────────────────────────────────────
      // DYNAMIC GPS NAVIGATION POINTER LOGIC
      // ─────────────────────────────────────────────────────────────
      // Find next uncollected smartbin
      const nextBin = smartBins.find((b) => !b.collected);
      let targetX = dumpyardPos.x;
      let targetZ = dumpyardPos.z;
      let targetLabel = "Municipal Dumpyard (Unload Waste)";

      if (nextBin) {
        targetX = nextBin.x;
        targetZ = nextBin.z;
        targetLabel = `SmartBin #${nextBin.id} (${nextBin.category})`;
      }

      setCurrentTargetName(targetLabel);
      const distToTarget = Math.hypot(truckGroup.position.x - targetX, truckGroup.position.z - targetZ);
      setTargetDistance(Math.round(distToTarget));

      // Rotate 3D pointer arrow towards target coordinates
      const worldTarget = new THREE.Vector3(targetX, 0, targetZ);
      const localTarget = truckGroup.worldToLocal(worldTarget.clone());
      const angleToPointer = Math.atan2(localTarget.x, localTarget.z);
      arrowCone.rotation.z = -angleToPointer;
      arrowCone.position.y = Math.sin(time * 5) * 0.15; // Floating bob

      // ─────────────────────────────────────────────────────────────
      // TRUCK STOPPED AT BIN → HYDRAULIC SUCTION COUNTER & PARTICLES
      // ─────────────────────────────────────────────────────────────
      const stoppedNearBin = smartBins.find(
        (b) => !b.collected && Math.hypot(truckGroup.position.x - b.x, truckGroup.position.z - b.z) < 7.5
      );

      if (stoppedNearBin && Math.abs(truckSpeed) < 0.08) {
        // Truck is stopped next to the bin!
        if (activeCollectionBin !== stoppedNearBin.id) {
          activeCollectionBin = stoppedNearBin.id;
          collectionTimer = 0;
          setCollectingBinId(stoppedNearBin.id);
          playSound('suction');
        }

        collectionTimer += delta;
        const progressPct = Math.min(100, Math.round((collectionTimer / COLLECTION_DURATION) * 100));
        setCollectProgress(progressPct);

        // Animate particles flying from bin into rear truck compactor
        const binPos = new THREE.Vector3(stoppedNearBin.x, 2.0, stoppedNearBin.z);
        const compactorPos = new THREE.Vector3(0, 1.8, -2.5).applyMatrix4(truckGroup.matrixWorld);

        particles.forEach((p, idx) => {
          p.mesh.visible = true;
          p.progress = (p.progress + p.speed) % 1;
          p.mesh.position.lerpVectors(binPos, compactorPos, p.progress);
          p.mesh.position.addScaledVector(p.offset, (1 - p.progress) * 0.5);
        });

        if (collectionTimer >= COLLECTION_DURATION) {
          // Bin fully emptied!
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
            const up = prev + 1;
            if (up >= smartBins.length) {
              setNotification("🚀 ALL DUSTBINS COLLECTED! Now drive to northern Municipal Dumpyard!");
            } else {
              setNotification(`✅ Emptied SmartBin #${stoppedNearBin.id}! (+25 kg waste in truck, +100 Eco-Points)`);
            }
            return up;
          });

          setCurrentLoad((prev) => Math.min(truckCapacity, prev + 25));
          setEcoPoints((prev) => prev + 100);
        }
      } else {
        // If truck drove away or was moving, reset suction
        if (activeCollectionBin !== null) {
          activeCollectionBin = null;
          setCollectingBinId(null);
          setCollectProgress(0);
          particles.forEach((p) => (p.mesh.visible = false));
        }
      }

      // ─────────────────────────────────────────────────────────────
      // DUMPYARD UNLOADING TRIGGER
      // ─────────────────────────────────────────────────────────────
      const distToDumpyard = Math.hypot(truckGroup.position.x - dumpyardPos.x, truckGroup.position.z - dumpyardPos.z);
      if (distToDumpyard < 12.0 && currentLoad > 0 && Math.abs(truckSpeed) < 0.08) {
        if (!dumpedAtYard) {
          setDumpedAtYard(true);
          playSound('dump');
          setCurrentLoad(0);
          setEcoPoints((prev) => prev + 250); // Bonus +250 for successful delivery!
          setNotification("🏆 DUMPED & PROCESSED AT RECYCLING YARD! Clean Shift Complete! (+250 Bonus Points)");
        }
      }

      // Camera views
      const tPos = truckGroup.position;
      if (viewMode === 'chase') {
        const camDistance = 18;
        const camHeight = 9.5;
        const targetCamX = tPos.x - Math.sin(truckAngle) * camDistance;
        const targetCamZ = tPos.z - Math.cos(truckAngle) * camDistance;

        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y += (tPos.y + camHeight - camera.position.y) * 0.1;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        camera.lookAt(tPos.x, tPos.y + 2, tPos.z);
      } else if (viewMode === 'isometric') {
        camera.position.set(tPos.x + 35, 42, tPos.z + 35);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      } else {
        // Topdown Satellite
        camera.position.set(tPos.x, 75, tPos.z + 0.1);
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
  }, [viewMode, soundEnabled, currentLoad]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none font-sans">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP STATUS BAR & REAL-TIME GPS POINTER RIBBON
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        
        {/* Left: Brand Badge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#105a39] text-white flex items-center justify-center font-black">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">SmartBin Fleet Route</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  AUTONOMOUS GPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Bilaspur Municipal Sector 4</p>
            </div>
          </div>
        </div>

        {/* Center: Real-time GPS Target Pointer Ribbon */}
        <div className="flex items-center gap-3 bg-slate-900/90 text-white px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md text-xs pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-[#e2fd00] text-black flex items-center justify-center font-bold">
            <Compass size={16} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-slate-400">NEXT STOP:</span>
              <span className="text-[#e2fd00]">{currentTargetName}</span>
            </div>
            <span className="text-[11px] text-slate-400">Distance: {targetDistance}m • Follow Yellow Roof Arrow</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 transition-all hover:scale-105 cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={() => {
              const modes = ['chase', 'isometric', 'topdown'];
              const next = modes[(modes.indexOf(viewMode) + 1) % modes.length];
              setViewMode(next);
            }}
            className="px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 text-xs font-bold uppercase transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            title="Change Camera View"
          >
            <Navigation size={14} />
            <span>Cam: {viewMode}</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 transition-all hover:scale-105 cursor-pointer"
            title="Controls & Instructions"
          >
            <HelpCircle size={18} />
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              Exit Sim
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STOPPED AT DUSTBIN: HYDRAULIC SUCTION COUNTER OVERLAY
          ───────────────────────────────────────────────────────────── */}
      {collectingBinId && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white p-5 rounded-3xl border border-emerald-500 shadow-2xl backdrop-blur-xl flex items-center gap-5 z-30 animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
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
              <Zap size={14} className="animate-bounce" />
              <span>Hydraulic Compactor Suction</span>
            </div>
            <h4 className="font-extrabold text-white text-base">Emptying SmartBin #{collectingBinId}...</h4>
            <p className="text-slate-400 text-xs mt-0.5">Physical waste particles transferring to truck compactor</p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM HUD (SPEEDOMETER, TRUCK COMPACTOR LOAD & REWARDS)
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none z-20">
        
        {/* Speedometer */}
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-4 pointer-events-auto">
          <div className="text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{currentSpeed}</span>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">KM / H</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Road Status</p>
            <p className="font-extrabold text-xs text-emerald-800">Confined to Asphalt (No Sidewalk Driving)</p>
          </div>
        </div>

        {/* Truck Waste Tank Accumulator */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-6 pointer-events-auto w-full sm:w-auto justify-between">
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-bold text-slate-800">
                Truck Waste Load: {currentLoad} / {truckCapacity} kg
              </span>
              <span className="font-extrabold text-emerald-700">
                {wasteCollected} / {totalBins} Bins Empty
              </span>
            </div>
            <div className="w-48 sm:w-64 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${(currentLoad / truckCapacity) * 100}%` }}
              />
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200" />

          {/* Eco Points */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Award size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Eco-Points</span>
              <span className="text-lg font-black text-slate-900">{ecoPoints}</span>
            </div>
          </div>
        </div>

        {/* Notification Ribbon */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10 text-xs font-medium">
          <Zap size={14} className="text-[#e2fd00]" />
          <span>{notification}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HELP MODAL
          ───────────────────────────────────────────────────────────── */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="text-[#105a39]" size={22} />
                <span>SmartBin Driver GPS Guide</span>
              </h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-6 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p><strong className="text-slate-800">Stay on Asphalt:</strong> The truck is strictly confined to roads and cannot drive into gray sidewalks or buildings.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-slate-800">Follow the Yellow Pointer Arrow:</strong> The floating arrow on the truck roof points directly to your next assigned SmartBin.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-slate-800">Stop at Bin to Collect:</strong> Stop alongside the bin. A 3-second counter will count down and garbage particles will fly into the truck!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <p><strong className="text-slate-800">Deliver to Dumpyard:</strong> Once all bins are collected, the GPS arrow guides you to the northern Municipal Dumpyard for a +250 bonus!</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-3 rounded-xl bg-[#105a39] hover:bg-[#0b452a] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Start My Route!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
