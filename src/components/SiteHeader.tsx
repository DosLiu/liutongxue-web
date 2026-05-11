import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import ReactBitsLogo from './ReactBitsLogo';
import { siteNavItems, sitePaths, type SiteNavKey } from '../site';

type SiteHeaderActiveKey = SiteNavKey | 'figures' | null;

type SiteHeaderProps = {
  activeKey?: SiteHeaderActiveKey;
};

const reservedNavTargets = {
  contact: sitePaths.figures
} satisfies Partial<Record<SiteNavKey, string>>;

const mobileNavItems = [
  {
    label: '首页',
    key: 'home',
    href: sitePaths.home
  },
  {
    label: '案发现场',
    key: 'scene',
    href: sitePaths.scene
  },
  {
    label: '具身AI',
    key: 'contact',
    href: reservedNavTargets.contact
  }
] as const;

const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({ activeKey }, ref) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavId = useId();
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!mobileNavRef.current?.contains(target)) {
        setIsMobileNavOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileNavOpen]);

  return (
    <header ref={ref} className={`header${isMobileNavOpen ? ' header--mobile-nav-open' : ''}`}>
      <div className="header-container">
        <a href={sitePaths.home} className="logo" aria-label="Liutongxue home">
          <ReactBitsLogo />
        </a>

        <nav className="landing-nav-items" aria-label="Primary">
          {siteNavItems.map((item) => {
            const isActive = activeKey != null && item.key === activeKey;
            const href = item.key === 'contact' ? reservedNavTargets.contact : item.href;

            return (
              <a key={item.label} href={href} className={`nav-link${isActive ? ' active-link' : ''}`}>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div ref={mobileNavRef} className="mobile-nav-shell">
          <button
            type="button"
            className={`mobile-nav-toggle${isMobileNavOpen ? ' is-open' : ''}`}
            aria-expanded={isMobileNavOpen}
            aria-controls={mobileNavId}
            aria-label={isMobileNavOpen ? '关闭主导航' : '打开主导航'}
            onClick={() => setIsMobileNavOpen((current) => !current)}
          >
            <span className="mobile-nav-toggle__label">导航</span>
            <span className="mobile-nav-toggle__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div
            id={mobileNavId}
            className={`mobile-nav-panel${isMobileNavOpen ? ' is-open' : ''}`}
            aria-label="移动端主导航"
            aria-hidden={!isMobileNavOpen}
          >
            <div className="mobile-nav-panel__inner">
              {mobileNavItems.map((item) => {
                const isActive = activeKey != null && item.key === activeKey;

                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`mobile-nav-link${isActive ? ' active-link' : ''}`}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <span className="mobile-nav-link__label">{item.label}</span>
                    <span className="mobile-nav-link__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default SiteHeader;
