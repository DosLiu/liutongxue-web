import SiteHeader from '../components/SiteHeader';
import { getSceneLogs, sceneLogCollections } from '../constants/sceneLogs';
import './ScenePage.css';

const pageData = sceneLogCollections.digitalResident;
const logs = getSceneLogs('digitalResident');

export default function SceneDigitalResidentPage() {
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page scene-log-page--plain">
        <div className="scene-log-shell">
          <section className="scene-log-hero" aria-labelledby="scene-log-title">
            <h1 id="scene-log-title" className="scene-log-title scene-log-title--single">
              {pageData.title}
            </h1>
          </section>

          <section className="scene-log-timeline scene-log-timeline--compact" aria-labelledby="scene-log-timeline-title">
            <div className="scene-log-timeline__header">
              <div>
                <p className="scene-log-panel__eyebrow">Log Timeline</p>
                <h2 id="scene-log-timeline-title" className="scene-log-panel__title">
                  全部日志
                </h2>
              </div>
            </div>

            <ol className="scene-log-timeline__list">
              {logs.map((log) => (
                <li key={log.id} className="scene-log-timeline__item">
                  <div className="scene-log-timeline__rail" aria-hidden="true">
                    <span className="scene-log-timeline__dot" />
                    <span className="scene-log-timeline__line" />
                  </div>

                  <article className="scene-log-timeline__card">
                    <p className="scene-log-timeline__date">{log.publishedAt}</p>
                    <h3 className="scene-log-timeline__title">{log.title}</h3>
                    <p className="scene-log-timeline__text">{log.summary}</p>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        </div>

      </main>
    </>
  );
}
