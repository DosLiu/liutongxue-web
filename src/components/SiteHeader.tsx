import { forwardRef } from 'react';
import ReactBitsLogo from './ReactBitsLogo';
import { siteNavItems, sitePaths, type SiteNavKey } from '../site';

type SiteHeaderProps = {
  activeKey: SiteNavKey;
};

const isExternalHref = (href: string) => href.startsWith('http') || href.startsWith('mailto:');

const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({ activeKey }, ref) {
  return (
    <header ref={ref} className="header">
      <div className="header-container">
        <a href={sitePaths.home} className="logo" aria-label="Liutongxue home">
          <ReactBitsLogo />
        </a>

        <nav className="landing-nav-items" aria-label="Primary">
          {siteNavItems.map((item) => {
            const isExternal = isExternalHref(item.href);
            const isActive = item.key === activeKey;

            return (
              <a
                key={item.label}
                className={`nav-link${isActive ? ' active-link' : ''}`}
                href={item.href}
                target={isExternal && !item.href.startsWith('mailto:') ? '_blank' : undefined}
                rel={isExternal && !item.href.startsWith('mailto:') ? 'noreferrer' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
});

export default SiteHeader;
