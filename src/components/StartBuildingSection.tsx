import { sitePaths } from '../site';
import './StartBuildingSection.css';

export default function StartBuildingSection() {
  return (
    <section className="start-building-section" aria-labelledby="start-building-title">
      <div className="start-building-container">
        <div className="start-building-card">
          <h2 id="start-building-title" className="start-building-title">
            Start Exploring
          </h2>
          <p className="start-building-subtitle">Animations, Components, Backgrounds - One Click Away</p>

          <a href={sitePaths.toolsPage} className="start-building-button">
            Browse Components
          </a>
        </div>
      </div>
    </section>
  );
}
