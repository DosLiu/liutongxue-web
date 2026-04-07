import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { sitePaths } from '../site';
import './ScenePage.css';

type SceneLogPlaceholderPageProps = {
  title: string;
  subtitle: string;
  archiveLabel: string;
};

const reservedItems = [
  { label: '日志形态', value: '时间线 / 关键节点 / 原始记录，后续可直接往里补。' },
  { label: '内容结构', value: '已预留独立页面壳层，不会和“现场”导航页互相挤压。' },
  { label: '扩展方向', value: '可继续接截图、复盘、版本说明与外链档案。' }
] as const;

export default function SceneLogPlaceholderPage({ title, subtitle, archiveLabel }: SceneLogPlaceholderPageProps) {
  return (
    <>
      <SiteHeader activeKey="scene" />

      <main className="scene-log-page">
        <div className="scene-log-page__ambient scene-log-page__ambient--left" aria-hidden="true" />
        <div className="scene-log-page__ambient scene-log-page__ambient--right" aria-hidden="true" />
        <div className="scene-log-page__grid" aria-hidden="true" />

        <div className="scene-log-shell">
          <a href={sitePaths.scene} className="scene-back-link">
            ← 返回现场
          </a>

          <section className="scene-log-hero" aria-labelledby="scene-log-title">
            <span className="scene-log-kicker">Log Archive Reserved</span>
            <h1 id="scene-log-title" className="scene-log-title">
              {title}
            </h1>
            <p className="scene-log-subtitle">{subtitle}</p>
          </section>

          <section className="scene-log-panel" aria-labelledby="scene-log-panel-title">
            <p className="scene-log-panel__eyebrow">Archive Status</p>
            <h2 id="scene-log-panel-title" className="scene-log-panel__title">
              当前是可扩展占位页，不是空白死链
            </h2>
            <p className="scene-log-panel__description">
              这个入口已经被拆成独立三级页面，后面可以顺着同一套视觉系统继续填充真实日志内容。当前先把结构、标题与档案说明固化下来，避免后续返工页面骨架。
            </p>

            <ul className="scene-log-panel__list">
              <li>已为该 BOT 预留单独路径与页面壳层，后续可以直接接日志正文。</li>
              <li>建议下一步补：时间线、最近更新、关键任务、阶段成果与原始记录。</li>
              <li>{archiveLabel}</li>
            </ul>

            <div className="scene-log-panel__grid">
              {reservedItems.map((item) => (
                <div key={item.label} className="scene-log-panel__item">
                  <span className="scene-log-panel__item-label">{item.label}</span>
                  <p className="scene-log-panel__item-value">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="scene-log-panel__footer">
              <p className="scene-log-panel__footnote">当前页面用于 review 与后续接续开发，视觉语言已与首页 / 现场页对齐。</p>
              <a href={sitePaths.scene} className="scene-card__link">
                返回现场总览 →
              </a>
            </div>
          </section>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
