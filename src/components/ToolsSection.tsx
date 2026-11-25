import { useEffect, useRef, useState } from 'react';
import { TOOL_SHOWCASE_ITEMS, type ToolShowcaseItem } from '../constants/toolsShowcase';
import { MaintenanceTapeOverlay, ProjectCardMockup } from './ProjectCardMockup';
import SceneQrModal from './SceneQrModal';
import './ToolsSection.css';

type ToolsSectionProps = {
  id?: string;
};

type ToolCardProps = {
  tool: ToolShowcaseItem;
  index: number;
  onOpenQr: (tool: ToolShowcaseItem) => void;
};

function ToolCard({ tool, index, onOpenQr }: ToolCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isMaintenance = Boolean(tool.underMaintenance);
  const isPlaceholder = Boolean(tool.isPlaceholder);

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

  if (isPlaceholder) {
    return (
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={`tool-showcase-card tool-showcase-card--placeholder${isVisible ? ' visible' : ''}`}
        aria-label="新项目占位框"
      />
    );
  }

  const cardClassName = `tool-showcase-card${isVisible ? ' visible' : ''}${isMaintenance ? ' tool-showcase-card--maintenance' : ''}`;
  const actionLabel = tool.actionLabel ?? '进入现场探索';
  const actionArrow = tool.isExternal ? '↗' : '→';

  const innerContent = (
    <>
      <div className="tool-card-mockup-wrapper">
        <ProjectCardMockup id={tool.id} underMaintenance={isMaintenance} />
      </div>

      <div className="tool-card-content">
        <div className="tool-card-meta-row">
          {tool.status ? (
            <span className={`tool-card-status${isMaintenance ? ' tool-card-status--maintenance' : ''}`}>
              <span className={`tool-status-dot${isMaintenance ? ' tool-status-dot--maintenance' : ''}`} />
              {tool.status}
            </span>
          ) : null}
          {tool.tag ? <span className="tool-card-tag">{tool.tag}</span> : null}
        </div>

        <h3 className="tool-card-title">
          <span>{tool.label}</span>
          {!isMaintenance ? (
            <span className="tool-card-arrow" aria-hidden="true">↗</span>
          ) : null}
        </h3>

        {tool.description ? <p className="tool-card-description">{tool.description}</p> : null}

        {isMaintenance ? (
          <div className="tool-card-footer-action tool-card-footer-action--disabled">
            <span>内容检修中，暂未开放</span>
          </div>
        ) : (
          <div className="tool-card-footer-action">
            <span>{actionLabel}</span>
            <span className="tool-action-arrow" aria-hidden="true">{actionArrow}</span>
          </div>
        )}
      </div>
    </>
  );

  if (!isMaintenance && tool.qr) {
    return (
      <button
        type="button"
        ref={cardRef as React.RefObject<HTMLButtonElement>}
        className={cardClassName}
        onClick={() => onOpenQr(tool)}
        aria-haspopup="dialog"
      >
        {innerContent}
      </button>
    );
  }

  if (isMaintenance || !tool.href) {
    return (
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={cardClassName}
        aria-disabled={isMaintenance || undefined}
      >
        {isMaintenance ? <div className="card-body-dimmed">{innerContent}</div> : innerContent}
        {isMaintenance ? <MaintenanceTapeOverlay /> : null}
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
      {innerContent}
    </a>
  );
}

export default function ToolsSection({ id }: ToolsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [qrTool, setQrTool] = useState<ToolShowcaseItem | null>(null);

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
    <>
      <section id={id} ref={sectionRef} className="tools-showcase-section tools-showcase-section--embedded">
        <div className="tools-showcase-container">
          <div className="tools-showcase-spacer tools-showcase-spacer--top" aria-hidden="true" />

          <div className={`tools-showcase-header ${titleVisible ? 'visible' : ''}`}>
            <h2 className="tools-showcase-title">案发现场</h2>
          </div>

          <div className="tools-showcase-spacer tools-showcase-spacer--gap" aria-hidden="true" />

          <div className="tools-showcase-grid">
            {TOOL_SHOWCASE_ITEMS.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} onOpenQr={setQrTool} />
            ))}
          </div>

          <div className="tools-showcase-spacer tools-showcase-spacer--bottom" aria-hidden="true" />
        </div>
      </section>

      <SceneQrModal
        block={qrTool ? { title: qrTool.label, qr: qrTool.qr } : null}
        onClose={() => setQrTool(null)}
      />
    </>
  );
}
