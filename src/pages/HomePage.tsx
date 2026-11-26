import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import FeatureCardsSection from '../components/FeatureCardsSection';
import MobileStarfield from '../components/MobileStarfield';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import StartBuildingSection from '../components/StartBuildingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ToolsSection from '../components/ToolsSection';
import { touchDeviceMediaQuery } from '../device';

const AntigravityStarfield = lazy<() => ReactNode>(() =>
  import('../components/AntigravityStarfield').catch(() => ({ default: () => null }))
);

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DEFAULT_HERO_TARGET_CENTER_RATIO = 0.25;
const MOBILE_HERO_HEIGHT_RATIO = 0.76;
const MOBILE_HERO_MIN_HEIGHT = 500;
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
const subtitlePhrases = ['记录每一次灵感碰撞交响', '见证数字生命的无限成长'];
const mobileSubtitleLines = subtitlePhrases.map((phrase) => Array.from(phrase));
const desktopSubtitleLines = [[...mobileSubtitleLines[0], '，'], mobileSubtitleLines[1]];
const subtitleLeadingCharCount = 2;
const mobileHeroMediaQuery = `(max-width: 480px), ${touchDeviceMediaQuery}`;

export default function HomePage() {
  const headerRef = useRef<HTMLElement | null>(null);
  const landingSectionRef = useRef<HTMLElement | null>(null);
  const landingContentRef = useRef<HTMLDivElement | null>(null);
  const heroMainContentRef = useRef<HTMLDivElement | null>(null);
  const haloAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const [isSubtitleAnimated, setIsSubtitleAnimated] = useState(false);
  const [shouldLoadStarfield, setShouldLoadStarfield] = useState(false);
  const [starfieldMode, setStarfieldMode] = useState<'desktop' | 'mobile' | null>(null);
  const isMobileHero = starfieldMode === 'mobile';
  const subtitleLines = isMobileHero ? mobileSubtitleLines : desktopSubtitleLines;

  useEffect(() => {
    const mobileHero = window.matchMedia(mobileHeroMediaQuery);
    const update = () => {
      setStarfieldMode(mobileHero.matches ? 'mobile' : 'desktop');
    };

    update();
    mobileHero.addEventListener?.('change', update);
    return () => {
      mobileHero.removeEventListener?.('change', update);
    };
  }, []);

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
    const landingSection = landingSectionRef.current;
    const landingContent = landingContentRef.current;
    const heroMainContent = heroMainContentRef.current;

    if (!header || !landingSection || !landingContent || !heroMainContent) return;

    let frameId: number | null = null;
    let isInitialLayout = true;
    let disposed = false;
    const shouldScrollToContact = window.location.hash === '#contact';
    const viewport = window.visualViewport;
    const mobileHero = window.matchMedia(mobileHeroMediaQuery);
    const starfieldObserver = new IntersectionObserver(
      ([entry]) => {
        if (disposed || !entry.isIntersecting) return;
        setShouldLoadStarfield(true);
        starfieldObserver.disconnect();
      },
      { rootMargin: '320px 0px' }
    );

    const applyViewportMetrics = () => {
      frameId = null;

      const viewportHeight = getViewportHeight(viewport);
      const headerHeight = Math.max(0, Math.round(header.getBoundingClientRect().height));
      const viewportShellHeight = Math.max(0, viewportHeight - headerHeight);
      const sectionHeight = mobileHero.matches
        ? Math.min(viewportHeight, Math.max(MOBILE_HERO_MIN_HEIGHT, Math.round(viewportHeight * MOBILE_HERO_HEIGHT_RATIO)))
        : viewportHeight;
      const shellHeight = Math.max(0, sectionHeight - headerHeight);

      root.style.setProperty('--hero-viewport-height', `${viewportHeight}px`);
      root.style.setProperty('--hero-section-height', `${sectionHeight}px`);
      root.style.setProperty('--hero-header-height', `${headerHeight}px`);
      root.style.setProperty('--hero-shell-height', `${shellHeight}px`);

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
        viewportShellHeight * heroTargetCenterRatio,
        minCenterY,
        Math.max(minCenterY, maxCenterY)
      );
      const shiftY = Math.round((desiredCenterY - currentCenterY) * 10) / 10;

      root.style.setProperty('--hero-copy-shift-y', `${shiftY}px`);

      if (mobileHero.matches) {
        const copy = heroMainContent.getBoundingClientRect();
        const section = landingSection.getBoundingClientRect();
        haloAnchorRef.current = {
          x: copy.left - section.left + copy.width / 2,
          y: copy.top - section.top + copy.height / 2
        };
      }

      if (isInitialLayout) {
        isInitialLayout = false;
        // 先完成联系区直链定位，再判断首屏是否需要加载星空。
        if (shouldScrollToContact && window.location.hash === '#contact' && window.scrollY === 0) {
          document.getElementById('contact')?.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
        starfieldObserver.observe(landingSection);
      }
    };

    const queueViewportMetrics = () => {
      if (disposed) return;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(applyViewportMetrics);
    };

    const resizeObserver = new ResizeObserver(queueViewportMetrics);
    resizeObserver.observe(header);
    resizeObserver.observe(landingContent);
    resizeObserver.observe(heroMainContent);

    queueViewportMetrics();
    void document.fonts?.ready.then(queueViewportMetrics);
    window.addEventListener('load', queueViewportMetrics);
    window.addEventListener('pageshow', queueViewportMetrics);
    window.addEventListener('resize', queueViewportMetrics);
    window.addEventListener('orientationchange', queueViewportMetrics);
    mobileHero.addEventListener?.('change', queueViewportMetrics);
    viewport?.addEventListener('resize', queueViewportMetrics);
    viewport?.addEventListener('scroll', queueViewportMetrics);

    return () => {
      disposed = true;
      starfieldObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('load', queueViewportMetrics);
      window.removeEventListener('pageshow', queueViewportMetrics);
      window.removeEventListener('resize', queueViewportMetrics);
      window.removeEventListener('orientationchange', queueViewportMetrics);
      mobileHero.removeEventListener?.('change', queueViewportMetrics);
      viewport?.removeEventListener('resize', queueViewportMetrics);
      viewport?.removeEventListener('scroll', queueViewportMetrics);

      if (frameId !== null) window.cancelAnimationFrame(frameId);

      root.style.removeProperty('--hero-viewport-height');
      root.style.removeProperty('--hero-section-height');
      root.style.removeProperty('--hero-header-height');
      root.style.removeProperty('--hero-shell-height');
      root.style.removeProperty('--hero-copy-shift-y');
    };
  }, []);

  return (
    <>
      <SiteHeader ref={headerRef} activeKey="home" />

      <main>
        <section ref={landingSectionRef} className="landing-wrapper">
          {isSubtitleAnimated && shouldLoadStarfield && starfieldMode && (
            isMobileHero ? <MobileStarfield haloAnchorRef={haloAnchorRef} /> : (
              <Suspense fallback={null}>
                <AntigravityStarfield />
              </Suspense>
            )
          )}

          <div ref={landingContentRef} className="landing-content">
            <div className="landing-gradient-blur" aria-hidden="true" />

            <div ref={heroMainContentRef} className="hero-main-content">
              <h1 className="landing-title">
                <span className="hero-text-animate hero-title-line">
                  一个持续进化中的 <span className="hero-title-ai">AI</span>
                </span>
              </h1>

              <p
                className={`landing-subtitle${isSubtitleAnimated ? ' landing-subtitle-ready' : ''}`}
                aria-label={subtitlePhrases.join(isMobileHero ? ' ' : '，')}
              >
                {subtitleLines.map((line, lineIndex) => (
                  <span className="landing-subtitle-line" aria-hidden="true" key={lineIndex}>
                    {line.map((char, charIndex) => {
                      const index = charIndex + (lineIndex === 0 ? 0 : subtitleLines[0].length);
                      const isLeadingChar = index < subtitleLeadingCharCount;
                      return (
                        <span
                          key={charIndex}
                          className={isLeadingChar ? 'landing-subtitle-leading-char' : 'landing-subtitle-char'}
                          style={isLeadingChar ? undefined : {
                            '--subtitle-char-delay': `${((index - subtitleLeadingCharCount) * 0.3).toFixed(1)}s`
                          } as CSSProperties}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>

        <ToolsSection id="tools" mobile={isMobileHero} />
        <TestimonialsSection />
        <FeatureCardsSection />
        <StartBuildingSection />
        <SiteFooter />
      </main>
    </>
  );
}
