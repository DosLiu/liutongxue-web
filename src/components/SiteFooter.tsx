import ReactBitsLogo from './ReactBitsLogo';
import { sitePaths } from '../site';
import './SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo-wrap" aria-label="Liutongxue logo">
            <ReactBitsLogo />
          </div>
          <p className="footer-description">
            Built with <span className="footer-heart">♥</span> — GPT5.4 · Opus5.5 · Gemini4
          </p>
          <a className="footer-link" href={sitePaths.resumeSite} target="_blank" rel="noopener noreferrer">
            简历网站 ↗
          </a>
          <p className="footer-copyright">© {new Date().getFullYear()} Liutongxue</p>
        </div>
      </div>
    </footer>
  );
}
