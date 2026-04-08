import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import { getSceneLogs, sceneLogCollections } from '../data/scene';
import './ScenePage.css';

const pageData = sceneLogCollections.digitalResident;
const logs = getSceneLogs('digitalResident');
const LOGS_PER_PAGE = 5;

export default function SceneDigitalResidentPage() {
  const totalPages = Math.max(1, Math.ceil(logs.length / LOGS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(1);
  const currentLogs = logs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

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
                <h2 id="scene-log-timeline-title" className="scene-log-panel__title">
                  工作日志
                </h2>
              </div>
            </div>

            <ol className="scene-log-timeline__list">
              {currentLogs.map((log) => (
                <li key={log.id} className="scene-log-timeline__item scene-log-timeline__item--plain">
                  <article className="scene-log-timeline__card">
                    <p className="scene-log-timeline__date">{log.publishedAt}</p>
                    <h3 className="scene-log-timeline__title">{log.title}</h3>
                    <p className="scene-log-timeline__text">{log.summary}</p>
                  </article>
                </li>
              ))}
            </ol>

            <div className="scene-log-pagination" aria-label="日志翻页">
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
