import { useEffect, useRef, useState } from 'react';
import { TOOL_SHOWCASE_ITEMS, type ToolShowcaseItem } from '../constants/toolsShowcase';
import './ToolsSection.css';

type ToolsSectionProps = {
  id?: string;
  standalone?: boolean;
};

type ToolCardProps = {
  tool: ToolShowcaseItem;
  index: number;
};

function ToolCard({ tool, index }: ToolCardProps) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
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

  return (
    <a
      href={tool.href}
      ref={cardRef}
      className={`tool-showcase-card ${isVisible ? 'visible' : ''}`}
      target="_blank"
      rel="noreferrer"
    >
      <div className="tool-card-content">
        <h3 className="tool-card-title">{tool.label}</h3>
        <p className="tool-card-description">{tool.description}</p>
      </div>
    </a>
  );
}

export default function ToolsSection({ id, standalone = false }: ToolsSectionProps) {
  const Wrapper = standalone ? 'main' : 'section';
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
    <Wrapper
      id={id}
      ref={sectionRef}
      className={`tools-showcase-section ${standalone ? 'tools-showcase-section--standalone' : 'tools-showcase-section--embedded'}`}
    >
      <div className="tools-showcase-container">
        {!standalone ? <div className="tools-showcase-spacer tools-showcase-spacer--top" aria-hidden="true" /> : null}

        <div className={`tools-showcase-header ${titleVisible ? 'visible' : ''}`}>
          <h2 className="tools-showcase-title">案发现场</h2>
          <p className="tools-showcase-subtitle">多维 Agent 矩阵的实时协作</p>
        </div>

        {!standalone ? <div className="tools-showcase-spacer tools-showcase-spacer--gap" aria-hidden="true" /> : null}

        <div className="tools-showcase-grid">
          {TOOL_SHOWCASE_ITEMS.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {!standalone ? <div className="tools-showcase-spacer tools-showcase-spacer--bottom" aria-hidden="true" /> : null}
      </div>
    </Wrapper>
  );
}
