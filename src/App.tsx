import { useEffect, useRef } from 'react';
import heroImage from './assets/hero.webp';
import PlasmaWave from './components/PlasmaWave';
import ReactBitsLogo from './components/ReactBitsLogo';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'Docs', href: 'https://reactbits.dev/get-started/introduction' },
  { label: 'Showcase', href: 'https://reactbits.dev/showcase' },
  { label: 'Tools', href: 'https://reactbits.dev/tools' }
];

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const interpolateStops = (value: number, stops: Array<[number, number]>) => {
  if (stops.length === 0) return 0;
  if (value <= stops[0][0]) return stops[0][1];

  for (let index = 1; index < stops.length; index += 1) {
    const [maxInput, maxOutput] = stops[index];

    if (value <= maxInput) {
      const [minInput, minOutput] = stops[index - 1];
      const progress = (value - minInput) / (maxInput - minInput);
      return minOutput + (maxOutput - minOutput) * progress;
    }
  }

  return stops[stops.length - 1][1];
};

const getHeroTargetCenterRatio = (viewportWidth: number, shellHeight: number) => {
  const widthRatio = interpolateStops(viewportWidth, [
    [320, 0.38],
    [375, 0.345],
    [430, 0.334],
    [768, 0.3],
    [1024, 0.278],
    [1440, 0.258],
    [1920, 0.24]
  ]);
  const heightDelta = interpolateStops(shellHeight, [
    [480, 0.006],
    [560, 0.003],
    [720, 0],
    [900, -0.004],
    [1100, -0.006]
  ]);

  return clampNumber(widthRatio + heightDelta, 0.24, 0.38);
};

export default function App() {
  const headerRef = useRef<HTMLElement | null>(null);
  const landingContentRef = useRef<HTMLDivElement | null>(null);
  const heroMainContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const header = headerRef.current;
    const landingContent = landingContentRef.current;
    const heroMainContent = heroMainContentRef.current;

    if (!header) return;

    let frameId: number | null = null;
    const viewport = window.visualViewport;

    const applyViewportMetrics = () => {
      frameId = null;

      const viewportHeight = Math.max(
        1,
        Math.round(
          Math.min(
            ...[viewport?.height, window.innerHeight, document.documentElement.clientHeight].filter(
              (value): value is number => typeof value === 'number' && value > 0
            )
          )
        )
      );
      const viewportWidth = Math.max(
        320,
        Math.round(
          Math.min(
            ...[viewport?.width, window.innerWidth, document.documentElement.clientWidth].filter(
              (value): value is number => typeof value === 'number' && value > 0
            )
          )
        )
      );
      const headerHeight = Math.max(0, Math.round(header.getBoundingClientRect().height));
      const shellHeight = Math.max(0, viewportHeight - headerHeight);

      root.style.setProperty('--hero-viewport-height', `${viewportHeight}px`);
      root.style.setProperty('--hero-header-height', `${headerHeight}px`);
      root.style.setProperty('--hero-shell-height', `${shellHeight}px`);

      if (!landingContent || !heroMainContent) return;

      const landingContentStyles = window.getComputedStyle(landingContent);
      const paddingTop = parseFloat(landingContentStyles.paddingTop) || 0;
      const paddingBottom = parseFloat(landingContentStyles.paddingBottom) || 0;
      const contentHeight = Math.max(0, shellHeight - paddingTop - paddingBottom);
      const heroHeight = Math.max(0, heroMainContent.getBoundingClientRect().height);
      const currentCenterY = paddingTop + contentHeight / 2;
      const minCenterY = paddingTop + heroHeight / 2;
      const maxCenterY = shellHeight - paddingBottom - heroHeight / 2;
      const targetCenterRatio = getHeroTargetCenterRatio(viewportWidth, shellHeight);
      const desiredCenterY = clampNumber(shellHeight * targetCenterRatio, minCenterY, Math.max(minCenterY, maxCenterY));
      const shiftY = Math.round((desiredCenterY - currentCenterY) * 10) / 10;

      root.style.setProperty('--hero-copy-shift-y', `${shiftY}px`);
    };

    const queueViewportMetrics = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(applyViewportMetrics);
    };

    const resizeObserver = new ResizeObserver(queueViewportMetrics);
    resizeObserver.observe(header);
    if (landingContent) resizeObserver.observe(landingContent);
    if (heroMainContent) resizeObserver.observe(heroMainContent);

    queueViewportMetrics();
    void document.fonts?.ready.then(queueViewportMetrics);
    window.addEventListener('load', queueViewportMetrics);
    window.addEventListener('pageshow', queueViewportMetrics);
    window.addEventListener('resize', queueViewportMetrics);
    window.addEventListener('orientationchange', queueViewportMetrics);
    viewport?.addEventListener('resize', queueViewportMetrics);
    viewport?.addEventListener('scroll', queueViewportMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', queueViewportMetrics);
      window.removeEventListener('pageshow', queueViewportMetrics);
      window.removeEventListener('resize', queueViewportMetrics);
      window.removeEventListener('orientationchange', queueViewportMetrics);
      viewport?.removeEventListener('resize', queueViewportMetrics);
      viewport?.removeEventListener('scroll', queueViewportMetrics);

      if (frameId !== null) window.cancelAnimationFrame(frameId);

      root.style.removeProperty('--hero-viewport-height');
      root.style.removeProperty('--hero-header-height');
      root.style.removeProperty('--hero-shell-height');
      root.style.removeProperty('--hero-copy-shift-y');
    };
  }, []);

  return (
    <>
      <header ref={headerRef} className="header">
        <div className="header-container">
          <a href="#" className="logo" aria-label="Liutongxue home">
            <ReactBitsLogo />
          </a>

          <nav className="landing-nav-items" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.label}
                className={`nav-link${item.active ? ' active-link' : ''}`}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="landing-wrapper">
        <div className="mobile-hero-background-container">
          <img src={heroImage} alt="Liutongxue hero background" className="mobile-hero-background-image" />
        </div>

        <PlasmaWave />

        <div ref={landingContentRef} className="landing-content">
          <div className="landing-gradient-blur" aria-hidden="true" />

          <div ref={heroMainContentRef} className="hero-main-content">
            <h1 className="landing-title">
              <span className="hero-text-animate hero-title-line">一个持续进化中的 AI</span>
            </h1>

            <p className="landing-subtitle hero-text-animate hero-subtitle-delay">
              记录每一次灵感碰撞，见证数字生命的无限成长
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
