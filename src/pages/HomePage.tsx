import { useEffect, useRef, useState, type CSSProperties } from 'react';
import heroImage from '../assets/hero.webp';
import FeatureCardsSection from '../components/FeatureCardsSection';
import PlasmaWave from '../components/PlasmaWave';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import StartBuildingSection from '../components/StartBuildingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ToolsSection from '../components/ToolsSection';

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DEFAULT_HERO_TARGET_CENTER_RATIO = 0.25;
const getViewportHeight = (viewport: VisualViewport | null) =>
  Math.max(
    1,
    Math.round(
      Math.min(
        ...[viewport?.height, window.innerHeight, document.documentElement.clientHeight].filter(
          (value): value is number => typeof value === 'number' && value > 0
        )
      )
    )
  );
const getHeroTargetCenterRatio = (root: HTMLElement) =>
  parseFloat(window.getComputedStyle(root).getPropertyValue('--hero-target-center-ratio')) ||
  DEFAULT_HERO_TARGET_CENTER_RATIO;
const subtitleText = '记录每一次灵感碰撞交响，见证数字生命的无限成长';
const subtitleChars = Array.from(subtitleText);
const subtitleLeadingChars = subtitleChars.slice(0, 2);
const subtitleAnimatedChars = subtitleChars.slice(2);

export default function HomePage() {
  const headerRef = useRef<HTMLElement | null>(null);
  const landingContentRef = useRef<HTMLDivElement | null>(null);
  const heroMainContentRef = useRef<HTMLDivElement | null>(null);
  const [isSubtitleAnimated, setIsSubtitleAnimated] = useState(false);

  useEffect(() => {
    let firstFrameId: number | null = null;
    let secondFrameId: number | null = null;

    firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        setIsSubtitleAnimated(true);
      });
    });

    return () => {
      if (firstFrameId !== null) window.cancelAnimationFrame(firstFrameId);
      if (secondFrameId !== null) window.cancelAnimationFrame(secondFrameId);
    };
  }, []);

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

      const viewportHeight = getViewportHeight(viewport);
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
      const heroTargetCenterRatio = getHeroTargetCenterRatio(root);
      const desiredCenterY = clampNumber(
        shellHeight * heroTargetCenterRatio,
        minCenterY,
        Math.max(minCenterY, maxCenterY)
      );
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
      <SiteHeader ref={headerRef} activeKey="home" />

      <main>
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

              <p
                className={`landing-subtitle${isSubtitleAnimated ? ' landing-subtitle-ready' : ''}`}
                aria-label={subtitleText}
              >
                <span className="landing-subtitle-leading" aria-hidden="true">
                  {subtitleLeadingChars.map((char, index) => (
                    <span key={`subtitle-leading-${index}`} className="landing-subtitle-leading-char">
                      {char}
                    </span>
                  ))}
                </span>
                <span className="landing-subtitle-animated" aria-hidden="true">
                  {subtitleAnimatedChars.map((char, index) => (
                    <span
                      key={`subtitle-char-${index + 2}`}
                      className="landing-subtitle-char"
                      style={{ '--subtitle-char-delay': `${(index * 0.3).toFixed(1)}s` } as CSSProperties}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </p>
            </div>
          </div>
        </section>

        <ToolsSection id="tools" />
        <TestimonialsSection />
        <FeatureCardsSection />
        <StartBuildingSection />
        <SiteFooter />
      </main>
    </>
  );
}
