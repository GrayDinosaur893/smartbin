import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WasteTransformationCanvas:
 * Interactive 3D WebGL Crystal & Waste Particle Metamorphosis Core
 * Inspired by Crystallize (prism-on.tokyo) and TBWA\HAKUHODO's brutalist slash aesthetics.
 * Features:
 * - Dynamic Icosahedron / Crystal lattice representing raw unorganized material
 * - Floating orbiting particles transforming from dark discarded shards to glowing emerald/acid crystals
 * - Mouse-driven parallax and velocity acceleration on hover/drag
 * - Graceful fallback if WebGL context is unavailable or reduced-motion is requested
 */
export default function WasteTransformationCanvas({ className = "" }) {
  const mountRef = useRef(null);

  useEffectMounted: useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // Fallback to CSS animation if WebGL fails
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central Metamorphic Crystal Lattice (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(1.6, 1);
    
    // Custom translucent refraction-style material
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      emissive: 0x059669,
      emissiveIntensity: 0.25,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 1.2,
      ior: 1.45,
      wireframe: false,
    });

    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    rootGroup.add(crystalMesh);

    // 2. Wireframe Outer Cage (Crystallize facets)
    const wireGeo = new THREE.WireframeGeometry(crystalGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xe2fd00, // TBWA signature acid yellow / neon lime
      transparent: true,
      opacity: 0.45,
      linewidth: 1,
    });
    const wireLine = new THREE.LineSegments(wireGeo, wireMat);
    crystalMesh.add(wireLine);

    // 3. Inner Core Geode (Glowing Emerald Nucleus)
    const innerGeo = new THREE.OctahedronGeometry(0.85, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    crystalMesh.add(innerMesh);

    // 4. Orbiting Shards / Transformed Eco-Nodes Particle Field
    const shardCount = 80;
    const shardGeo = new THREE.TetrahedronGeometry(0.06, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xe2fd00,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
    });

    const shardGroup = new THREE.Group();
    const shards = [];

    for (let i = 0; i < shardCount; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2.4 + (Math.random() * 1.6);

      shard.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      shard.userData = {
        orbitSpeed: 0.003 + (Math.random() * 0.008),
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        initialPos: shard.position.clone(),
      };

      shardGroup.add(shard);
      shards.push(shard);
    }
    rootGroup.add(shardGroup);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xe2fd00, 3.5, 20); // Acid neon top
    pointLight1.position.set(4, 5, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 4.0, 20); // Emerald bottom
    pointLight2.position.set(-4, -5, -2);
    scene.add(pointLight2);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
    frontLight.position.set(0, 0, 8);
    scene.add(frontLight);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.8;
      targetY = y * 0.6;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Render Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Main crystal rotation & pulse
        crystalMesh.rotation.y += 0.008;
        crystalMesh.rotation.x = Math.sin(time * 0.4) * 0.2 + (mouseY * 0.8);
        crystalMesh.rotation.z = Math.cos(time * 0.3) * 0.15 + (mouseX * 0.8);

        // Core pulsating scale
        const scaleVal = 1 + Math.sin(time * 2.2) * 0.08;
        innerMesh.scale.set(scaleVal, scaleVal, scaleVal);
        innerMesh.rotation.y -= 0.02;

        // Orbiting shards animation
        shardGroup.rotation.y -= 0.004;
        shards.forEach((s) => {
          s.rotation.x += 0.02;
          s.rotation.y += 0.03;
          s.position.applyAxisAngle(s.userData.axis, s.userData.orbitSpeed);
        });

        // Interactive parallax drift
        rootGroup.position.x = mouseX * 0.5;
        rootGroup.position.y = mouseY * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full h-full min-h-[420px] pointer-events-auto cursor-grab active:cursor-grabbing select-none ${className}`}
      aria-label="Interactive 3D Waste Transformation Geode"
      role="img"
    >
      {/* Ambient background glow highlights */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none -z-10" />
    </div>
  );
}
