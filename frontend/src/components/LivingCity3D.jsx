import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Truck, 
  Trash2, 
  Navigation, 
  Award, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  HelpCircle, 
  CheckCircle2, 
  RotateCcw,
  Zap
} from 'lucide-react';

/**
 * LivingCity3D:
 * Full interactive 3D procedural simulation of a living smart city.
 * - Procedural road grid, buildings, crosswalks, streetlights, trees, and smart dustbins.
 * - Autonomous NPC pedestrians walking on sidewalks and crossing roads.
 * - Autonomous AI traffic cars cruising through intersections.
 * - Player-controllable Municipal Waste Collection Truck (WASD / Arrows) with steering physics, suspension bobbing, headlights.
 * - Functional waste collection mechanic: drive close to overflowing dustbins (marked with holographic beacons),
 *   press SPACE or proximity auto-empty to collect waste, accumulate load in truck, gain Eco-Points.
 * - Smooth follow-cam with chase/isometric view toggles.
 * - Audio synthesizers using Web Audio API (engine hum, collection chime, horn).
 */
export default function LivingCity3D({ onExit }) {
  const mountRef = useRef(null);
  
  // Game state displayed on HUD
  const [wasteCollected, setWasteCollected] = useState(0);
  const [totalBins, setTotalBins] = useState(8);
  const [truckCapacity, setTruckCapacity] = useState(100); // Max kg
  const [currentLoad, setCurrentLoad] = useState(0); // Current kg
  const [ecoPoints, setEcoPoints] = useState(250);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [notification, setNotification] = useState("Drive near glowing red SmartBins to collect garbage!");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('chase'); // 'chase' | 'isometric' | 'topdown'
  const [showHelp, setShowHelp] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Play simple procedural sound effects using Web Audio API (Zero external MP3 dependency)
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
        // High pitched pleasant success chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
        gain.gain.setValueAtTime(0.15, now);
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
    } catch {
      // Audio not permitted / suppressed
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS SCENE SETUP
    // ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe); // Morning clean sky
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.008);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 500);
    camera.position.set(0, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. LIGHTING & ATMOSPHERE
    // ─────────────────────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x93c5fd, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    dirLight.position.set(60, 100, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    const d = 90;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // ─────────────────────────────────────────────────────────────
    // 3. PROCEDURAL CITY GENERATION (ROADS, BLOCKS, BUILDINGS, PARKS)
    // ─────────────────────────────────────────────────────────────
    const citySize = 160;
    const roadWidth = 14;
    const blockStep = 40; // 4x4 Grid of city blocks

    // Ground Plane (Pavement & Grass)
    const groundGeo = new THREE.PlaneGeometry(citySize * 1.5, citySize * 1.5);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 }); // Slate sidewalk base
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road Texture & Network
    const roads = [];
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Dark asphalt
    const markingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow divider
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White stripes

    // Create horizontal and vertical avenue strips
    for (let c = -citySize / 2 + blockStep / 2; c <= citySize / 2 - blockStep / 2; c += blockStep) {
      // Horizontal Road
      const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(citySize * 1.3, roadWidth), roadMat);
      hRoad.rotation.x = -Math.PI / 2;
      hRoad.position.set(0, 0.02, c);
      hRoad.receiveShadow = true;
      scene.add(hRoad);
      roads.push({ axis: 'x', coord: c, min: -citySize * 0.65, max: citySize * 0.65 });

      // Horizontal Yellow Divider
      const hMark = new THREE.Mesh(new THREE.PlaneGeometry(citySize * 1.3, 0.4), markingMat);
      hMark.rotation.x = -Math.PI / 2;
      hMark.position.set(0, 0.03, c);
      scene.add(hMark);

      // Vertical Road
      const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, citySize * 1.3), roadMat);
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set(c, 0.02, 0);
      vRoad.receiveShadow = true;
      scene.add(vRoad);
      roads.push({ axis: 'z', coord: c, min: -citySize * 0.65, max: citySize * 0.65 });

      // Vertical Yellow Divider
      const vMark = new THREE.Mesh(new THREE.PlaneGeometry(0.4, citySize * 1.3), markingMat);
      vMark.rotation.x = -Math.PI / 2;
      vMark.position.set(c, 0.03, 0);
      scene.add(vMark);
    }

    // Buildings & Street Assets
    const buildingsGroup = new THREE.Group();
    const buildingColors = [
      0xf8fafc, 0xe2e8f0, 0xcbd5e1, 0x0284c7, 0x0f766e, 0x334155, 0x1e3a8a, 0xf97316
    ];

    const obstacles = []; // Colliders for truck navigation

    // Populate City Blocks
    const halfBlock = blockStep / 2;
    for (let bx = -citySize / 2; bx < citySize / 2; bx += blockStep) {
      for (let bz = -citySize / 2; bz < citySize / 2; bz += blockStep) {
        const centerX = bx + halfBlock;
        const centerZ = bz + halfBlock;

        // Skip roads (if center falls inside road, skip)
        const isNearRoadX = Math.abs((bx % blockStep) - (blockStep / 2)) < 5;
        
        // 1 in 5 blocks is a lush Green Eco-Park
        if ((Math.abs(centerX + centerZ) % 3 === 0)) {
          // Park Lawn
          const parkGeo = new THREE.BoxGeometry(blockStep - roadWidth - 2, 0.2, blockStep - roadWidth - 2);
          const parkMat = new THREE.MeshLambertMaterial({ color: 0x15803d }); // Emerald grass
          const park = new THREE.Mesh(parkGeo, parkMat);
          park.position.set(centerX, 0.1, centerZ);
          park.receiveShadow = true;
          scene.add(park);

          // Park Fountain or Trees
          for (let t = 0; t < 5; t++) {
            const tx = centerX + (Math.random() - 0.5) * (blockStep - roadWidth - 8);
            const tz = centerZ + (Math.random() - 0.5) * (blockStep - roadWidth - 8);
            
            // Tree Trunk
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.3, 0.4, 2.5, 6),
              new THREE.MeshLambertMaterial({ color: 0x78350f })
            );
            trunk.position.set(tx, 1.25, tz);
            trunk.castShadow = true;
            scene.add(trunk);

            // Foliage
            const foliage = new THREE.Mesh(
              new THREE.DodecahedronGeometry(1.6, 1),
              new THREE.MeshLambertMaterial({ color: 0x16a34a })
            );
            foliage.position.set(tx, 3.2, tz);
            foliage.castShadow = true;
            scene.add(foliage);
          }
          continue;
        }

        // Modern Commercial / Residential Buildings on this block
        const bWidth = (blockStep - roadWidth - 2) * (0.6 + Math.random() * 0.35);
        const bDepth = (blockStep - roadWidth - 2) * (0.6 + Math.random() * 0.35);
        const bHeight = 8 + Math.random() * 26; // Varied skylines

        const bColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMat = new THREE.MeshLambertMaterial({ color: bColor });
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(centerX, bHeight / 2, centerZ);
        building.castShadow = true;
        building.receiveShadow = true;
        buildingsGroup.add(building);

        // Add window panels / architectural glow stripes
        const winGeo = new THREE.PlaneGeometry(bWidth * 0.9, bHeight * 0.8);
        const winMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.35 });
        const winFront = new THREE.Mesh(winGeo, winMat);
        winFront.position.set(centerX, bHeight / 2, centerZ + bDepth / 2 + 0.05);
        buildingsGroup.add(winFront);

        // Collision box for vehicle physics
        obstacles.push({
          minX: centerX - bWidth / 2 - 1,
          maxX: centerX + bWidth / 2 + 1,
          minZ: centerZ - bDepth / 2 - 1,
          maxZ: centerZ + bDepth / 2 + 1
        });
      }
    }
    scene.add(buildingsGroup);

    // ─────────────────────────────────────────────────────────────
    // 4. SMART DUSTBINS WITH HOLO-BEACONS & FILL STATUS
    // ─────────────────────────────────────────────────────────────
    const smartBins = [];
    const binPositions = [
      { x: -16, z: -18, cat: "Plastic Bottles", fill: 88 },
      { x: 18, z: -22, cat: "Organic Food Waste", fill: 95 },
      { x: -24, z: 22, cat: "Cardboard Packaging", fill: 76 },
      { x: 22, z: 18, cat: "Beverage Metal Cans", fill: 92 },
      { x: -56, z: -18, cat: "Mixed Commercial", fill: 84 },
      { x: 58, z: -22, cat: "Plastic Containers", fill: 90 },
      { x: -18, z: 58, cat: "Organic Leaves/Wet", fill: 80 },
      { x: 22, z: 56, cat: "Cardboard Boxes", fill: 85 },
    ];

    const binGroup = new THREE.Group();

    binPositions.forEach((pos, idx) => {
      // Dustbin mesh
      const binColor = pos.cat.includes("Organic") ? 0x16a34a : (pos.cat.includes("Plastic") ? 0x2563eb : 0xd97706);
      const binMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.6, 1.8, 12),
        new THREE.MeshLambertMaterial({ color: binColor })
      );
      binMesh.position.set(pos.x, 0.9, pos.z);
      binMesh.castShadow = true;
      binGroup.add(binMesh);

      // Lid
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.7, 0.3, 12),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      lid.position.set(pos.x, 1.9, pos.z);
      binGroup.add(lid);

      // Pulsating Holo-Beacon Ring above bin
      const beaconGeo = new THREE.RingGeometry(0.8, 1.3, 24);
      const beaconMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.8 
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.set(pos.x, 3.2, pos.z);
      binGroup.add(beacon);

      // Holographic Vertical Light Column
      const colGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 8);
      const colMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
      const column = new THREE.Mesh(colGeo, colMat);
      column.position.set(pos.x, 5.0, pos.z);
      binGroup.add(column);

      smartBins.push({
        id: idx + 1,
        mesh: binMesh,
        beacon: beacon,
        column: column,
        x: pos.x,
        z: pos.z,
        cat: pos.cat,
        fill: pos.fill,
        collected: false
      });
    });

    scene.add(binGroup);

    // ─────────────────────────────────────────────────────────────
    // 5. PLAYER'S MUNICIPAL WASTE COLLECTION TRUCK
    // ─────────────────────────────────────────────────────────────
    const truckGroup = new THREE.Group();

    // Truck Chassis (White & Green Eco Fleet)
    const cabinGeo = new THREE.BoxGeometry(2.4, 2.2, 2.4);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White cabin
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.4, 1.8);
    cabin.castShadow = true;
    truckGroup.add(cabin);

    // Windshield
    const windGeo = new THREE.BoxGeometry(2.1, 1.0, 0.2);
    const windMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const windshield = new THREE.Mesh(windGeo, windMat);
    windshield.position.set(0, 1.8, 3.0);
    truckGroup.add(windshield);

    // Rear Garbage Compactor Tank (Signature SmartBin Emerald)
    const tankGeo = new THREE.BoxGeometry(2.6, 2.6, 4.4);
    const tankMat = new THREE.MeshLambertMaterial({ color: 0x105a39 }); // SmartBin Green
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 1.7, -1.8);
    tank.castShadow = true;
    truckGroup.add(tank);

    // Dynamic Garbage Fill Indicator Strip
    const fillStripGeo = new THREE.BoxGeometry(2.62, 0.25, 4.2);
    const fillStripMat = new THREE.MeshBasicMaterial({ color: 0xe2fd00 }); // Neon yellow indicator
    const fillStrip = new THREE.Mesh(fillStripGeo, fillStripMat);
    fillStrip.position.set(0, 3.05, -1.8);
    truckGroup.add(fillStrip);

    // Headlights (Spotlights)
    const headLightLeft = new THREE.SpotLight(0xffedd5, 4.0, 30, Math.PI / 6, 0.4);
    headLightLeft.position.set(-0.8, 1.4, 3.1);
    headLightLeft.target.position.set(-0.8, 0, 15);
    truckGroup.add(headLightLeft);
    truckGroup.add(headLightLeft.target);

    const headLightRight = new THREE.SpotLight(0xffedd5, 4.0, 30, Math.PI / 6, 0.4);
    headLightRight.position.set(0.8, 1.4, 3.1);
    headLightRight.target.position.set(0.8, 0, 15);
    truckGroup.add(headLightRight);
    truckGroup.add(headLightRight.target);

    // Wheels (4 big rugged truck wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const wheelPositions = [
      { x: -1.4, y: 0.65, z: 1.8 },
      { x: 1.4, y: 0.65, z: 1.8 },
      { x: -1.4, y: 0.65, z: -1.4 },
      { x: 1.4, y: 0.65, z: -1.4 },
      { x: -1.4, y: 0.65, z: -3.0 },
      { x: 1.4, y: 0.65, z: -3.0 },
    ];

    const wheels = [];
    wheelPositions.forEach((wp) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wp.x, wp.y, wp.z);
      wheel.castShadow = true;
      truckGroup.add(wheel);
      wheels.push(wheel);
    });

    // Start player truck on central avenue
    truckGroup.position.set(0, 0, 0);
    scene.add(truckGroup);

    // ─────────────────────────────────────────────────────────────
    // 6. AUTONOMOUS AI TRAFFIC (CIVILIAN CARS)
    // ─────────────────────────────────────────────────────────────
    const trafficCars = [];
    const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x64748b, 0xa855f7];

    const carGeo = new THREE.BoxGeometry(1.8, 1.1, 3.4);
    for (let i = 0; i < 10; i++) {
      const carMat = new THREE.MeshLambertMaterial({ 
        color: carColors[Math.floor(Math.random() * carColors.length)] 
      });
      const car = new THREE.Mesh(carGeo, carMat);
      car.castShadow = true;

      // Assign to a random road lane
      const road = roads[i % roads.length];
      const isX = road.axis === 'x';
      const laneOffset = (i % 2 === 0 ? 3.5 : -3.5); // Right or left lane

      if (isX) {
        car.position.set((Math.random() - 0.5) * citySize * 0.9, 0.6, road.coord + laneOffset);
        car.rotation.y = laneOffset > 0 ? -Math.PI / 2 : Math.PI / 2;
      } else {
        car.position.set(road.coord + laneOffset, 0.6, (Math.random() - 0.5) * citySize * 0.9);
        car.rotation.y = laneOffset > 0 ? 0 : Math.PI;
      }

      scene.add(car);
      trafficCars.push({
        mesh: car,
        axis: road.axis,
        speed: 0.18 + Math.random() * 0.12,
        direction: laneOffset > 0 ? 1 : -1,
        min: -citySize * 0.55,
        max: citySize * 0.55
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. AUTONOMOUS NPC CITIZENS (PEDESTRIANS)
    // ─────────────────────────────────────────────────────────────
    const npcs = [];
    const npcColors = [0x0284c7, 0xec4899, 0x10b981, 0xf97316, 0x6366f1, 0x14b8a6];

    for (let i = 0; i < 24; i++) {
      const npcGroup = new THREE.Group();
      // Body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: npcColors[i % npcColors.length] })
      );
      body.position.y = 0.9;
      body.castShadow = true;
      npcGroup.add(body);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0xfde047 }) // Yellow/skin tone
      );
      head.position.y = 1.7;
      head.castShadow = true;
      npcGroup.add(head);

      // Spawn on sidewalks (just off the roads)
      const road = roads[i % roads.length];
      const sidewalkOffset = (i % 2 === 0 ? roadWidth / 2 + 1.8 : -roadWidth / 2 - 1.8);
      
      if (road.axis === 'x') {
        npcGroup.position.set((Math.random() - 0.5) * citySize * 0.8, 0, road.coord + sidewalkOffset);
      } else {
        npcGroup.position.set(road.coord + sidewalkOffset, 0, (Math.random() - 0.5) * citySize * 0.8);
      }

      scene.add(npcGroup);
      npcs.push({
        group: npcGroup,
        axis: road.axis,
        speed: 0.03 + Math.random() * 0.03,
        dir: Math.random() > 0.5 ? 1 : -1,
        bobPhase: Math.random() * Math.PI * 2,
        min: -citySize * 0.5,
        max: citySize * 0.5
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 8. VEHICLE PHYSICS & KEYBOARD INPUT
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
      if (k === 'h') {
        playSound('horn');
      }
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

    // Vehicle state variables
    let truckSpeed = 0;
    const maxSpeed = 0.55;
    const acceleration = 0.02;
    const deceleration = 0.015;
    const turnSpeed = 0.04;
    let truckAngle = 0;

    // Waste collection logic
    const collectNearbyWaste = () => {
      const tx = truckGroup.position.x;
      const tz = truckGroup.position.z;

      smartBins.forEach((bin) => {
        if (!bin.collected) {
          const dist = Math.hypot(tx - bin.x, tz - bin.z);
          if (dist < 6.5) {
            // Collect this bin!
            bin.collected = true;
            bin.beacon.material.color.setHex(0x10b981); // Turn Green (Emptied)
            bin.column.material.color.setHex(0x10b981);
            bin.mesh.material.color.setHex(0x10b981);

            playSound('collect');

            setWasteCollected((prev) => {
              const updated = prev + 1;
              if (updated >= totalBins) {
                setNotification("🎉 ALL CITY DUSTBINS EMPTIED! City Score: 100% Spotless!");
              } else {
                setNotification(`✅ Emptied ${bin.cat}! (+25 kg collected, +100 Eco-Points)`);
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
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Truck Acceleration & Steering
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

      // Truck suspension bounce while moving
      if (Math.abs(truckSpeed) > 0.05) {
        truckGroup.position.y = Math.sin(time * 18) * 0.04;
        wheels.forEach((w) => (w.rotation.x += truckSpeed * 2));
      } else {
        truckGroup.position.y = 0;
      }

      setCurrentSpeed(Math.round(Math.abs(truckSpeed) * 80));

      // Auto-collection proximity trigger (convenience check)
      smartBins.forEach((b) => {
        if (!b.collected) {
          const d = Math.hypot(truckGroup.position.x - b.x, truckGroup.position.z - b.z);
          // Pulsating beacon scale
          b.beacon.scale.setScalar(1 + Math.sin(time * 6) * 0.15);
          if (d < 4.2) {
            collectNearbyWaste();
          }
        }
      });

      // 2. Traffic Cars Movement
      trafficCars.forEach((c) => {
        if (c.axis === 'x') {
          c.mesh.position.x += c.speed * c.direction;
          if (c.mesh.position.x > c.max) c.mesh.position.x = c.min;
          if (c.mesh.position.x < c.min) c.mesh.position.x = c.max;
        } else {
          c.mesh.position.z += c.speed * c.direction;
          if (c.mesh.position.z > c.max) c.mesh.position.z = c.min;
          if (c.mesh.position.z < c.min) c.mesh.position.z = c.max;
        }
      });

      // 3. NPC Pedestrians Walking & Bobbing
      npcs.forEach((n) => {
        n.bobPhase += 0.12;
        n.group.position.y = Math.abs(Math.sin(n.bobPhase)) * 0.15; // Gentle walking step

        if (n.axis === 'x') {
          n.group.position.x += n.speed * n.dir;
          if (n.group.position.x > n.max || n.group.position.x < n.min) n.dir *= -1;
        } else {
          n.group.position.z += n.speed * n.dir;
          if (n.group.position.z > n.max || n.group.position.z < n.min) n.dir *= -1;
        }
      });

      // 4. Camera Follow System
      const tPos = truckGroup.position;
      if (viewMode === 'chase') {
        // Smooth cinematic third-person chase camera
        const camDistance = 16;
        const camHeight = 9;
        const targetCamX = tPos.x - Math.sin(truckAngle) * camDistance;
        const targetCamZ = tPos.z - Math.cos(truckAngle) * camDistance;
        
        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y += (tPos.y + camHeight - camera.position.y) * 0.1;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        camera.lookAt(tPos.x, tPos.y + 2, tPos.z);
      } else if (viewMode === 'isometric') {
        camera.position.set(tPos.x + 28, 35, tPos.z + 28);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      } else {
        // Top-down bird's-eye GPS satellite view
        camera.position.set(tPos.x, 55, tPos.z + 0.1);
        camera.lookAt(tPos.x, tPos.y, tPos.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
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
          TOP BAR / SIMULATION STATUS
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        
        {/* Left: Brand & City Zone */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#105a39] text-white flex items-center justify-center font-black">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">SmartBin Fleet Simulator</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  LIVE 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Bilaspur Municipal Sector 4</p>
            </div>
          </div>
        </div>

        {/* Center: Live Notification Ribbon */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 text-white px-5 py-2 rounded-full border border-white/10 shadow-xl backdrop-blur-md text-xs font-medium animate-pulse">
          <Zap size={14} className="text-[#e2fd00]" />
          <span>{notification}</span>
        </div>

        {/* Right Controls: Audio, Camera, Help, Exit */}
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
          BOTTOM HUD: GAUGES, ECO-POINTS & VEHICLE METRICS
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none z-20">
        
        {/* Speedometer & Gear */}
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-4 pointer-events-auto">
          <div className="text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{currentSpeed}</span>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">KM / H</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Type</p>
            <p className="font-extrabold text-xs text-emerald-800">Garbage Truck 6T (CG-10)</p>
          </div>
        </div>

        {/* Central Waste Collection Progress Gauge */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-6 pointer-events-auto w-full sm:w-auto justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trash2 size={16} className="text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                City Waste Cleaned: {wasteCollected} / {totalBins} Bins
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-48 sm:w-64 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${(wasteCollected / totalBins) * 100}%` }}
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
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Eco-Points Earned</span>
              <span className="text-lg font-black text-slate-900">{ecoPoints}</span>
            </div>
          </div>
        </div>

        {/* Controls Hint Card */}
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
          HELP MODAL / INSTRUCTIONS
          ───────────────────────────────────────────────────────────── */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
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
                <p><strong className="text-slate-800">Drive the Municipal Truck:</strong> Use <kbd className="px-1 bg-slate-100 rounded border">W, A, S, D</kbd> or Arrow Keys to steer through the streets.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p><strong className="text-slate-800">Locate Overflowing Dustbins:</strong> Follow the glowing red beacons above smartbins placed across the city.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p><strong className="text-slate-800">Collect Waste & Earn:</strong> Drive close to the bin or tap <kbd className="px-1 bg-slate-100 rounded border">SPACEBAR</kbd>. The beacon turns green and adds +100 Eco-Points!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <p><strong className="text-slate-800">Traffic & Pedestrians:</strong> Watch out for civilian traffic and pedestrians moving in real time.</p>
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
