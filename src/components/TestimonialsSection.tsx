import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { TESTIMONIALS, type TestimonialItem } from '../constants/testimonials';
import './TestimonialsSection.css';

type MarqueeDirection = 'left' | 'right';

const REPEAT_COUNT = 2;
const MARQUEE_BASE_PX_PER_SECOND = 24;

const TweetCard = memo(({ tweet }: { tweet: TestimonialItem }) => {
  return (
    <div className="testimonial-card" aria-label={`Testimonial from ${tweet.handle}`}>
      <p className="testimonial-text">{tweet.text}</p>
      <div className="testimonial-author">
        <span className="testimonial-handle">{tweet.handle}</span>
      </div>
    </div>
  );
});

TweetCard.displayName = 'TweetCard';

function MarqueeRow({ tweets, direction = 'left', speed = 3 }: { tweets: TestimonialItem[]; direction?: MarqueeDirection; speed?: number }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const firstGroupRef = useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const row = rowRef.current;
    const firstGroup = firstGroupRef.current;
    if (!row || !firstGroup) return;

    const measure = () => {
      const rowStyles = window.getComputedStyle(row);
      const gap = parseFloat(rowStyles.getPropertyValue('--testimonial-marquee-gap')) || 20;
      const nextDistance = firstGroup.getBoundingClientRect().width + gap;
      setDistance((prevDistance) => (Math.abs(prevDistance - nextDistance) < 0.5 ? prevDistance : nextDistance));
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(row);
    resizeObserver.observe(firstGroup);

    measure();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const duration = distance > 0 ? distance / (speed * MARQUEE_BASE_PX_PER_SECOND) : 0;

  return (
    <div ref={rowRef} className="testimonial-row">
      <div className="testimonial-track-viewport">
        <div
          className={`testimonial-track testimonial-track--${direction}`}
          style={
            {
              '--testimonial-marquee-distance': `${distance}px`,
              '--testimonial-marquee-duration': `${duration}s`
            } as CSSProperties
          }
        >
          {Array.from({ length: REPEAT_COUNT }, (_, index) => (
            <div
              key={`testimonial-group-${direction}-${speed}-${index}`}
              ref={index === 0 ? firstGroupRef : undefined}
              className="testimonial-track-group"
              aria-hidden={index > 0}
            >
              {tweets.map((tweet) => (
                <TweetCard key={`${index}-${tweet.id}`} tweet={tweet} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [titleVisible, setTitleVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef} className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-container">
        <div className={`testimonials-header ${titleVisible ? 'visible' : ''}`}>
          <h2 id="testimonials-title" className="testimonials-title">
            数智灵言
          </h2>
        </div>

        <div className="testimonials-marquee-container">
          <MarqueeRow tweets={TESTIMONIALS.slice(0, 4)} direction="left" speed={2.5} />
          <MarqueeRow tweets={TESTIMONIALS.slice(4, 7)} direction="right" speed={3} />
          <MarqueeRow tweets={TESTIMONIALS.slice(7, 10)} direction="left" speed={3.5} />
        </div>
      </div>
    </section>
  );
}
