import { useEffect, useRef, type RefObject } from 'react';
import type { createMobileHaloRenderer } from './AntigravityStarfield';

const MAX_STARS = 440;
const STAR_AREA = 980;
const FRAME_INTERVAL_MS = 1000 / 30;
const FULL_CIRCLE = Math.PI * 2;
const STAR_COLORS = ['#eef4ff', '#c4d7ff', '#f5e7d4'];

type HaloContact = { type: 'touch' | 'pointer'; id: number };
type Point = { x: number; y: number };

export default function MobileStarfield({ haloAnchorRef }: { haloAnchorRef: RefObject<Point | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const haloCanvas = haloCanvasRef.current;
    const hero = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !haloCanvas || !hero || !context) return;

    const stars = Array.from({ length: MAX_STARS }, () => {
      const brightness = Math.random() ** 2.4;
      const tint = Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        radius: 0.36 + brightness * 0.77,
        opacity: 0.24 + brightness * 0.66,
        phase: Math.random() * FULL_CIRCLE,
        twinkleSpeed: 0.7 + Math.random() * 1.3,
        driftSpeed: 0.2 + brightness * 0.45,
        color: STAR_COLORS[tint < 0.58 ? 0 : tint < 0.92 ? 1 : 2]
      };
    });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let starCount = 0;
    let pixelRatio = 0;
    let visible = false;
    let frameId = 0;
    let lastFrameTime = 0;
    let elapsed = 0;
    let activeContact: HaloContact | null = null;
    let disposed = false;
    let haloRequested = false;
    let haloRenderer: ReturnType<typeof createMobileHaloRenderer> = null;
    const halo = { x: 0, y: 0 };
    let haloTarget: Point | null = null;
    const shouldAnimate = () => visible && !reducedMotion.matches && !document.hidden;

    const resizeHalo = () => {
      const radius = Math.min(width * 0.29, height * 0.36, 144);
      haloRenderer?.resize(radius, pixelRatio);
    };

    const loadHalo = () => {
      if (haloRequested) return;
      haloRequested = true;
      void import('./AntigravityStarfield').then(({ createMobileHaloRenderer }) => {
        if (disposed) return;
        if (!shouldAnimate()) {
          haloRequested = false;
          return;
        }
        haloRenderer = createMobileHaloRenderer(haloCanvas);
        resizeHalo();
      }).catch(() => {
        haloRequested = false;
      });
    };

    const drawHalo = (frameSeconds: number) => {
      if (!haloRenderer || !shouldAnimate()) return;

      if (haloTarget) {
        const follow = 1 - Math.exp(-12 * frameSeconds);
        const targetX = Math.min(Math.max(haloTarget.x, 0), width);
        const targetY = Math.min(Math.max(haloTarget.y, 0), height);
        halo.x += (targetX - halo.x) * follow;
        halo.y += (targetY - halo.y) * follow;
      } else {
        const center = haloAnchorRef.current;
        if (!center) return;
        halo.x = center.x;
        halo.y = center.y;
      }
      haloRenderer.draw(elapsed, halo.x, halo.y);
    };

    const drawScene = (frameSeconds = 0) => {
      context.clearRect(0, 0, width, height);
      for (let index = 0; index < starCount; index++) {
        const star = stars[index];
        const drift = elapsed * star.driftSpeed;
        const x = (star.x * width + drift) % width;
        const y = (star.y * height + drift * 0.35) % height;
        const twinkle = 0.82 + 0.18 * Math.sin(star.phase + elapsed * star.twinkleSpeed);
        const opacity = star.opacity * twinkle;
        context.fillStyle = star.color;

        if (star.radius > 0.9) {
          context.globalAlpha = opacity * 0.16;
          context.beginPath();
          context.arc(x, y, star.radius * 2, 0, FULL_CIRCLE);
          context.fill();
        }

        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(x, y, star.radius, 0, FULL_CIRCLE);
        context.fill();
      }
      drawHalo(frameSeconds);
    };

    const resize = () => {
      const nextWidth = canvas.clientWidth;
      const nextHeight = canvas.clientHeight;
      const nextPixelRatio = Math.min(window.devicePixelRatio, 1.5);
      if (!nextWidth || !nextHeight) return;
      if (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio) return;

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      starCount = Math.min(MAX_STARS, Math.round(width * height / STAR_AREA));
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      resizeHalo();
      drawScene();
    };

    const animate = (now: number) => {
      if (!shouldAnimate()) {
        syncAnimation();
        return;
      }
      const delta = now - lastFrameTime;
      if (delta >= FRAME_INTERVAL_MS) {
        const frameDuration = delta - delta % FRAME_INTERVAL_MS;
        const frameSeconds = Math.min(frameDuration, 100) / 1000;
        elapsed += frameSeconds;
        lastFrameTime += frameDuration;
        drawScene(frameSeconds);
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      if (shouldAnimate()) {
        loadHalo();
        if (!frameId) {
          lastFrameTime = performance.now();
          frameId = window.requestAnimationFrame(animate);
        }
      } else {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        activeContact = null;
        haloRenderer?.hide();
        if (visible && reducedMotion.matches) drawScene();
      }
    };

    const moveHalo = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect();
      const target = { x: clientX - bounds.left, y: clientY - bounds.top };
      if (!haloTarget) {
        const start = haloAnchorRef.current ?? target;
        halo.x = start.x;
        halo.y = start.y;
      }
      haloTarget = target;
    };

    const startContact = (contact: HaloContact, clientX: number, clientY: number) => {
      if (reducedMotion.matches) return;

      activeContact = contact;
      moveHalo(clientX, clientY);
      loadHalo();
    };

    const releaseContact = () => {
      activeContact = null;
    };

    const isActivePointer = (event: PointerEvent) =>
      activeContact?.type === 'pointer' && activeContact.id === event.pointerId;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
      startContact({ type: 'pointer', id: event.pointerId }, event.clientX, event.clientY);
    };

    const releasePointer = (event: PointerEvent) => {
      if (isActivePointer(event)) releaseContact();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;
      if (event.buttons === 0) {
        releaseContact();
        return;
      }
      moveHalo(event.clientX, event.clientY);
    };

    const findActiveTouch = (event: TouchEvent) => {
      const contact = activeContact;
      if (contact?.type !== 'touch') return;
      return Array.from(event.changedTouches).find((touch) => touch.identifier === contact.id);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.changedTouches[0];
      startContact({ type: 'touch', id: touch.identifier }, touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = findActiveTouch(event);
      if (touch) moveHalo(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (findActiveTouch(event)) releaseContact();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    intersectionObserver.observe(canvas);
    hero.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', releasePointer, { passive: true });
    window.addEventListener('pointercancel', releasePointer, { passive: true });
    // Touch events continue tracking when the browser takes over a drag for scrolling.
    hero.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    reducedMotion.addEventListener?.('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hero.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      hero.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      reducedMotion.removeEventListener?.('change', syncAnimation);
      document.removeEventListener('visibilitychange', syncAnimation);
      window.cancelAnimationFrame(frameId);
      haloRenderer?.dispose();
    };
  }, [haloAnchorRef]);

  return (
    <>
      <canvas ref={canvasRef} className="landing-mobile-starfield" aria-hidden="true" />
      <canvas ref={haloCanvasRef} className="landing-mobile-halo" aria-hidden="true" hidden />
    </>
  );
}
