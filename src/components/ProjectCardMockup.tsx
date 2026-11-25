import './ProjectCardMockup.css';

type ProjectCardMockupProps = {
  id: string;
  underMaintenance?: boolean;
};

export function ProjectCardMockup({ id, underMaintenance = false }: ProjectCardMockupProps) {
  if (id === 'ai-work-logs') {
    return (
      <div className={`tool-mockup tool-mockup--terminal${underMaintenance ? ' tool-mockup--maintenance' : ''}`} aria-hidden="true">
        <div className="mockup-terminal-head">
          <div className="mockup-terminal-dots">
            <span className="mockup-dot mockup-dot--red" />
            <span className="mockup-dot mockup-dot--yellow" />
            <span className="mockup-dot mockup-dot--green" />
          </div>
          <span className="mockup-terminal-title">ai-swarm-trace.log</span>
        </div>
        <div className="mockup-terminal-body">
          <div className="mockup-terminal-line">
            <span className="term-prompt">agent@swarm</span>:<span className="term-path">~/logs</span>${' '}
            {underMaintenance ? 'sync --pause' : 'sync --watch'}
          </div>
          <div className="mockup-terminal-line term-dim">
            {underMaintenance ? '› 历史日志归档翻新中，暂停公开访问' : '› 选题拆解完毕: 13 篇深度日志自动归档'}
          </div>
          <div className="mockup-terminal-line term-highlight">
            {underMaintenance ? (
              <>
                <span className="term-warn">⚠</span> 日志内容检修升级中…
              </>
            ) : (
              <>
                <span className="term-success">✔</span> 全程留痕校验通过 <span className="term-cursor" />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'resume-site') {
    return (
      <div className="tool-mockup tool-mockup--browser" aria-hidden="true">
        <div className="mockup-browser-head">
          <div className="mockup-browser-url-bar">
            <span className="mockup-globe-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.25" />
                <ellipse cx="8" cy="8" rx="2.8" ry="6.25" />
                <path d="M2 8h12" />
              </svg>
            </span>
            <span className="mockup-url">jianli.liutongxue.com.cn</span>
          </div>
          <span className="mockup-pill-badge">Zero Code</span>
        </div>
        <div className="mockup-browser-body">
          <div className="mockup-browser-layout">
            <div className="mockup-skeleton-avatar" />
            <div className="mockup-skeleton-rows">
              <div className="mockup-skeleton-row mockup-skeleton-row--bold" />
              <div className="mockup-skeleton-row" />
              <div className="mockup-skeleton-row mockup-skeleton-row--short" />
            </div>
          </div>
          <div className="mockup-banner-chip">100% 由 AI 全流程自主交付</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-mockup tool-mockup--applet" aria-hidden="true">
      <div className="mockup-applet-head">
        <span className="mockup-pill-badge mockup-pill-badge--cyan">微信小程序</span>
        <span className="mockup-applet-action">即开即玩 ↗</span>
      </div>
      <div className="mockup-applet-body">
        <div className="mockup-boba-cup">
          <div className="mockup-boba-straw" />
          <div className="mockup-boba-cup-inner">
            <div className="mockup-boba-liquid" />
            <div className="mockup-boba-pearls">
              <span className="pearl" />
              <span className="pearl" />
              <span className="pearl" />
            </div>
          </div>
        </div>
        <div className="mockup-applet-texts">
          <span className="mockup-applet-tag">零糖 · 零卡 · 仪式感</span>
          <span className="mockup-applet-sub">摇杯、插吸管、假装喝一杯</span>
        </div>
      </div>
    </div>
  );
}

/** 斜跨卡片的黑 + 琥珀黄警戒线封条（用于「检修中」项目卡片） */
export function MaintenanceTapeOverlay() {
  return (
    <div className="maintenance-tape-overlay" aria-hidden="true">
      <div className="maintenance-tape">
        <span className="maintenance-tape__rail" />
        <span className="maintenance-tape__band">
          <span className="maintenance-tape__icon">⚠</span>
          <span className="maintenance-tape__text">现场检修中</span>
          <span className="maintenance-tape__sep">·</span>
          <span className="maintenance-tape__en">MAINTENANCE</span>
        </span>
        <span className="maintenance-tape__rail" />
      </div>
    </div>
  );
}
