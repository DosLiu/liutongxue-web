import './StartBuildingSection.css';

export default function StartBuildingSection() {
  return (
    <section className="start-building-section" aria-labelledby="start-building-title">
      <div className="start-building-container">
        <div className="start-building-card">
          <h2 id="start-building-title" className="start-building-title">
            与我链接
          </h2>
          <button type="button" className="start-building-button">
            Start
          </button>
        </div>
      </div>
    </section>
  );
}
