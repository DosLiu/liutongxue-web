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
    <div className="tool-card-content">
      <h3 className="tool-card-title">{tool.label}</h3>
      <p className="tool-card-description">{tool.description}</p>
    </div>
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
          <p className="tools-showcase-subtitle">多维 Agent 矩阵的实时协作</p>
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
