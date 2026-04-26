import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import { getSceneLogs, sceneLogCollections, type SceneLogKey } from '../data/scene';
import './ScenePage.css';

type SceneTeamLogPageProps = {
  sceneKey: SceneLogKey;
};

const LOGS_PER_PAGE = 4;

export default function SceneTeamLogPage({ sceneKey }: SceneTeamLogPageProps) {
  const pageData = sceneLogCollections[sceneKey];
  const logs = getSceneLogs(sceneKey);
  const totalPages = Math.max(1, Math.ceil(logs.length / LOGS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(1);
  const currentLogs = logs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page">
        <div className="scene-log-page__ambient scene-log-page__ambient--left" aria-hidden="true" />
        <div className="scene-log-page__ambient scene-log-page__ambient--right" aria-hidden="true" />
        <div className="scene-log-page__grid" aria-hidden="true" />
        <div className="scene-log-page__edge scene-log-page__edge--left" aria-hidden="true" />
        <div className="scene-log-page__edge scene-log-page__edge--right" aria-hidden="true" />

        <div className="scene-log-shell scene-log-shell--resident">
          <section className="scene-log-hero" aria-labelledby="scene-log-title">
            <div>
              <h1 id="scene-log-title" className="scene-log-title scene-log-title--single">
                {pageData.title}
              </h1>
              <p className="scene-log-subtitle">{pageData.subtitle}</p>
            </div>
          </section>

          <section className="scene-log-timeline scene-log-timeline--compact scene-log-timeline--resident" aria-labelledby="scene-log-timeline-title">
            <div className="scene-log-timeline__header">
              <div>
                <h2 id="scene-log-timeline-title" className="scene-log-panel__title">
                  工作日志
                </h2>
              </div>
            </div>

            <ol className="scene-log-timeline__list">
              {currentLogs.map((log) => (
                <li key={log.id} className="scene-log-timeline__item scene-log-timeline__item--plain">
                  {log.detailHref ? (
                    <a href={log.detailHref} className="scene-log-timeline__card scene-log-timeline__card--link">
                      <p className="scene-log-timeline__date">{log.publishedAt}</p>
                      <h3 className="scene-log-timeline__title">{log.title}</h3>
                      <p className="scene-log-timeline__text">{log.preview}</p>
                    </a>
                  ) : (
                    <article className="scene-log-timeline__card">
                      <p className="scene-log-timeline__date">{log.publishedAt}</p>
                      <h3 className="scene-log-timeline__title">{log.title}</h3>
                      <p className="scene-log-timeline__text">{log.preview}</p>
                    </article>
                  )}
                </li>
              ))}
            </ol>

            <div className="scene-log-pagination scene-log-pagination--right" aria-label="日志翻页">
              <button
                type="button"
                className="scene-log-pagination__button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </button>

              <span className="scene-log-pagination__status">
                {currentPage}/{totalPages}
              </span>

              <button
                type="button"
                className="scene-log-pagination__button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
