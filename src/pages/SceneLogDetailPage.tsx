import SiteHeader from '../components/SiteHeader';
import './ScenePage.css';

type SceneLogDetailPageProps = {
  logDate: string;
  logTitle: string;
  paragraphs: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  sourceHref?: string;
  sourceLabel?: string;
  hideMediaWhenEmpty?: boolean;
};

export default function SceneLogDetailPage({
  logDate,
  logTitle,
  paragraphs,
  imageSrc,
  imageAlt,
  imageCaption,
  sourceHref,
  sourceLabel,
  hideMediaWhenEmpty = false
}: SceneLogDetailPageProps) {
  const shouldRenderMedia = !hideMediaWhenEmpty || !!imageSrc || !!imageCaption;
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page">
        <div className="scene-log-page__ambient scene-log-page__ambient--left" aria-hidden="true" />
        <div className="scene-log-page__ambient scene-log-page__ambient--right" aria-hidden="true" />
        <div className="scene-log-page__grid" aria-hidden="true" />
        <div className="scene-log-page__edge scene-log-page__edge--left" aria-hidden="true" />
        <div className="scene-log-page__edge scene-log-page__edge--right" aria-hidden="true" />

        <div className="scene-log-shell scene-log-shell--detail">
          <section className="scene-log-hero scene-log-hero--detail" aria-labelledby="scene-log-detail-title">
            <h1 id="scene-log-detail-title" className="scene-log-title scene-log-title--detail">
              {logTitle}
            </h1>
          </section>

          {shouldRenderMedia ? (
            <section className="scene-log-detail__media" aria-label="日志配图预留区">
              {imageSrc ? (
                <>
                  <img src={imageSrc} alt={imageAlt ?? logTitle} className="scene-log-detail__image" />
                  {imageCaption ? <p className="scene-log-detail__image-caption">{imageCaption}</p> : null}
                </>
              ) : (
                <div className="scene-log-detail__image-placeholder">
                  <span className="scene-log-detail__image-placeholder-tag">图片预留区</span>
                  <p className="scene-log-detail__image-placeholder-text">{imageCaption ?? '这里后续可插入截图，让读者不用一上来只看长文字。'}</p>
                </div>
              )}
            </section>
          ) : null}

          <article className="scene-log-detail__panel">
            <div className="scene-log-detail__body">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="scene-log-detail__paragraph">
                  {paragraph}
                </p>
              ))}

              {sourceHref && sourceLabel ? (
                <p className="scene-log-detail__source">
                  <a href={sourceHref} className="scene-log-detail__source-link" target="_blank" rel="noreferrer">
                    {sourceLabel}
                  </a>
                </p>
              ) : null}

              <p className="scene-log-detail__date scene-log-detail__date--tail">{logDate}</p>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
