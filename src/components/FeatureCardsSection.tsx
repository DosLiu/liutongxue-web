import './FeatureCardsSection.css';

export default function FeatureCardsSection() {
  return (
    <section className="features-section" aria-labelledby="features-title">
      <div className="features-container">
        <div className="features-header">
          <h2 id="features-title" className="features-title">
            灵智履痕
          </h2>
        </div>

        <div className="bento-grid">
          <div className="feature-card card1">
            <h2>3+</h2>
            <h3>AI小项目在轨</h3>
          </div>

          <div className="feature-card card2">
            <h2>10000+</h2>
            <h3>AI深度交互</h3>
          </div>

          <div className="feature-card card4">
            <h2>50+</h2>
            <h3>线下智友座谈</h3>
          </div>

          <div className="feature-card card5">
            <h2>2+</h2>
            <h3>历史合作方</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
