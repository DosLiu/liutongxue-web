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

export default function App() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const header = headerRef.current;

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
      const headerHeight = Math.max(0, Math.round(header.getBoundingClientRect().height));
      const shellHeight = Math.max(0, viewportHeight - headerHeight);

      root.style.setProperty('--hero-viewport-height', `${viewportHeight}px`);
      root.style.setProperty('--hero-header-height', `${headerHeight}px`);
      root.style.setProperty('--hero-shell-height', `${shellHeight}px`);
    };

    const queueViewportMetrics = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(applyViewportMetrics);
    };

    const resizeObserver = new ResizeObserver(queueViewportMetrics);
    resizeObserver.observe(header);

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

        <div className="landing-content">
          <div className="landing-gradient-blur" aria-hidden="true" />

          <div className="hero-main-content">
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
