import { useEffect, useRef, useState } from 'react';
import { Camera, Geometry, Mesh, Program, Renderer, Transform } from 'ogl';

const vertexShader = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 uOffset;
uniform float uRotation;
uniform float focalLength;
uniform float speed1;
uniform float speed2;
uniform float dir2;
uniform float bend1;
uniform float bend2;
uniform float bendAdj1;
uniform float bendAdj2;
uniform float uOpacity;

const float lt = 0.3;
const float pi = 3.14159;
const float pi2 = 6.28318;
const float pi_2 = 1.5708;
#define MAX_STEPS 14

void mainImage(out vec4 C, in vec2 U) {
  float t = iTime * pi;
  float s = 1.0;
  float d = 0.0;
  vec2 R = iResolution;

  vec3 o = vec3(0.0, 0.0, -7.0);
  vec3 u = normalize(vec3((U - 0.5 * R) / R.y, focalLength));
  vec2 k = vec2(0.0);
  vec3 p;

  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * speed1;
  float tSpeed2 = t * speed2 * dir2;
  float wob1Base = bend1 + bendAdj1;
  float wob2Base = bend2 + bendAdj2;

  for (int i = 0; i < MAX_STEPS; ++i) {
    p = o + u * d;
    p.x -= 15.0;

    float px = p.x;
    float wob1 = wob1Base + sin(t1 + px * 0.8) * 0.1;
    float wob2 = wob2Base + cos(t2 + px * 1.1) * 0.1;

    float px2 = px + pi_2;
    vec2 sinOffset = sin(vec2(px, px2) + tSpeed1) * wob1;
    vec2 cosOffset = cos(vec2(px, px2) + tSpeed2) * wob2;

    vec2 yz = p.yz;
    float pxLt = px + lt;
    k.x = max(pxLt, length(yz - sinOffset) - lt);
    k.y = max(pxLt, length(yz - cosOffset) - lt);

    float current = min(k.x, k.y);
    s = min(s, current);
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }

  float sqrtD = sqrt(d);
  vec3 c = max(cos(d * pi2) - s * sqrtD - vec3(k, 0.0), 0.0);
  c.gb += 0.1;
  float maxC = max(c.r, max(c.g, c.b));
  if (maxC < 0.15) discard;
  c = c * 0.4 + c.brg * 0.6 + c * c;
  C = vec4(c, uOpacity);
}

