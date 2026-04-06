import ReactBitsLogo from './ReactBitsLogo';
import { sitePaths } from '../site';
import './SiteFooter.css';

const footerLinks: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Vue Bits', href: 'https://vue-bits.dev/', external: true },
  { label: 'GitHub', href: 'https://github.com/DosLiu/liutongxue-web', external: true },
  { label: 'Docs', href: sitePaths.toolsPage },
  { label: 'Showcase', href: `${sitePaths.home}#testimonials` }
];

export default function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo-wrap" aria-label="Liutongxue logo">
            <ReactBitsLogo />
          </div>
          <p className="footer-description">
            Built with <span className="footer-heart">♥</span> — inspired by React Bits and davidhdev
          </p>
          <p className="footer-copyright">© {new Date().getFullYear()} Liutongxue</p>
        </div>

        <div className="footer-links">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="footer-link"
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
