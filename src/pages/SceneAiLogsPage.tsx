import { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import { loadAllSceneLogEntries, type SceneLogListItem } from '../data/scene/runtime';
import type { SceneLogKey } from '../data/scene/types';
import './ScenePage.css';

const LOGS_PER_PAGE = 4;

const TEAM_BUTTONS = [
  { key: 'digitalResident', label: 'AI居民' },
  { key: 'blogOps', label: 'AI博客' },
  { key: 'siteOps', label: 'AI建站' }
] as const satisfies ReadonlyArray<{ key: SceneLogKey; label: string }>;

type TeamFilter = SceneLogKey | 'all';

export default function SceneAiLogsPage() {
  const [entries, setEntries] = useState<SceneLogListItem[] | null>(null);
  const [activeTeam, setActiveTeam] = useState<TeamFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let aborted = false;

    void loadAllSceneLogEntries().then((items) => {
      if (!aborted) {
        setEntries(items);
      }
    });

    return () => {
      aborted = true;
    };
  }, []);

  const visibleEntries = (entries ?? []).filter(
    (entry) => activeTeam === 'all' || entry.collectionKey === activeTeam
  );
  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / LOGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentLogs = visibleEntries.slice((safePage - 1) * LOGS_PER_PAGE, safePage * LOGS_PER_PAGE);

  const toggleTeam = (key: SceneLogKey) => {
    setActiveTeam((current) => (current === key ? 'all' : key));
    setCurrentPage(1);
  };

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
          <section className="scene-log-hero" aria-labelledby="scene-ai-logs-title">
            <h1 id="scene-ai-logs-title" className="scene-log-title scene-log-title--single">
              AI 工作日志
            </h1>
          </section>

          <section className="scene-log-timeline scene-log-timeline--compact scene-log-timeline--resident" aria-labelledby="scene-ai-logs-list-title">
            <div className="scene-log-timeline__header">
              <div>
                <h2 id="scene-ai-logs-list-title" className="scene-log-panel__title">
                  工作日志
                </h2>
              </div>

              <div className="scene-ai-logs__teams" role="group" aria-label="按团队查看日志">
                {TEAM_BUTTONS.map((team) => (
                  <button
                    key={team.key}
                    type="button"
                    className={`scene-log-pagination__button scene-ai-logs__team-button${activeTeam === team.key ? ' is-active' : ''}`}
                    aria-pressed={activeTeam === team.key}
                    onClick={() => toggleTeam(team.key)}
                  >
                    {team.label}
                  </button>
                ))}
              </div>
            </div>

            {entries === null ? (
              <p className="scene-log-loading">日志加载中…</p>
            ) : (
              <ol className="scene-log-timeline__list">
                {currentLogs.map((entry) => (
                  <li key={entry.id} className="scene-log-timeline__item scene-log-timeline__item--plain">
                    <a href={entry.detailHref} className="scene-log-timeline__card scene-log-timeline__card--link">
                      <p className="scene-log-timeline__date">{entry.publishedAt}</p>
                      <h3 className="scene-log-timeline__title">{entry.title}</h3>
                      <p className="scene-log-timeline__text">{entry.preview}</p>
                    </a>
                  </li>
                ))}
              </ol>
            )}

            <div className="scene-log-pagination scene-log-pagination--right" aria-label="日志翻页">
              <button
                type="button"
                className="scene-log-pagination__button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                上一页
              </button>

              <span className="scene-log-pagination__status">
                {safePage}/{totalPages}
              </span>

              <button
                type="button"
                className="scene-log-pagination__button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
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
