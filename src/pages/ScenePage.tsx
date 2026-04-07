import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { sitePaths } from '../site';
import './ScenePage.css';

const sceneCards = [
  {
    id: 'bot-01',
    eyebrow: 'BOT 01',
    title: 'AI原生数字居民',
    description: '记录一个 AI 个体如何持续生活、回应、表达与协作，沉淀成可被复盘的日常工作现场。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.digitalResident,
    hint: '后续补充：日更日志、关键事件、阶段节点。'
  },
  {
    id: 'bot-02',
    eyebrow: 'BOT 02',
    title: 'AI原生博客运营团队',
    description: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.blogOps,
    hint: '后续补充：内容流水线、栏目归档、投放结果。'
  },
  {
    id: 'bot-03',
    eyebrow: 'BOT 03',
    title: 'AI原生建站运营团队',
    description: '用于承接建站、迭代、上线与维护过程，后续会展开真实项目推进与运营协同记录。',
    status: '日志入口已预留',
    href: sitePaths.sceneLogs.siteOps,
    hint: '后续补充：版本记录、需求流、交付节奏。'
  }
] as const;

const archiveItems = [
  { label: '当前状态', value: '已落出现场导航页 baseline，可直接 review。' },
  { label: '预留结构', value: '3 个 BOT 日志入口已拆成独立三级路径。' },
  { label: '后续扩展', value: '可继续接入时间线、截图流、里程碑与文档归档。' }
] as const;

export default function ScenePage() {
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-page">
        <div className="scene-page__ambient scene-page__ambient--left" aria-hidden="true" />
        <div className="scene-page__ambient scene-page__ambient--right" aria-hidden="true" />
        <div className="scene-page__grid" aria-hidden="true" />

        <div className="scene-shell">
          <section className="scene-hero" aria-labelledby="scene-title">
            <span className="scene-kicker">Live Scene Index</span>
            <h1 id="scene-title" className="scene-title">
              现场
            </h1>
            <p className="scene-subtitle">
              这里是 3 个 BOT 真实工作 / 使用现场的导航页。先把入口、节奏与档案骨架搭起来，后续再沿着同一套语言继续向下展开。
            </p>
          </section>

          <section className="scene-card-grid" aria-label="BOT 现场入口">
            {sceneCards.map((card) => (
              <article key={card.id} className="scene-card">
                <div className="scene-card__topline">
                  <span className="scene-card__eyebrow">{card.eyebrow}</span>
                  <span className="scene-card__dot" aria-hidden="true" />
                </div>

                <h2 className="scene-card__title">{card.title}</h2>
                <p className="scene-card__description">{card.description}</p>

                <div className="scene-card__footer">
                  <div>
                    <div className="scene-card__status">{card.status}</div>
                    <p className="scene-card__hint">{card.hint}</p>
                  </div>
                  <a href={card.href} className="scene-card__link">
                    查看日志 →
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="scene-archive-panel" aria-labelledby="scene-archive-title">
            <div className="scene-archive-panel__topline">
              <div>
                <p className="scene-archive-panel__eyebrow">Archive Notes</p>
                <h2 id="scene-archive-title" className="scene-archive-panel__title">
                  最近更新 / 档案说明
                </h2>
              </div>
              <span className="scene-status-pill">Baseline Ready</span>
            </div>

            <p className="scene-archive-panel__description">
              当前页面优先把“现场”做成网站原生长出来的二级导航页，而不是临时列表。入口、层级、文案语气与卡片质感都已按首页语言对齐，方便后续继续补完真实日志内容。
            </p>

            <div className="scene-archive-panel__grid">
              {archiveItems.map((item) => (
                <div key={item.label} className="scene-archive-panel__item">
                  <span className="scene-archive-panel__item-label">{item.label}</span>
                  <p className="scene-archive-panel__item-value">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
