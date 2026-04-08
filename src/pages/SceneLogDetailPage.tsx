import SiteHeader from '../components/SiteHeader';
import './ScenePage.css';

type SceneLogDetailPageProps = {
  teamTitle: string;
  logDate: string;
  logTitle: string;
  paragraphs: string[];
};

export default function SceneLogDetailPage({ teamTitle, logDate, logTitle, paragraphs }: SceneLogDetailPageProps) {
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
