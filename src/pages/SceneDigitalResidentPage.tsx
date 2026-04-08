import SiteHeader from '../components/SiteHeader';
import { getLatestSceneLog, getSceneLogs, sceneLogCollections } from '../constants/sceneLogs';
import { sitePaths } from '../site';
import './ScenePage.css';

const pageData = sceneLogCollections.digitalResident;
const latestLog = getLatestSceneLog('digitalResident');
const logs = getSceneLogs('digitalResident');

export default function SceneDigitalResidentPage() {
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page">
        <div className="scene-log-page__ambient scene-log-page__ambient--left" aria-hidden="true" />
        <div className="scene-log-page__ambient scene-log-page__ambient--right" aria-hidden="true" />
        <div className="scene-log-page__grid" aria-hidden="true" />

        <div className="scene-log-shell">
          <a href={sitePaths.scene} className="scene-back-link">
            ← 返回案发现场
          </a>

          <section className="scene-log-hero" aria-labelledby="scene-log-title">
            <h1 id="scene-log-title" className="scene-log-title scene-log-title--single">
              {pageData.title}
            </h1>
          </section>

          {latestLog ? (
            <section className="scene-log-panel scene-log-highlight" aria-labelledby="scene-log-highlight-title">
              <div className="scene-log-highlight__topline">
                <div>
                  <p className="scene-log-panel__eyebrow">Recent Update</p>
                  <h2 id="scene-log-highlight-title" className="scene-log-panel__title">
                    最新动态
                  </h2>
                </div>
                <span className="scene-status-pill">{latestLog.publishedAt}</span>
              </div>

              <h3 className="scene-log-highlight__headline">{latestLog.title}</h3>
              <p className="scene-log-panel__description">{latestLog.summary}</p>

              <div className="scene-log-highlight__meta">
                <div className="scene-log-panel__item">
                  <span className="scene-log-panel__item-label">记录总数</span>
                  <p className="scene-log-panel__item-value">目前已收纳 {logs.length} 条公开日志记录。</p>
                </div>
                <div className="scene-log-panel__item">
                  <span className="scene-log-panel__item-label">更新方式</span>
                  <p className="scene-log-panel__item-value">按日期倒序整理，后续新增日志会继续直接挂到这条时间线里。</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="scene-log-timeline" aria-labelledby="scene-log-timeline-title">
            <div className="scene-log-timeline__header">
              <div>
                <p className="scene-log-panel__eyebrow">Log Timeline</p>
                <h2 id="scene-log-timeline-title" className="scene-log-panel__title">
                  全部日志
                </h2>
              </div>
              <p className="scene-log-timeline__summary">按日期倒序归档数字居民的公开进展，保持和二级页同一套现场语气与视觉层级。</p>
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
