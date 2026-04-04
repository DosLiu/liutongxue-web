import heroImage from './assets/hero.webp';
import PlasmaWave from './components/PlasmaWave';
import ReactBitsLogo from './components/ReactBitsLogo';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'Docs', href: 'https://reactbits.dev/get-started/introduction' },
  { label: 'Showcase', href: 'https://reactbits.dev/showcase' },
  { label: 'Tools', href: 'https://reactbits.dev/tools' }
];

export default function App() {
  return (
    <>
      <header className="header">
        <div className="header-container">
          <a href="#" className="logo" aria-label="React Bits home">
            <ReactBitsLogo />
          </a>

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
            <h1 className="landing-title">
              <span className="hero-text-animate">React Components</span>
              <br />
              <span className="hero-text-animate hero-text-animate-delay">For Creative Developers</span>
            </h1>

            <p className="landing-subtitle hero-text-animate hero-subtitle-delay">
              Highly customizable animated components that make your React projects truly stand out
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