void main() {
  vec2 coord = gl_FragCoord.xy + uOffset;
  coord -= 0.5 * iResolution;
  float c = cos(uRotation), s = sin(uRotation);
  coord = mat2(c, -s, s, c) * coord;
  coord += 0.5 * iResolution;

  vec4 color;
  mainImage(color, coord);
  gl_FragColor = color;
}
`;

type PlasmaWaveProps = {
  xOffset?: number;
  yOffset?: number;
  rotationDeg?: number;
  focalLength?: number;
  speed1?: number;
  speed2?: number;
  dir2?: number;
  bend1?: number;
  bend2?: number;
  fadeInDuration?: number;
  pauseWhenOffscreen?: boolean;
  rootMargin?: string;
  autoPauseOnScroll?: boolean;
  scrollPauseThreshold?: number | null;
  resumeOnScrollUp?: boolean;
  dynamicDpr?: boolean;
};

type ProgramUniforms = {
  iTime: { value: number };
  iResolution: { value: Float32Array };
  uOffset: { value: Float32Array };
  uRotation: { value: number };
  focalLength: { value: number };
  speed1: { value: number };
  speed2: { value: number };
  dir2: { value: number };
  bend1: { value: number };
  bend2: { value: number };
  bendAdj1: { value: number };
  bendAdj2: { value: number };
  uOpacity: { value: number };
};

type OglContext = {
  canvas: HTMLCanvasElement;
  clearColor: (...args: number[]) => void;
  viewport: (x: number, y: number, width: number, height: number) => void;
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  getExtension: (name: 'WEBGL_lose_context') => { loseContext: () => void } | null;
};

export default function PlasmaWave({
  xOffset = 40,
  yOffset = 0,
  rotationDeg = -45,
  focalLength = 0.8,
  speed1 = 0.05,
  speed2 = 0.05,
  dir2 = 1,
  bend1 = 1,
  bend2 = 0.5,
  fadeInDuration = 2000,
  pauseWhenOffscreen = true,
  rootMargin = '200px',
  autoPauseOnScroll = true,
  scrollPauseThreshold = 400,
  resumeOnScrollUp = false,
  dynamicDpr = false
}: PlasmaWaveProps) {
  const [fallbackActive, setFallbackActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformOffset = useRef(new Float32Array([xOffset, yOffset]));
  const uniformResolution = useRef(new Float32Array([1, 1]));
  const rendererRef = useRef<Renderer | null>(null);
  const fadeStartTime = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const resizeTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const permaPausedRef = useRef(false);
  const startStopApiRef = useRef<{
    start: () => void;
    stop: () => void;
  }>({
    start: () => {},
    stop: () => {}
  });

  const propsRef = useRef({
    xOffset,
    yOffset,
    rotationDeg,
    focalLength,
    speed1,
    speed2,
    dir2,
    bend1,
    bend2,
    fadeInDuration
  });

  propsRef.current = {
    xOffset,
    yOffset,
    rotationDeg,
    focalLength,
    speed1,
    speed2,
    dir2,
    bend1,
    bend2,
    fadeInDuration
  };

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    if (isMobile || fallbackActive) return;

    const createRenderer = () => {
      const commonOptions = {
        alpha: true,
        dpr: 0.5,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance' as const,
        failIfMajorPerformanceCaveat: false
      };

      try {
        return new Renderer(commonOptions);
      } catch {
        try {
          const canvas = document.createElement('canvas');
          const attrs = {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance' as const,
            failIfMajorPerformanceCaveat: false
          };
          const gl =
            canvas.getContext('webgl2', attrs) ??
            canvas.getContext('webgl', attrs) ??
            canvas.getContext('experimental-webgl', attrs);

          if (!gl) return null;
          return new Renderer({ ...commonOptions, gl: gl as never } as never);
        } catch {
          return null;
        }
      }
    };

    const renderer = createRenderer();
    if (!renderer) {
      setFallbackActive(true);
      return;
    }

    rendererRef.current = renderer;

    const gl = renderer.gl as unknown as OglContext;
    gl.clearColor(0, 0, 0, 0);

    const container = containerRef.current;
    if (!container) return;

    container.appendChild(gl.canvas);

    const oglGl = gl as never;
    const camera = new Camera(oglGl);
    const scene = new Transform();

    const geometry = new Geometry(oglGl, {
      position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3])
      }
    });

    const program = new Program(oglGl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: uniformResolution.current },
        uOffset: { value: uniformOffset.current },
        uRotation: { value: 0 },
        focalLength: { value: focalLength },
        speed1: { value: speed1 },
        speed2: { value: speed2 },
        dir2: { value: dir2 },
        bend1: { value: bend1 },
        bend2: { value: bend2 },
        bendAdj1: { value: 0 },
        bendAdj2: { value: 0 },
        uOpacity: { value: 0 }
      } satisfies ProgramUniforms
    });

    new Mesh(oglGl, { geometry, program }).setParent(scene);

    const applySize = () => {
      const element = containerRef.current;
      if (!element) return;

      const { width, height } = element.getBoundingClientRect();
      const realWidth = width * renderer.dpr;
      const realHeight = height * renderer.dpr;

      if (realWidth === uniformResolution.current[0] && realHeight === uniformResolution.current[1]) {
        return;
      }

      renderer.setSize(width, height);
      uniformResolution.current[0] = realWidth;
      uniformResolution.current[1] = realHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    applySize();

    const onResize = () => {
      if (resizeTimeoutRef.current) window.clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        applySize();
        resizeTimeoutRef.current = null;
      }, 150);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    startTimeRef.current = performance.now();

    const renderLoop = (now: number) => {
      const currentProps = propsRef.current;
      const elapsed = (now - startTimeRef.current) * 0.001;

      if (fadeStartTime.current === null && elapsed > 0.1) {
        fadeStartTime.current = now;
      }

      let opacity = 0;
      if (fadeStartTime.current !== null) {
        const fadeElapsed = now - fadeStartTime.current;
        opacity = Math.min(fadeElapsed / currentProps.fadeInDuration, 1);
        opacity = 1 - Math.pow(1 - opacity, 3);
      }

      uniformOffset.current[0] = currentProps.xOffset;
      uniformOffset.current[1] = currentProps.yOffset;
      program.uniforms.iTime.value = elapsed;
      program.uniforms.uRotation.value = (currentProps.rotationDeg * Math.PI) / 180;
      program.uniforms.focalLength.value = currentProps.focalLength;
      program.uniforms.speed1.value = currentProps.speed1;
      program.uniforms.speed2.value = currentProps.speed2;
      program.uniforms.dir2.value = currentProps.dir2;
      program.uniforms.bend1.value = currentProps.bend1;
      program.uniforms.bend2.value = currentProps.bend2;
      program.uniforms.uOpacity.value = opacity;

      renderer.render({ scene, camera });

      if (runningRef.current) {
        rafRef.current = window.requestAnimationFrame(renderLoop);
      }
    };

    const start = () => {
      if (runningRef.current || permaPausedRef.current) return;
      runningRef.current = true;
      startTimeRef.current = performance.now() - program.uniforms.iTime.value * 1000;

      if (dynamicDpr) {
        const targetDpr = Math.min(window.devicePixelRatio, 1);
        if (renderer.dpr !== targetDpr) renderer.dpr = targetDpr;
      }

      renderer.render({ scene, camera });
      rafRef.current = window.requestAnimationFrame(renderLoop);
    };

    const stop = () => {
      runningRef.current = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };

    startStopApiRef.current = { start, stop };
    start();

    if (pauseWhenOffscreen && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting) start();
          else stop();
        },
        { root: null, rootMargin, threshold: 0 }
      );

      observerRef.current.observe(container);
    }

    return () => {
      runningRef.current = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();

      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      if (observerRef.current) {
        observerRef.current.unobserve(container);
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }

      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    autoPauseOnScroll,
    bend1,
    bend2,
    dir2,
    dynamicDpr,
    fallbackActive,
    fadeInDuration,
    focalLength,
    isMobile,
    pauseWhenOffscreen,
    rootMargin,
    rotationDeg,
    speed1,
    speed2,
    xOffset,
    yOffset
  ]);

  useEffect(() => {
    if (isMobile || fallbackActive || !autoPauseOnScroll) return;

    const limit = scrollPauseThreshold ?? Math.round(window.innerHeight * 1.2);

    const onScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;

      if (!permaPausedRef.current && scrollTop > limit) {
        startStopApiRef.current.stop();
        if (!resumeOnScrollUp) {
          permaPausedRef.current = true;
        }
      } else if (resumeOnScrollUp && scrollTop <= limit && !permaPausedRef.current) {
        startStopApiRef.current.start();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [autoPauseOnScroll, fallbackActive, isMobile, resumeOnScrollUp, scrollPauseThreshold]);

  if (isMobile) return null;

  if (fallbackActive) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          background:
            'radial-gradient(1200px 600px at 20% 80%, rgba(123, 31, 162, 0.3), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(33, 150, 243, 0.25), transparent 60%), linear-gradient(180deg, rgba(10, 2, 20, 0.6), rgba(10, 2, 20, 0.8))'
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(to top, #060010, transparent)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        opacity: 0.6,
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        willChange: 'opacity'
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(to top, #060010, transparent)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </div>
  );
}
