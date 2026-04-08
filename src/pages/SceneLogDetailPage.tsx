import SiteHeader from '../components/SiteHeader';
import './ScenePage.css';

type SceneLogDetailPageProps = {
  teamTitle: string;
  logDate: string;
  logTitle: string;
  paragraphs: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
};

export default function SceneLogDetailPage({ teamTitle, logDate, logTitle, paragraphs, imageSrc, imageAlt, imageCaption }: SceneLogDetailPageProps) {
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page scene-log-page--plain">
        <div className="scene-log-shell scene-log-shell--detail">
          <section className="scene-log-hero scene-log-hero--detail" aria-labelledby="scene-log-detail-title">
            <p className="scene-log-detail__team">{teamTitle}</p>
            <h1 id="scene-log-detail-title" className="scene-log-title scene-log-title--detail">
              {logTitle}
            </h1>
            <p className="scene-log-detail__date">{logDate}</p>
          </section>

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

          <article className="scene-log-detail__panel">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="scene-log-detail__paragraph">
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </main>
    </>
  );
}
