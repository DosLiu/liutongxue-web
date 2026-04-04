import { useEffect, useState } from 'react';
import heroImage from './assets/hero.webp';
import PlasmaWave from './components/PlasmaWave';
import ReactBitsLogo from './components/ReactBitsLogo';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'Docs', href: 'https://reactbits.dev/get-started/introduction' },
  { label: 'Showcase', href: 'https://reactbits.dev/showcase' },
  { label: 'Tools', href: 'https://reactbits.dev/tools' }
];

const starRepoApi = 'https://api.github.com/repos/DavidHDev/react-bits';
const defaultStars = '33200';

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M5 19c1.6-.3 3.1-1.1 4.2-2.2l5.6-5.6c1.7-1.7 2.8-3.8 3.1-6.2l.1-1-1 .1c-2.4.3-4.5 1.4-6.2 3.1L5.2 12.8C4.1 13.9 3.3 15.4 3 17l2 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 15.5 6 18m7-10a1.6 1.6 0 1 0 3.2 0A1.6 1.6 0 0 0 13 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.9 4.6L18.5 9 13.9 10.9 12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3Zm6.2 11.2.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2ZM5.2 13.8l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1 1.1-2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="m8 1.2 1.97 3.98 4.4.64-3.19 3.1.75 4.38L8 11.22 4.07 13.3l.75-4.38-3.19-3.1 4.4-.64L8 1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BadgeArrow() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M4 8h8M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [stars, setStars] = useState(defaultStars);

  useEffect(() => {
    let cancelled = false;

    const loadStars = async () => {
      try {
        const response = await fetch(starRepoApi, {
          headers: {
            Accept: 'application/vnd.github+json'
          }
        });

        if (!response.ok) return;
        const data = (await response.json()) as { stargazers_count?: number };
        if (!cancelled && typeof data.stargazers_count === 'number') {
          setStars(String(data.stargazers_count));
        }
      } catch {
        // keep fallback count
      }
    };

    loadStars();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <a
        href="https://pro.reactbits.dev"
        target="_blank"
        rel="noreferrer"
        className="header-announcement-bar landing-bar"
      >
        <div className="header-announcement-content">
          <div className="header-announcement-inner">
            <RocketIcon />
            <span className="header-announcement-message">
              Get React Bits Pro - 85+ components, 100+ UI blocks, 5 full templates - click here!
            </span>
          </div>
        </div>
      </a>

      <header className="header">
        <div className="header-container">
          <a href="#" className="logo" aria-label="React Bits home">
            <ReactBitsLogo />
          </a>

          <div className="nav-cta-group">
            <nav className="landing-nav-items" aria-label="Primary">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  className={`nav-link${item.active ? ' active-link' : ''}`}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a href="https://github.com/DavidHDev/react-bits" target="_blank" rel="noreferrer" className="cta-button">
              Star On GitHub
              <span>
                <StarIcon />
                {stars}
              </span>
            </a>
          </div>
        </div>
      </header>

      <section className="landing-wrapper">
        <div className="mobile-hero-background-container">
          <img src={heroImage} alt="React Bits hero background" className="mobile-hero-background-image" />
        </div>

        <PlasmaWave />

        <div className="landing-content">
          <div className="landing-gradient-blur" aria-hidden="true" />

          <div className="hero-main-content">
            <div className="hero-tag-fade">
              <a
                href="https://reactbits.dev/components/border-glow"
                target="_blank"
                rel="noreferrer"
                className="hero-new-badge-container"
              >
                <span className="hero-new-badge">
                  New <SparklesIcon />
                </span>
                <span className="hero-new-badge-text">
                  <span>Border Glow</span>
                  <BadgeArrow />
                </span>
              </a>
            </div>

            <h1 className="landing-title">
              <span className="hero-text-animate">React Components</span>
              <br />
              <span className="hero-text-animate hero-text-animate-delay">For Creative Developers</span>
            </h1>

            <p className="landing-subtitle hero-text-animate hero-subtitle-delay">
              Highly customizable animated components that make your React projects truly stand out
            </p>

            <div className="hero-text-animate hero-button-delay">
              <a
                href="https://reactbits.dev/get-started/installation"
                target="_blank"
                rel="noreferrer"
                className="landing-button"
              >
                <span>Browse Components</span>
                <div className="button-arrow-circle">
                  <ArrowRightIcon />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
