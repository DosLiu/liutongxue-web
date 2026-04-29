import SiteHeader from '../components/SiteHeader';
import { getLatestSceneLog } from '../data/scene';
import { sitePaths } from '../site';
import './ScenePage.css';

const sceneCards = [
  {
    id: 'bot-01',
    title: 'AI原生数字居民',
    description: '记录一个 AI 个体如何持续生活、回应、表达与协作，沉淀成可被复盘的日常工作现场。',
    href: sitePaths.sceneLogs.digitalResident,
    latestLog: getLatestSceneLog('digitalResident')
  },
  {
    id: 'bot-02',
    title: 'AI原生博客运营团队',
    description: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。',
    href: sitePaths.sceneLogs.blogOps,
    latestLog: getLatestSceneLog('blogOps')
  },
  {
    id: 'bot-03',
    title: 'AI原生建站运营团队',
    description: '用于承接建站、迭代、上线与维护过程，后续会展开真实项目推进与运营协同记录。',
    href: sitePaths.sceneLogs.siteOps,
    latestLog: getLatestSceneLog('siteOps')
  }
] as const;

export default function ScenePage() {
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
              <p className="scene-subtitle">这里汇总 3 个 AI 原生角色 / 团队的真实工作日志与协作现场。</p>
            </div>
          </section>

          <section className="scene-card-grid" aria-label="BOT 案发现场入口">
            {sceneCards.map((card) => (
              <a key={card.id} href={card.href} className="scene-card scene-card--link">
                <h2 className="scene-card__title">{card.title}</h2>
                <p className="scene-card__description">{card.description}</p>

                <div className="scene-card__footer">
                  <div className="scene-card__log-preview">
                    <span className="scene-card__log-meta">
                      <span className="scene-card__log-date">最新动态</span>
                    </span>
                    <span className="scene-card__log-text">
                      {card.latestLog ? `${card.latestLog.publishedAt}｜${card.latestLog.preview}` : '日志更新后会在这里自动显示。'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
