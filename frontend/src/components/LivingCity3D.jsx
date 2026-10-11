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
  Compass
} from 'lucide-react';

/**
 * LivingCity3D — Precision 4x4 Road Grid Architecture
 * 
 * Grid Structure:
 * - 4x4 Grid = 16 Clear Blocks (Plots)
 * - Roads run strictly ALONG the grid lines between blocks.
 * - Buildings are placed STRICTLY INSIDE the 16 plot boxes with sidewalk margins.
 * - ZERO buildings spawn on or overlap with roads!
 * - Roads are clean, continuous, wide, and marked with lanes & crosswalks.
 */
export default function LivingCity3D({ onExit }) {
  const mountRef = useRef(null);
  
  // Game state displayed on HUD
  const [wasteCollected, setWasteCollected] = useState(0);
  const [totalBins, setTotalBins] = useState(8);
  const [truckCapacity] = useState(100);
  const [currentLoad, setCurrentLoad] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(250);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [notification, setNotification] = useState("Drive along the roads and empty the red glowing SmartBins!");
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
      if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'horn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(277.18, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
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
    // 3. EXACT 4x4 GRID LAYOUT (16 BOXES + INTERSECTING ROADS)
    // ─────────────────────────────────────────────────────────────
    const blockSize = 32;   // Size of each block plot (X & Z)
    const roadWidth = 14;   // Clear road width
    const step = blockSize + roadWidth; // 46 units from one block center to next
    const numBlocks = 4;    // 4x4 Grid = 16 blocks total

    // 5 Horizontal Roads and 5 Vertical Roads bound the 4x4 blocks
    // Road center coordinates:
    const roadLines = [-2 * step, -1 * step, 0, 1 * step, 2 * step];
    // Block centers are at half-step offsets between the roads:
    const blockCenters = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step];

    const totalGridSpan = 5 * step + 40;

    // Ground Pavement Base
    const groundGeo = new THREE.PlaneGeometry(totalGridSpan, totalGridSpan);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x64748b }); // Sidewalk concrete base
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road Network (Dark Asphalt with Yellow Dividers)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Charcoal Asphalt
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const zebraWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const roadList = [];

    // Lay 5 Horizontal Avenues
    roadLines.forEach((rz) => {
      const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(totalGridSpan, roadWidth), roadMat);
      hRoad.rotation.x = -Math.PI / 2;
      hRoad.position.set(0, 0.02, rz);
      hRoad.receiveShadow = true;
      scene.add(hRoad);
      roadList.push({ axis: 'x', coord: rz });

      // Yellow Center Line
      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(totalGridSpan, 0.4), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(0, 0.03, rz);
      scene.add(yLine);
    });

    // Lay 5 Vertical Avenues
    roadLines.forEach((rx) => {
      const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, totalGridSpan), roadMat);
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set(rx, 0.02, 0);
      vRoad.receiveShadow = true;
      scene.add(vRoad);
      roadList.push({ axis: 'z', coord: rx });

      // Yellow Center Line
      const yLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, totalGridSpan), yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(rx, 0.03, 0);
      scene.add(yLine);
    });

    // ─────────────────────────────────────────────────────────────
    // 4. THE 16 BLOCKS (BUILDINGS, ECO-PARKS, SHOPS — ZERO OVERLAP)
    // ─────────────────────────────────────────────────────────────
    const buildingsGroup = new THREE.Group();
    const buildingColors = [
      0xf1f5f9, 0xe2e8f0, 0x0284c7, 0x0f766e, 0x3b82f6, 0x475569, 0x0d9488, 0xf97316
    ];

    let blockCounter = 0;
    const smartBins = [];
    const binGroup = new THREE.Group();

    blockCenters.forEach((bx, rowIdx) => {
      blockCenters.forEach((bz, colIdx) => {
        blockCounter++;

        // Plot Base Sidewalk Platform for this block
        const plotPlatform = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, 0.4, blockSize),
          new THREE.MeshLambertMaterial({ color: 0xcfd8dc })
        );
        plotPlatform.position.set(bx, 0.2, bz);
        plotPlatform.receiveShadow = true;
        buildingsGroup.add(plotPlatform);

        // Assign distinct architectural identities to the 16 blocks:
        // Types: 'cafe', 'corporate', 'house', 'park'
        let buildingType = 'corporate';
        if (blockCounter === 1 || blockCounter === 7) buildingType = 'cafe';
        else if (blockCounter === 5 || blockCounter === 11 || blockCounter === 14) buildingType = 'house';
        else if (blockCounter === 6 || blockCounter === 10) buildingType = 'park';
        else buildingType = 'corporate';

        // ─────────────────────────────────────────────
        // TYPE A: MODERN ROOFTOP / CORNER CAFE
        // ─────────────────────────────────────────────
        if (buildingType === 'cafe') {
          // Warm terracotta / espresso cafe base structure
          const cafeW = 20;
          const cafeD = 18;
          const cafeH = 7.5;

          const cafeBody = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW, cafeH, cafeD),
            new THREE.MeshLambertMaterial({ color: 0x292524 }) // Warm dark espresso facade
          );
          cafeBody.position.set(bx, cafeH / 2 + 0.4, bz);
          cafeBody.castShadow = true;
          cafeBody.receiveShadow = true;
          buildingsGroup.add(cafeBody);

          // Glass Front Display with Warm Interior Glow
          const cafeGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(cafeW * 0.85, 4.2),
            new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 }) // Warm coffee shop glow
          );
          cafeGlass.position.set(bx, 2.8, bz + cafeD / 2 + 0.05);
          buildingsGroup.add(cafeGlass);

          // Striped Cafe Sun Canopy / Awning (Orange & White)
          const awning = new THREE.Mesh(
            new THREE.BoxGeometry(cafeW * 0.9, 0.4, 4.0),
            new THREE.MeshLambertMaterial({ color: 0xea580c }) // Vibrant cafe orange
          );
          awning.rotation.x = 0.2;
          awning.position.set(bx, 5.2, bz + cafeD / 2 + 2.0);
          awning.castShadow = true;
          buildingsGroup.add(awning);

          // "COFFEE & BAKERY" Glowing Neon Signboard
          const signBoard = new THREE.Mesh(
            new THREE.BoxGeometry(10, 1.4, 0.4),
            new THREE.MeshBasicMaterial({ color: 0xe2fd00 }) // Neon acid lime signboard
          );
          signBoard.position.set(bx, 6.8, bz + cafeD / 2 + 0.4);
          buildingsGroup.add(signBoard);

          // Outdoor Patio Dining Tables & Parasols on Sidewalk
          const tableOffsets = [[-5, cafeD / 2 + 4.5], [5, cafeD / 2 + 4.5]];
          tableOffsets.forEach(([tox, toz]) => {
            // Table
            const table = new THREE.Mesh(
              new THREE.CylinderGeometry(1.0, 1.0, 0.1, 12),
              new THREE.MeshLambertMaterial({ color: 0xffffff })
            );
            table.position.set(bx + tox, 1.1, bz + toz);
            buildingsGroup.add(table);

            const tableLeg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6),
              new THREE.MeshLambertMaterial({ color: 0x1e293b })
            );
            tableLeg.position.set(bx + tox, 0.5, bz + toz);
            buildingsGroup.add(tableLeg);

            // Parasol Umbrella
            const umbrella = new THREE.Mesh(
              new THREE.ConeGeometry(1.8, 0.8, 8),
              new THREE.MeshLambertMaterial({ color: 0x0284c7 })
            );
            umbrella.position.set(bx + tox, 2.5, bz + toz);
            umbrella.castShadow = true;
            buildingsGroup.add(umbrella);
          });

        // ─────────────────────────────────────────────
        // TYPE B: RESIDENTIAL LOCAL HOUSE (Pitched Roof)
        // ─────────────────────────────────────────────
        } else if (buildingType === 'house') {
          const houseW = 18;
          const houseD = 18;
          const houseH = 8.0;

          // Main House Walls (Cozy Cream / Sandstone)
          const houseBody = new THREE.Mesh(
            new THREE.BoxGeometry(houseW, houseH, houseD),
            new THREE.MeshLambertMaterial({ color: 0xfef3c7 }) // Warm cream
          );
          houseBody.position.set(bx, houseH / 2 + 0.4, bz);
          houseBody.castShadow = true;
          houseBody.receiveShadow = true;
          buildingsGroup.add(houseBody);

          // Pitched Terracotta Roof (Prism / Pyramid Roof)
          const roofGeo = new THREE.ConeGeometry(houseW * 0.75, 5.0, 4);
          const roofMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Terracotta tile brown
          const roof = new THREE.Mesh(roofGeo, roofMat);
          roof.rotation.y = Math.PI / 4;
          roof.position.set(bx, houseH + 2.7, bz);
          roof.castShadow = true;
          buildingsGroup.add(roof);

          // Front Door & Entrance Porch
          const door = new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 3.4),
            new THREE.MeshLambertMaterial({ color: 0x451a03 })
          );
          door.position.set(bx, 1.7 + 0.4, bz + houseD / 2 + 0.05);
          buildingsGroup.add(door);

          // Windows with Crossframes
          const winOffsets = [-5, 5];
          winOffsets.forEach((wo) => {
            const hWin = new THREE.Mesh(
              new THREE.PlaneGeometry(2.4, 2.4),
              new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
            );
            hWin.position.set(bx + wo, 4.0, bz + houseD / 2 + 0.05);
            buildingsGroup.add(hWin);
          });

          // Small Garden Fence & Shrub
          const shrub = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.2, 0),
            new THREE.MeshLambertMaterial({ color: 0x16a34a })
          );
          shrub.position.set(bx - 6, 1.2, bz + houseD / 2 + 2.5);
          shrub.castShadow = true;
          buildingsGroup.add(shrub);

        // ─────────────────────────────────────────────
        // TYPE C: LUSH GREEN ECO-PARK
        // ─────────────────────────────────────────────
        } else if (buildingType === 'park') {
          // Park Lawn
          const lawn = new THREE.Mesh(
            new THREE.BoxGeometry(blockSize - 4, 0.3, blockSize - 4),
            new THREE.MeshLambertMaterial({ color: 0x15803d }) // Deep Emerald grass
          );
          lawn.position.set(bx, 0.4, bz);
          lawn.receiveShadow = true;
          buildingsGroup.add(lawn);

          // Park Central Fountain
          const fountain = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 0.6, 16),
            new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
          );
          fountain.position.set(bx, 0.6, bz);
          buildingsGroup.add(fountain);

          // Park Trees inside plot
          const treeOffsets = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
          treeOffsets.forEach(([ox, oz]) => {
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.3, 0.4, 2.6, 6),
              new THREE.MeshLambertMaterial({ color: 0x78350f })
            );
            trunk.position.set(bx + ox, 1.5, bz + oz);
            trunk.castShadow = true;
            buildingsGroup.add(trunk);

            const foliage = new THREE.Mesh(
              new THREE.DodecahedronGeometry(1.8, 1),
              new THREE.MeshLambertMaterial({ color: 0x16a34a })
            );
            foliage.position.set(bx + ox, 3.6, bz + oz);
            foliage.castShadow = true;
            buildingsGroup.add(foliage);
          });

        // ─────────────────────────────────────────────
        // TYPE D: CORPORATE SKYSCRAPER & TECH HQ
        // ─────────────────────────────────────────────
        } else {
          const corpW = 22;
          const corpD = 22;
          const corpH = 22 + ((blockCounter * 6) % 18); // Tall corporate towers (22 to 38 units)

          // Modern Glass & Steel Architecture Tower
          const corpTower = new THREE.Mesh(
            new THREE.BoxGeometry(corpW, corpH, corpD),
            new THREE.MeshLambertMaterial({ color: 0x0f172a }) // Slate / Gunmetal tower
          );
          corpTower.position.set(bx, corpH / 2 + 0.4, bz);
          corpTower.castShadow = true;
          corpTower.receiveShadow = true;
          buildingsGroup.add(corpTower);

          // Reflective Cyan Glass Curtain Walls
          const glassCurtain = new THREE.Mesh(
            new THREE.PlaneGeometry(corpW * 0.88, corpH * 0.82),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
          );
          glassCurtain.position.set(bx, corpH / 2 + 0.4, bz + corpD / 2 + 0.05);
          buildingsGroup.add(glassCurtain);

          // Rooftop Communications Antenna / Helipad rim
          const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.2, 6, 8),
            new THREE.MeshBasicMaterial({ color: 0xe2fd00 })
          );
          antenna.position.set(bx + 4, corpH + 3.0, bz + 4);
          buildingsGroup.add(antenna);
        }

        // Place a SmartBin on the sidewalk curbs of alternating blocks (Safe from road center!)
        if (blockCounter % 2 === 0) {
          const curbOffset = blockSize / 2 + 1.8; // Sitting nicely on the sidewalk curb facing the road
          const binX = bx;
          const binZ = bz + curbOffset;
          const binCategory = blockCounter % 3 === 0 ? "Plastic & Packaging" : (blockCounter % 3 === 1 ? "Organic Food Waste" : "Paper & Cardboard");
          const binColor = binCategory.includes("Organic") ? 0x16a34a : (binCategory.includes("Plastic") ? 0x2563eb : 0xd97706);

          // Dustbin Mesh
          const binMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.7, 2.0, 12),
            new THREE.MeshLambertMaterial({ color: binColor })
          );
          binMesh.position.set(binX, 1.0, binZ);
          binMesh.castShadow = true;
          binGroup.add(binMesh);

          // Lid
          const lid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 0.8, 0.35, 12),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          lid.position.set(binX, 2.1, binZ);
          binGroup.add(lid);

          // Glowing Red Pulsating Beacon
          const beaconGeo = new THREE.RingGeometry(0.8, 1.4, 24);
          const beaconMat = new THREE.MeshBasicMaterial({ 
            color: 0xef4444, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.85 
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.rotation.x = -Math.PI / 2;
          beacon.position.set(binX, 3.4, binZ);
          binGroup.add(beacon);

          // Holographic Vertical Column
          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 })
          );
          colMesh.position.set(binX, 5.2, binZ);
          binGroup.add(colMesh);

          smartBins.push({
            id: blockCounter,
            mesh: binMesh,
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
    // 5. DRIVABLE MUNICIPAL WASTE COLLECTION TRUCK
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();

    // Truck Cabin (White & Sleek)
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

    // Emerald Green Garbage Compactor Tank
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
    const wheelPositions = [
      { x: -1.5, y: 0.7, z: 2.0 },
      { x: 1.5, y: 0.7, z: 2.0 },
      { x: -1.5, y: 0.7, z: -1.4 },
      { x: 1.5, y: 0.7, z: -1.4 },
      { x: -1.5, y: 0.7, z: -3.2 },
      { x: 1.5, y: 0.7, z: -3.2 }
    ];

    const wheels = [];
    wheelPositions.forEach((wp) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wp.x, wp.y, wp.z);
      w.castShadow = true;
      truckGroup.add(w);
      wheels.push(w);
    });

    // Spawn truck squarely on the CENTRAL ROAD AVENUE (Z=0, X=0, Facing along road)
    truckGroup.position.set(0, 0, 0);
    scene.add(truckGroup);

    // ─────────────────────────────────────────────────────────────
    // 6. CIVILIAN TRAFFIC CARS (STRICTLY CONFINED TO ROADS)
    // ─────────────────────────────────────────────────────────────
    const trafficCars = [];
    const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4];
    const carGeo = new THREE.BoxGeometry(2.0, 1.2, 3.8);

    roadLines.forEach((coord, idx) => {
      // 1 horizontal car per road
      const hColor = carColors[idx % carColors.length];
      const hCar = new THREE.Mesh(carGeo, new THREE.MeshLambertMaterial({ color: hColor }));
      hCar.position.set((Math.random() - 0.5) * totalGridSpan * 0.7, 0.6, coord + 3.2); // Right lane
      hCar.rotation.y = -Math.PI / 2;
      hCar.castShadow = true;
      scene.add(hCar);
      trafficCars.push({ mesh: hCar, axis: 'x', dir: 1, speed: 0.22 + Math.random() * 0.1 });

      // 1 vertical car per road
      const vColor = carColors[(idx + 2) % carColors.length];
      const vCar = new THREE.Mesh(carGeo, new THREE.MeshLambertMaterial({ color: vColor }));
      vCar.position.set(coord - 3.2, 0.6, (Math.random() - 0.5) * totalGridSpan * 0.7); // Left lane
      vCar.rotation.y = Math.PI;
      vCar.castShadow = true;
      scene.add(vCar);
      trafficCars.push({ mesh: vCar, axis: 'z', dir: -1, speed: 0.22 + Math.random() * 0.1 });
    });

    // ─────────────────────────────────────────────────────────────
    // 7. PEDESTRIAN CITIZENS (WALKING ON SIDEWALKS ONLY)
    // ─────────────────────────────────────────────────────────────
    const npcs = [];
    const npcColors = [0x0284c7, 0xec4899, 0x10b981, 0xf97316, 0x6366f1];

    blockCenters.forEach((bx) => {
      blockCenters.forEach((bz) => {
        // Place a pedestrian walking along block sidewalk perimeter
        const npcGroup = new THREE.Group();
        const pColor = npcColors[Math.floor(Math.random() * npcColors.length)];

        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8),
          new THREE.MeshLambertMaterial({ color: pColor })
        );
        body.position.y = 0.9;
        body.castShadow = true;
        npcGroup.add(body);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 8, 8),
          new THREE.MeshLambertMaterial({ color: 0xfde047 })
        );
        head.position.y = 1.7;
        head.castShadow = true;
        npcGroup.add(head);

        // Position on sidewalk edge of this block
        npcGroup.position.set(bx + (blockSize / 2 - 2), 0, bz + (Math.random() - 0.5) * (blockSize - 4));
        scene.add(npcGroup);

        npcs.push({
          group: npcGroup,
          minZ: bz - blockSize / 2 + 3,
          maxZ: bz + blockSize / 2 - 3,
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: 0.04 + Math.random() * 0.03,
          bobPhase: Math.random() * Math.PI
        });
      });
    });

    // ─────────────────────────────────────────────────────────────
    // 8. CONTROLS & TRUCK DRIVING PHYSICS
    // ─────────────────────────────────────────────────────────────
    const keys = { forward: false, backward: false, left: false, right: false, space: false };

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = true;
      if (k === 's' || k === 'arrowdown') keys.backward = true;
      if (k === 'a' || k === 'arrowleft') keys.left = true;
      if (k === 'd' || k === 'arrowright') keys.right = true;
      if (e.code === 'Space') {
        keys.space = true;
        collectNearbyWaste();
      }
      if (k === 'h') playSound('horn');
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.forward = false;
      if (k === 's' || k === 'arrowdown') keys.backward = false;
      if (k === 'a' || k === 'arrowleft') keys.left = false;
      if (k === 'd' || k === 'arrowright') keys.right = false;
      if (e.code === 'Space') keys.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let truckSpeed = 0;
    const maxSpeed = 0.6;
    const acceleration = 0.022;
    const deceleration = 0.015;
    const turnSpeed = 0.045;
    let truckAngle = 0;

    const collectNearbyWaste = () => {
      const tx = truckGroup.position.x;
      const tz = truckGroup.position.z;

      smartBins.forEach((b) => {
        if (!b.collected) {
          const dist = Math.hypot(tx - b.x, tz - b.z);
          if (dist < 8.0) {
            b.collected = true;
            b.beacon.material.color.setHex(0x10b981); // Turn Green (Emptied!)
            b.column.material.color.setHex(0x10b981);
            b.mesh.material.color.setHex(0x10b981);

            playSound('collect');

            setWasteCollected((prev) => {
              const updated = prev + 1;
              if (updated >= smartBins.length) {
                setNotification("🎉 ALL CITY DUSTBINS EMPTIED! Perfect 100% Clean City Score!");
              } else {
                setNotification(`✅ Emptied SmartBin #${b.id} (${b.category})! +100 Eco-Points`);
              }
              return updated;
            });

            setCurrentLoad((prev) => Math.min(truckCapacity, prev + 25));
            setEcoPoints((prev) => prev + 100);
          }
        }
      });
    };

    // ─────────────────────────────────────────────────────────────
    // 9. ANIMATION & RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
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

      truckGroup.rotation.y = truckAngle;
      truckGroup.position.x += Math.sin(truckAngle) * truckSpeed;
      truckGroup.position.z += Math.cos(truckAngle) * truckSpeed;

      // Wheel spin & suspension
      if (Math.abs(truckSpeed) > 0.04) {
        wheels.forEach((w) => (w.rotation.x += truckSpeed * 2.2));
        truckGroup.position.y = Math.sin(time * 16) * 0.03;
      } else {
        truckGroup.position.y = 0;
      }

      setCurrentSpeed(Math.round(Math.abs(truckSpeed) * 85));

      // Auto-collection proximity check
      smartBins.forEach((b) => {
        if (!b.collected) {
          b.beacon.scale.setScalar(1 + Math.sin(time * 6) * 0.15);
          const d = Math.hypot(truckGroup.position.x - b.x, truckGroup.position.z - b.z);
          if (d < 5.5) {
            collectNearbyWaste();
          }
        }
      });

      // Traffic Cars Animation (Looping on their roads)
      trafficCars.forEach((c) => {
        if (c.axis === 'x') {
          c.mesh.position.x += c.speed * c.dir;
          if (c.mesh.position.x > totalGridSpan / 2) c.mesh.position.x = -totalGridSpan / 2;
          if (c.mesh.position.x < -totalGridSpan / 2) c.mesh.position.x = totalGridSpan / 2;
        } else {
          c.mesh.position.z += c.speed * c.dir;
          if (c.mesh.position.z > totalGridSpan / 2) c.mesh.position.z = -totalGridSpan / 2;
          if (c.mesh.position.z < -totalGridSpan / 2) c.mesh.position.z = totalGridSpan / 2;
        }
      });

      // Pedestrian walking animation
      npcs.forEach((n) => {
        n.bobPhase += 0.14;
        n.group.position.y = Math.abs(Math.sin(n.bobPhase)) * 0.15;
        n.group.position.z += n.speed * n.dir;
        if (n.group.position.z > n.maxZ || n.group.position.z < n.minZ) {
          n.dir *= -1;
        }
      });

      // Camera views
      const tPos = truckGroup.position;
      if (viewMode === 'chase') {
        const camDistance = 18;
        const camHeight = 9.5;
        const targetX = tPos.x - Math.sin(truckAngle) * camDistance;
        const targetZ = tPos.z - Math.cos(truckAngle) * camDistance;

        camera.position.x += (targetX - camera.position.x) * 0.1;
        camera.position.y += (tPos.y + camHeight - camera.position.y) * 0.1;
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        camera.lookAt(tPos.x, tPos.y + 2, tPos.z);
      } else if (viewMode === 'isometric') {
        camera.position.set(tPos.x + 35, 42, tPos.z + 35);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      } else {
        // Topdown Satellite
        camera.position.set(tPos.x, 70, tPos.z + 0.1);
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
  }, [viewMode, soundEnabled]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none font-sans">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ─────────────────────────────────────────────────────────────
          TOP STATUS BAR
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
                <span className="font-extrabold text-slate-900 text-sm">SmartBin 4x4 Grid City</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  PRECISION GRID
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">16 Blocks • 5x5 Clear Avenues</p>
            </div>
          </div>
        </div>

        {/* Center: Live Notification Ribbon */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 text-white px-5 py-2 rounded-full border border-white/10 shadow-xl backdrop-blur-md text-xs font-medium animate-pulse">
          <Zap size={14} className="text-[#e2fd00]" />
          <span>{notification}</span>
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
          BOTTOM HUD
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
            <p className="text-[10px] text-slate-500 font-bold uppercase">Fleet Vehicle</p>
            <p className="font-extrabold text-xs text-emerald-800">Garbage Truck 6T (CG-10)</p>
          </div>
        </div>

        {/* Waste Collection Progress */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-6 pointer-events-auto w-full sm:w-auto justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trash2 size={16} className="text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                City Waste Cleaned: {wasteCollected} / {totalBins} Bins
              </span>
            </div>
            <div className="w-48 sm:w-64 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${totalBins > 0 ? (wasteCollected / totalBins) * 100 : 0}%` }}
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

        {/* Controls Guide */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10 text-xs font-medium">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-white/20">W</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/20">A</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/20">S</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/20">D</kbd>
          </div>
          <span className="text-slate-400">to Drive •</span>
          <span className="text-emerald-400 font-bold">SPACE</span>
          <span className="text-slate-400">or Proximity to Empty Bins</span>
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
                <span>How to Play the Living City Sim</span>
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
                <p><strong className="text-slate-800">Drive through 5x5 Avenues:</strong> Use <kbd className="px-1 bg-slate-100 rounded border">W, A, S, D</kbd> to steer your truck along unobstructed wide roads.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-slate-800">Find Red Beacons:</strong> Look for the red glowing columns above SmartBins placed along block curbs.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-slate-800">Collect Waste:</strong> Drive close to the bin or tap <kbd className="px-1 bg-slate-100 rounded border">SPACEBAR</kbd> to empty the bin and earn +100 Eco-Points!</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-3 rounded-xl bg-[#105a39] hover:bg-[#0b452a] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Got it, let's drive!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
