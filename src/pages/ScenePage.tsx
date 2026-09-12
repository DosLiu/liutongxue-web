import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import SceneQrModal from '../components/SceneQrModal';
import { SCENE_PROJECT_BLOCKS, type SceneProjectBlock } from '../constants/sceneProjects';
import './ScenePage.css';

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

type ProjectBlockProps = {
  block: SceneProjectBlock;
  onOpenQr: (block: SceneProjectBlock) => void;
};

function ProjectBlock({ block, onOpenQr }: ProjectBlockProps) {
  const href = block.href;
  const isExternal = href ? isExternalHref(href) : false;
  const titleId = `scene-project-title-${block.id}`;

  return (
    <section className={`scene-project scene-project--${block.id}`} aria-labelledby={titleId}>
      <div className="scene-project__head">
        <span className="scene-project__tag">{block.tag}</span>
        <h2 id={titleId} className="scene-project__title">
          {block.title}
        </h2>
      </div>

      {block.intro ? (
        <p className="scene-project__intro">{block.intro}</p>
      ) : (
        <p className="scene-project__intro scene-project__intro--placeholder">介绍文案待补充。</p>
      )}

      {block.points?.length ? (
        <ul className="scene-project__points">
          {block.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}

      <div className="scene-project__actions">
        {block.qr ? (
          <button type="button" className="scene-project__cta" onClick={() => onOpenQr(block)}>
            {block.ctaLabel}
          </button>
        ) : href ? (
          <a
            className="scene-project__cta"
            href={href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {block.ctaLabel}
            {isExternal ? <span aria-hidden="true"> ↗</span> : null}
          </a>
        ) : (
          <span className="scene-project__cta scene-project__cta--pending">上线地址待补充</span>
        )}
      </div>
    </section>
  );
}

export default function ScenePage() {
  const [qrBlock, setQrBlock] = useState<SceneProjectBlock | null>(null);

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
              <p className="scene-subtitle">三支持续运行的 AI 队伍，和它们交付的真实项目。</p>
            </div>
          </section>

          <div className="scene-project-list">
            {SCENE_PROJECT_BLOCKS.map((block) => (
              <ProjectBlock key={block.id} block={block} onOpenQr={setQrBlock} />
            ))}
          </div>
        </div>
      </main>

      <SceneQrModal block={qrBlock} onClose={() => setQrBlock(null)} />
    </>
  );
}
