const toolCards = [
  {
    eyebrow: '01',
    title: 'Prompt Stack',
    description: '把常用提示词、工作流触发词与上下文模板整理成稳定可复用的模块。',
    points: ['模块化提示词', '稳定结构输出', '便于迭代复盘']
  },
  {
    eyebrow: '02',
    title: 'Page Building',
    description: '把页面拆成能审、能改、能继续扩展的视觉区块，先完成基线再逐步精修。',
    points: ['结构优先', '层级与留白清晰', '适合快速 review']
  },
  {
    eyebrow: '03',
    title: 'Launch Assets',
    description: '将文案、视觉氛围与交付物统一打包，让页面从概念更快过渡到可上线状态。',
    points: ['站内统一风格', '交付状态明确', '便于后续扩展页面']
  }
];

type ToolsSectionProps = {
  id?: string;
  standalone?: boolean;
};

export default function ToolsSection({ id, standalone = false }: ToolsSectionProps) {
  const Wrapper = standalone ? 'main' : 'section';

  return (
    <Wrapper id={id} className={`tools-page${standalone ? ' tools-page--standalone' : ' tools-page--embedded'}`}>
      <div className="tools-page__ambient tools-page__ambient--left" aria-hidden="true" />
      <div className="tools-page__ambient tools-page__ambient--right" aria-hidden="true" />
      <div className="tools-page__grid" aria-hidden="true" />

      <div className="tools-shell">
        <section className="tools-hero">
          <span className="tools-kicker">Homepage second screen</span>
          <h2 className="tools-title">Tools</h2>
          <p className="tools-subtitle">
            把已经完成的 Tools 风格内容接到首页首屏下面，先形成可以连续下滑浏览的 reviewable baseline，后续再继续补充文案与细节。
          </p>
        </section>

        <section className="tools-card-grid" aria-label="Tools list">
          {toolCards.map((card) => (
            <article key={card.title} className="tools-card">
              <div className="tools-card__topline">
                <span className="tools-card__eyebrow">{card.eyebrow}</span>
                <span className="tools-card__dot" aria-hidden="true" />
              </div>

              <h3 className="tools-card__title">{card.title}</h3>
              <p className="tools-card__description">{card.description}</p>

              <ul className="tools-card__points">
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </Wrapper>
  );
}
