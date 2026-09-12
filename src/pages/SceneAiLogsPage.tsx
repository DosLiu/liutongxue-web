import { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import { loadAllSceneLogEntries, type SceneLogListItem } from '../data/scene/runtime';
import type { SceneLogKey } from '../data/scene/types';
import { getSceneCollectionHref } from '../site';
import './ScenePage.css';

const TEAM_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'digitalResident', label: '数字居民' },
  { key: 'blogOps', label: '博客运营' },
  { key: 'siteOps', label: '建站运营' }
] as const satisfies ReadonlyArray<{ key: SceneLogKey | 'all'; label: string }>;

type TeamFilterKey = (typeof TEAM_FILTERS)[number]['key'];

const COLLECTION_HREFS: Record<Exclude<TeamFilterKey, 'all'>, string> = {
  digitalResident: getSceneCollectionHref('digitalResident'),
  blogOps: getSceneCollectionHref('blogOps'),
  siteOps: getSceneCollectionHref('siteOps')
};

const getTeamLabel = (key: SceneLogKey) => TEAM_FILTERS.find((filter) => filter.key === key)?.label ?? key;

export default function SceneAiLogsPage() {
  const [entries, setEntries] = useState<SceneLogListItem[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<TeamFilterKey>('all');

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
    (entry) => activeFilter === 'all' || entry.collectionKey === activeFilter
  );

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
            <p className="scene-ai-logs__subtitle">三支 AI 原生队伍的工作现场，按时间倒序持续更新。</p>
          </section>

          <section className="scene-log-timeline scene-log-timeline--compact scene-log-timeline--resident" aria-labelledby="scene-ai-logs-list-title">
            <div className="scene-log-timeline__header">
              <div>
                <h2 id="scene-ai-logs-list-title" className="scene-log-panel__title">
                  工作日志
                </h2>
              </div>

              <div className="scene-ai-logs__filters" role="group" aria-label="按团队筛选">
                {TEAM_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={`scene-ai-logs__filter${activeFilter === filter.key ? ' is-active' : ''}`}
                    aria-pressed={activeFilter === filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {entries === null ? (
              <p className="scene-ai-logs__loading">日志加载中…</p>
            ) : visibleEntries.length === 0 ? (
              <p className="scene-ai-logs__loading">这个筛选条件下暂时没有日志。</p>
            ) : (
              <ol className="scene-log-timeline__list">
                {visibleEntries.map((entry) => (
                  <li key={entry.id} className="scene-log-timeline__item scene-log-timeline__item--plain">
                    <a href={entry.detailHref} className="scene-log-timeline__card scene-log-timeline__card--link">
                      <p className="scene-log-timeline__date">
                        {entry.publishedAt}
                        <span className="scene-ai-logs__badge">{getTeamLabel(entry.collectionKey)}</span>
                      </p>
                      <h3 className="scene-log-timeline__title">{entry.title}</h3>
                      <p className="scene-log-timeline__text">{entry.preview}</p>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="scene-ai-logs__collections" aria-label="按团队浏览">
            <h2 className="scene-ai-logs__collections-title">按团队浏览</h2>
            <div className="scene-ai-logs__collections-links">
              {(Object.keys(COLLECTION_HREFS) as Array<Exclude<TeamFilterKey, 'all'>>).map((key) => (
                <a key={key} href={COLLECTION_HREFS[key]} className="scene-ai-logs__collection-link">
                  {getTeamLabel(key)}
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
