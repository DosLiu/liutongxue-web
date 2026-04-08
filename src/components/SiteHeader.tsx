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

            return (
              <a
                key={item.label}
                href={item.href}
                className={`nav-link${isActive ? ' active-link' : ''}${item.key === 'contact' ? ' nav-link--stacked' : ''}`}
              >
                <span>{item.label}</span>
                {item.key === 'contact' ? <span className="nav-link__meta">开发中</span> : null}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
});

export default SiteHeader;
