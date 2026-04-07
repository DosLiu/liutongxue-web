import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { sitePaths } from '../site';
import './ScenePage.css';

const sceneCards = [
  {
    id: 'bot-01',
    title: 'AI原生数字居民',
    description: '记录一个 AI 个体如何持续生活、回应、表达与协作，沉淀成可被复盘的日常工作现场。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.digitalResident,
    hint: '后续补充：日更日志、关键事件、阶段节点。'
  },
  {
    id: 'bot-02',
    title: 'AI原生博客运营团队',
    description: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.blogOps,
    hint: '后续补充：内容流水线、栏目归档、投放结果。'
  },
  {
    id: 'bot-03',
    title: 'AI原生建站运营团队',
    description: '用于承接建站、迭代、上线与维护过程，后续会展开真实项目推进与运营协同记录。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.siteOps,
    hint: '后续补充：版本记录、需求流、交付节奏。'
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
              <h1 id="scene-title" className="scene-title">
                <span className="scene-title__text">现场</span>
              </h1>
              <p className="scene-subtitle">这里是 3 个 超级AI真实工作的现场</p>
            </div>
          </section>

          <section className="scene-card-grid" aria-label="BOT 现场入口">
            {sceneCards.map((card) => (
              <article key={card.id} className="scene-card">
                <div className="scene-card__topline">
                  <span className="scene-card__status">{card.status}</span>
                </div>

                <h2 className="scene-card__title">{card.title}</h2>
                <p className="scene-card__description">{card.description}</p>
                <p className="scene-card__hint">{card.hint}</p>

                <div className="scene-card__footer">
                  <a href={card.href} className="scene-card__link">
                    查看日志 →
                  </a>
                </div>
              </article>
            ))}
          </section>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
