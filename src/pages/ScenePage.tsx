import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import SceneQrModal from '../components/SceneQrModal';
import { MaintenanceTapeOverlay } from '../components/ProjectCardMockup';
import { SCENE_PROJECT_CARDS, type SceneProjectCard } from '../constants/sceneProjects';
import { getLatestSceneLog, sceneCollectionList } from '../data/scene';
import './ScenePage.css';

type ProjectCardView = SceneProjectCard & { footerLabel: string; footerText: string };

const buildCardViews = (): ProjectCardView[] => {
  const latestLogs = sceneCollectionList
    .map((collection) => getLatestSceneLog(collection.key))
    .filter((log) => Boolean(log))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const latestLog = latestLogs[0];

  return SCENE_PROJECT_CARDS.map((card) => {
    if (card.id === 'ai-work-logs' && !card.underMaintenance && latestLog) {
      return {
        ...card,
        footerLabel: '最新动态',
        footerText: `${latestLog.publishedAt}｜${latestLog.preview}`
      };
    }

    return { ...card, footerLabel: card.footerLabel ?? '', footerText: card.footerText ?? '' };
  });
};

type ProjectCardProps = {
  card: ProjectCardView;
  onOpenQr: (card: SceneProjectCard) => void;
};

function ProjectCard({ card, onOpenQr }: ProjectCardProps) {
  const isMaintenance = Boolean(card.underMaintenance);
  const isExternal = card.href ? /^https?:\/\//i.test(card.href) : false;

  if (card.isPlaceholder) {
    return <div className="scene-card scene-card--placeholder" aria-label="新项目占位框" />;
  }

  const body = (
    <>
      <h2 className="scene-card__title">{card.title}</h2>
      <p className="scene-card__description">{card.description || '介绍文案待补充。'}</p>

      <div className="scene-card__footer">
        <div className={`scene-card__log-preview${isMaintenance ? ' scene-card__log-preview--disabled' : ''}`}>
          {card.footerLabel ? (
            <span className="scene-card__log-meta">
              <span className="scene-card__log-date">{card.footerLabel}</span>
            </span>
          ) : null}
          <span className="scene-card__log-text">{card.footerText}</span>
        </div>
      </div>
    </>
  );

  if (isMaintenance) {
    return (
      <div className="scene-card scene-card--maintenance" aria-disabled="true">
        <div className="card-body-dimmed">{body}</div>
        <MaintenanceTapeOverlay />
      </div>
    );
  }

  if (card.qr) {
    return (
      <button
        type="button"
        className="scene-card scene-card--link"
        onClick={() => onOpenQr(card)}
        aria-haspopup="dialog"
      >
        {body}
      </button>
    );
  }

  if (!card.href) {
    return <div className="scene-card">{body}</div>;
  }

  return (
    <a
      href={card.href}
      className="scene-card scene-card--link"
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  );
}

export default function ScenePage() {
  const [qrCard, setQrCard] = useState<SceneProjectCard | null>(null);

  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-page">
        <div className="scene-page__ambient scene-page__ambient--left" aria-hidden="true" />
        <div className="scene-page__ambient scene-page__ambient--right" aria-hidden="true" />
        <div className="scene-page__edge scene-page__edge--left" aria-hidden="true" />
        <div className="scene-page__edge scene-page__edge--right" aria-hidden="true" />

        <div className="scene-shell">
          <section className="scene-hero" aria-labelledby="scene-title">
            <div className="scene-hero__glow" aria-hidden="true" />
            <div className="scene-hero__content">
              <h1 id="scene-title" className="scene-title">案发现场</h1>
              <p className="scene-subtitle">作品与实证 · 每个项目都能点进去验证</p>
            </div>
          </section>

          <section className="scene-card-grid" aria-label="项目入口">
            {buildCardViews().map((card) => (
              <ProjectCard key={card.id} card={card} onOpenQr={setQrCard} />
            ))}
          </section>
        </div>
      </main>

      <SiteFooter />

      <SceneQrModal block={qrCard} onClose={() => setQrCard(null)} />
    </>
  );
}
