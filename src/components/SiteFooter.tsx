import ReactBitsLogo from './ReactBitsLogo';
import './SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-content footer-content--centered">
        <div className="footer-left footer-left--centered">
          <div className="footer-logo-wrap" aria-label="Liutongxue logo">
            <ReactBitsLogo />
          </div>
          <p className="footer-description">
            Built with <span className="footer-heart">♥</span> — inspired by React Bits and davidhdev
          </p>
          <p className="footer-copyright">© {new Date().getFullYear()} Liutongxue</p>
        </div>
      </div>
    </footer>
  );
}
