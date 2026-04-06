import ReactBitsLogo from './ReactBitsLogo';
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
            Built with <span className="footer-heart">♥</span> — GPT5.4
          </p>
          <p className="footer-copyright">© {new Date().getFullYear()} Liutongxue</p>
        </div>
      </div>
    </footer>
  );
}
