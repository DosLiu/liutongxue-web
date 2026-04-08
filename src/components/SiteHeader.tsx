import { Lock } from 'lucide-react';
import { forwardRef } from 'react';
import ReactBitsLogo from './ReactBitsLogo';
import { siteNavItems, sitePaths, type SiteNavKey } from '../site';

type SiteHeaderProps = {
  activeKey: SiteNavKey;
};

const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({ activeKey }, ref) {
  return (
    <header ref={ref} className="header">
      <div className="header-container">
        <a href={sitePaths.home} className="logo" aria-label="Liutongxue home">
          <ReactBitsLogo />
        </a>

        <nav className="landing-nav-items" aria-label="Primary">
          {siteNavItems.map((item) => {
            const isActive = item.key === activeKey;

            if (item.key === 'contact') {
              return (
                <span key={item.label} className="nav-link nav-link--disabled" aria-disabled="true">
                  <span>{item.label}</span>
                  <span className="nav-link__meta">（开发中）</span>
                  <Lock className="nav-link__icon" aria-hidden="true" size={12} strokeWidth={2.1} />
                </span>
              );
            }

            return (
              <a key={item.label} href={item.href} className={`nav-link${isActive ? ' active-link' : ''}`}>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
});

export default SiteHeader;
