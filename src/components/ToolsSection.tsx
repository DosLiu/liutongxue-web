import { useEffect, useRef, useState } from 'react';
import { TOOL_SHOWCASE_ITEMS, type ToolShowcaseItem } from '../constants/toolsShowcase';
import './ToolsSection.css';

type ToolsSectionProps = {
  id?: string;
};

type ToolCardProps = {
  tool: ToolShowcaseItem;
  index: number;
};

function renderToolMockup(id: string) {
  if (id === 'ai-work-logs') {
    return (
      <div className="tool-mockup tool-mockup--terminal" aria-hidden="true">
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
            <span className="term-prompt">agent@swarm</span>:<span className="term-path">~/logs</span>$ sync --watch
          </div>
          <div className="mockup-terminal-line term-dim">› 选题拆解完毕: 13 篇深度日志自动归档</div>
          <div className="mockup-terminal-line term-highlight">
            <span className="term-success">✔</span> 全程留痕校验通过 <span className="term-cursor" />
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
            <span className="mockup-lock-icon">🔒</span>
            <span className="mockup-url">liutongxue.com.cn</span>
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

function ToolCard({ tool, index }: ToolCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const cardClassName = `tool-showcase-card ${isVisible ? 'visible' : ''}`;
  const cardContent = (
    <>
      <div className="tool-card-mockup-wrapper">
        {renderToolMockup(tool.id)}
      </div>

      <div className="tool-card-content">
        <div className="tool-card-meta-row">
          {tool.status ? (
            <span className="tool-card-status">
              <span className="tool-status-dot" />
              {tool.status}
            </span>
          ) : null}
          {tool.tag ? <span className="tool-card-tag">{tool.tag}</span> : null}
        </div>

        <h3 className="tool-card-title">
          <span>{tool.label}</span>
          <span className="tool-card-arrow" aria-hidden="true">↗</span>
        </h3>

        {tool.description ? <p className="tool-card-description">{tool.description}</p> : null}

        <div className="tool-card-footer-action">
          <span>进入现场探索</span>
          <span className="tool-action-arrow">→</span>
        </div>
      </div>
    </>
  );

  if (!tool.href) {
    return (
      <div ref={cardRef as React.RefObject<HTMLDivElement>} className={cardClassName}>
        {cardContent}
      </div>
    );
  }

  return (
    <a
      href={tool.href}
      ref={cardRef as React.RefObject<HTMLAnchorElement>}
      className={cardClassName}
      {...(tool.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {cardContent}
    </a>
  );
}

export default function ToolsSection({ id }: ToolsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={sectionRef} className="tools-showcase-section tools-showcase-section--embedded">
      <div className="tools-showcase-container">
        <div className="tools-showcase-spacer tools-showcase-spacer--top" aria-hidden="true" />

        <div className={`tools-showcase-header ${titleVisible ? 'visible' : ''}`}>
          <h2 className="tools-showcase-title">案发现场</h2>
        </div>

        <div className="tools-showcase-spacer tools-showcase-spacer--gap" aria-hidden="true" />

        <div className="tools-showcase-grid">
          {TOOL_SHOWCASE_ITEMS.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        <div className="tools-showcase-spacer tools-showcase-spacer--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
