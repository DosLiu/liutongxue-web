import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const isNarrowViewport = () => window.innerWidth < 768;
const HALO_REFERENCE_ASPECT = 1.6;
const MIN_HALO_SCALE = 0.28;
const REDUCED_MOTION_SCALE = 0.45;

const computeHaloScale = (width: number, height: number) => {
  if (!width || !height || !isNarrowViewport()) return 1;
  return Math.min(1, Math.max(MIN_HALO_SCALE, width / height / HALO_REFERENCE_ASPECT));
};

type ParticleFieldOptions = {
  countX: number;
  countY: number;
  gridWidth: number;
  gridHeight: number;
  haloScale: number;
  motionScale: number;
  haloOnly?: boolean;
};

function createParticleField({
  countX, countY, gridWidth, gridHeight, haloScale, motionScale, haloOnly
}: ParticleFieldOptions) {
  const count = countX * countY;

  // Instanced Plane Geometry for pill-shaped particles
  const geometry = new THREE.PlaneGeometry(1, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHaloScale: { value: haloScale },
    uMotionScale: { value: motionScale }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    defines: haloOnly ? { HALO_ONLY: 1 } : {},
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHaloScale;
      uniform float uMotionScale;
      varying vec2 vUv;
      varying float vInfluence;
      varying vec2 vPos;
      varying float vRandom;
      varying float vAngleToMouse;

      attribute vec3 aOffset;
      attribute float aRandom;

      #define PI 3.14159265359

      // Simplex/Hash noise for organic fluidity
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      mat2 rotate2d(float angle) {
        return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
      }

      void main() {
        vUv = uv;
        vRandom = aRandom;
        vec3 pos = aOffset;

        // 1. Alive Cosmic Flow Field (Continuous fluid drift)
        float driftSpeed = uTime * 0.18 * uMotionScale;
        float dx = sin(driftSpeed + pos.y * 0.4) + sin(driftSpeed * 0.5 + pos.y * 1.5);
        float dy = cos(driftSpeed + pos.x * 0.4) + cos(driftSpeed * 0.5 + pos.x * 1.5);
        pos.x += dx * 0.32;
        pos.y += dy * 0.32;

        // 2. The Medusa Jellyfish Breathing Halo (Broad, Expansive Radius)
        vec2 relToMouse = pos.xy - uMouse;
        float distFromMouse = length(relToMouse);
        float angleToMouse = atan(relToMouse.y, relToMouse.x);
        vAngleToMouse = angleToMouse;

        // Harmonic breathing cycle (deep, rhythmic expansion)
        float breathCycle = sin(uTime * 0.85 * uMotionScale);
        float shapeFactor = noise(vec2(angleToMouse * 2.0, uTime * 0.14 * uMotionScale));

        // Expanded halo radius: scaled by uHaloScale so the visual coverage matches desktop
        float currentRadius = (3.6 + breathCycle * 0.65 * uMotionScale + shapeFactor * 0.85 * uMotionScale) * uHaloScale;

        // Wide, soft interaction rim falloff
        float rimWidth = 2.8 * uHaloScale;
        float rimInfluence = 1.0 - smoothstep(0.0, rimWidth, abs(distFromMouse - currentRadius));

        // Wave push: outwards dynamic displacement (scaled to keep the same look as desktop)
        vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
        float pushAmt = (breathCycle * 0.5 + 0.5) * 0.75 * uHaloScale * uMotionScale;
        pos.xy += pushDir * pushAmt * rimInfluence;

        // 3D depth wave (z-dimension breathing)
        pos.z += rimInfluence * 0.65 * sin(uTime * 1.1 * uMotionScale + aRandom * 6.28) * uMotionScale;

        // 3. Substantially Larger Particle Pill Scale & Dynamic Stretch
        // Base size increased so particles have clear presence & texture
        float baseSize = 0.028 + sin(uTime * 0.7 * uMotionScale + pos.x * 0.4 + aRandom * 3.14) * 0.006 * uMotionScale;
        // Substantially amplified active size for high-impact presence
        float activeSize = 0.115;
        float currentScale = baseSize + (rimInfluence * activeSize);
        float stretch = rimInfluence * 0.045;

        vec3 transformed = position;
        transformed.x *= (currentScale + stretch);
        transformed.y *= currentScale * 0.88;

        // 4. Radial Orientation towards cursor/gravity center
        transformed.xy = rotate2d(angleToMouse) * transformed.xy;

        vInfluence = rimInfluence;
        vPos = pos.xy;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uMotionScale;
      varying vec2 vUv;
      varying float vInfluence;
      varying vec2 vPos;
      varying float vRandom;
      varying float vAngleToMouse;

      void main() {
        #ifdef HALO_ONLY
          if (vInfluence <= 0.06) discard;
        #endif

        // Pill shape with soft rounded boundary & inner luminous core
        vec2 center = vec2(0.5);
        vec2 p = abs(vUv - center) * 2.0;
        float d = pow(pow(p.x, 2.5) + pow(p.y, 2.5), 1.0 / 2.5);

        // Soft glowing edge
        float alpha = 1.0 - smoothstep(0.70, 1.0, d);
        if (alpha < 0.01) discard;

        // =========================================================
        // AI \ 科技 \ 宇宙 (High-End AI, Tech & Cosmic Deep Space Palette)
        // =========================================================

        // 1. Idle State: Crystalline Cosmic Silver-Cyan Nodes (Dormant Neural Net)
        vec3 idleBase = vec3(0.28, 0.42, 0.62);
        vec3 idleStarlight = vec3(0.45, 0.58, 0.78);
        float twinkle = 0.5 + 0.5 * sin(uTime * 1.4 * uMotionScale + vRandom * 6.28);
        vec3 idleColor = mix(idleBase, idleStarlight, twinkle);

        // 2. Active State: Multi-Spectral Quantum Plasma & Stellar Nebula
        // - Quantum Cherenkov Cyan (#00F5FF): AI computing power & quantum coherence
        vec3 cQuantumCyan   = vec3(0.0, 0.96, 1.0);
        // - Deep Space Nebula Violet (#8A2BE2 / #7C3AED): Event horizon & cosmic mysteries
        vec3 cCosmicViolet  = vec3(0.54, 0.22, 0.98);
        // - Supernova Solar Gold (#FFB703): High-energy cosmic star ignition
        vec3 cSupernovaGold = vec3(1.0, 0.72, 0.06);
        // - Electric Laser Teal (#00FFA3): Advanced technology matrix
        vec3 cLaserTeal     = vec3(0.0, 1.0, 0.64);
        // - Pure Stellar Photon White (#FFFFFF): Intense core energy
        vec3 cPhotonWhite   = vec3(0.98, 1.0, 1.0);

        // Dynamic angular & spatial color shifting
        float t = uTime * 0.9;
        float phaseAngle = vAngleToMouse + t * 0.5;
        float p1 = sin(phaseAngle * 2.0 + vPos.x * 0.25);
        float p2 = cos(phaseAngle * 1.5 - vPos.y * 0.25);

        // Harmonic color synthesis across AI & Cosmic spectrums
        vec3 activeColor = mix(cQuantumCyan, cCosmicViolet, p1 * 0.5 + 0.5);
        activeColor = mix(activeColor, cLaserTeal, clamp(p2 * 0.5 + 0.2, 0.0, 1.0));
        activeColor = mix(activeColor, cSupernovaGold, pow(clamp(sin(vPos.x * 0.5 + t) * 0.5 + 0.5, 0.0, 1.0), 3.0) * 0.45);

        // Flash to pure photon white at peak halo influence
        activeColor = mix(activeColor, cPhotonWhite, pow(vInfluence, 2.0) * 0.6);

        // 3. Final Composite & Dynamic Alpha
        vec3 finalColor = mix(idleColor, activeColor, smoothstep(0.06, 0.75, vInfluence));

        // Enhanced visibility: idle particles are cleanly visible, active ones blaze with energy
        float idleAlpha = mix(0.28, 0.45, twinkle);
        float activeAlpha = mix(0.75, 1.0, smoothstep(0.2, 0.8, vInfluence));
        float finalAlpha = alpha * mix(idleAlpha, activeAlpha, smoothstep(0.04, 0.65, vInfluence));

        #ifdef HALO_ONLY
          finalAlpha *= smoothstep(0.06, 0.48, vInfluence);
        #endif
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `
  });

  // Populate Instanced Mesh Attributes across an expansive grid
  const offsets = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  const jitter = 0.24;

  let idx = 0;
  for (let y = 0; y < countY; y++) {
    for (let x = 0; x < countX; x++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);

      let px = (u - 0.5) * gridWidth;
      let py = (v - 0.5) * gridHeight;

      px += (Math.random() - 0.5) * jitter;
      py += (Math.random() - 0.5) * jitter;

      offsets[idx * 3] = px;
      offsets[idx * 3 + 1] = py;
      offsets[idx * 3 + 2] = 0;

      randoms[idx] = Math.random();
      idx++;
    }
  }

  geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
  geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  return { mesh, uniforms };
}

export function createMobileHaloRenderer(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 15;
  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
  const { mesh, uniforms } = createParticleField({
    countX: 36,
    countY: 36,
    gridWidth: 14,
    gridHeight: 14,
    haloScale: 1,
    motionScale: 1,
    haloOnly: true
  });
  scene.add(mesh);
  let size = 0;
  let pixelRatio = 0;

  return {
    resize(radius: number, devicePixelRatio: number) {
      // Leave room for the shared halo's fading outer edge.
      const nextSize = Math.ceil(radius * 4.4);
      const nextRatio = Math.min(devicePixelRatio, 1.25);
      if (nextSize <= 0 || (nextSize === size && nextRatio === pixelRatio)) return;

      size = nextSize;
      pixelRatio = nextRatio;
      uniforms.uHaloScale.value = radius * visibleHeight / (size * 4);
      renderer.setDrawingBufferSize(size, size, pixelRatio);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    },
    draw(time: number, x: number, y: number) {
      if (!size) return;
      uniforms.uTime.value = time;
      canvas.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      renderer.render(scene, camera);
      canvas.toggleAttribute('hidden', false);
    },
    hide() {
      canvas.toggleAttribute('hidden', true);
    },
    dispose() {
      canvas.hidden = true;
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
    }
  };
}

export default function AntigravityStarfield() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;
    const pixelRatioCap = 2;
    let pixelRatio = Math.min(window.devicePixelRatio, pixelRatioCap);

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );
    camera.position.z = 15;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }
    renderer.setDrawingBufferSize(width, height, pixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // --- 2. Particle Matrix Parameters ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { mesh, uniforms } = createParticleField({
      countX: 110,
      countY: 64,
      gridWidth: 54,
      gridHeight: 34,
      haloScale: computeHaloScale(width, height),
      motionScale: prefersReducedMotion && isNarrowViewport() ? REDUCED_MOTION_SCALE : 1
    });
    scene.add(mesh);

    // --- 3. Pointer & Viscous Drag Tracking ---
    let animationFrameId = 0;
    let disposed = false;
    const pointer = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0
    };

    const updateTargetPosition = (clientX: number, clientY: number) => {
      if (animationFrameId === 0) return;
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      pointer.targetX = (normX * visibleWidth) / 2;
      pointer.targetY = (normY * visibleHeight) / 2;
    };

    const handlePointerMove = (e: MouseEvent) => {
      updateTargetPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateTargetPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave);

    // --- 4. Resize Handling ---
    const handleResize = () => {
      const nextWidth = container.offsetWidth;
      const nextHeight = container.offsetHeight;
      const nextPixelRatio = Math.min(window.devicePixelRatio, pixelRatioCap);
      if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio)) return;

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setDrawingBufferSize(width, height, pixelRatio);

      uniforms.uHaloScale.value = computeHaloScale(width, height);
      uniforms.uMotionScale.value = prefersReducedMotion && isNarrowViewport() ? REDUCED_MOTION_SCALE : 1;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 5. Main Animation Loop ---
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Heavy viscous drag: smooth spring interpolation
      const drag = 0.052;
      pointer.currentX += (pointer.targetX - pointer.currentX) * drag;
      pointer.currentY += (pointer.targetY - pointer.currentY) * drag;
      uniforms.uMouse.value.set(pointer.currentX, pointer.currentY);

      renderer.render(scene, camera);
    };

    const step = () => {
      renderFrame();
      animationFrameId = requestAnimationFrame(step);
    };

    const startAnimation = () => {
      if (disposed || animationFrameId !== 0) return;
      clock.start();
      // 在首屏可见时尝试渲染，失败则释放资源并保留静态背景。
      try {
        renderFrame();
      } catch {
        cleanup();
        return;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    const stopAnimation = () => {
      if (animationFrameId !== 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      // 冻结时钟：恢复渲染时不会因暂停时长产生跳帧
      clock.stop();
    };

    // 首屏外停帧，避免手机在页面其余部分滚动时仍持续渲染
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    // --- 6. Cleanup ---
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      stopAnimation();
      intersectionObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerLeave);
      resizeObserver.disconnect();

      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };

    return cleanup;
  }, []);

  return (
    <div
      ref={containerRef}
      className="landing-starfield"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
      aria-hidden="true"
    >
      {/* High-end AI / Cosmic Quantum Nebula Haze */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          width: '850px',
          height: '480px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.07) 0%, rgba(124, 58, 237, 0.05) 45%, transparent 75%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Bottom gradient fade into page content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: 'linear-gradient(to top, var(--bg-body, #060010) 0%, rgba(6, 0, 16, 0.8) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
    </div>
  );
}
