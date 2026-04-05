import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import './TestimonialsSection.css';

type Tweet = {
  id: number;
  avatar: string;
  text: string;
  handle: string;
  url: string;
};

type MarqueeDirection = 'left' | 'right';

const tweets: Tweet[] = [
  {
    id: 1,
    avatar: 'https://pbs.twimg.com/profile_images/1794450494686932992/wqRqF4dt_400x400.jpg',
    text: 'Really impressed by https://reactbits.dev. Check it out. The Splash Cursor effect is amazing.',
    handle: '@makwanadeepam',
    url: 'https://x.com/makwanadeepam/status/1879416558461890864'
  },
  {
    id: 2,
    avatar: 'https://pbs.twimg.com/profile_images/1918646280223608832/nqBF4zh__400x400.jpg',
    text: 'Just discovered http://reactbits.dev — a sleek, minimal, and super dev-friendly React component library. Clean UI, easy to use, and perfect for modern projects.',
    handle: '@syskey_dmg',
    url: 'https://x.com/syskey_dmg/status/1929762648922398754'
  },
  {
    id: 3,
    avatar: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    text: 'Everything about this is next level: the components, the registry, dynamic items.',
    handle: '@shadcn',
    url: 'https://x.com/shadcn/status/1962854085587275932'
  },
  {
    id: 4,
    avatar: 'https://pbs.twimg.com/profile_images/1722358890807861248/75S7CB3G_400x400.jpg',
    text: 'React Bits: A stellar collection of React components to make your landing pages shine ✨',
    handle: '@gregberge_',
    url: 'https://x.com/gregberge_/status/1896425347866059041'
  },
  {
    id: 5,
    avatar: 'https://pbs.twimg.com/profile_images/1554006663853592576/Gxtolzbo_400x400.jpg',
    text: 'Literally the coolest react library in react -',
    handle: '@Logreg_n_coffee',
    url: 'https://x.com/Logreg_n_coffee/status/1889573533425991992'
  },
  {
    id: 6,
    avatar: 'https://pbs.twimg.com/profile_images/1880284612062056448/4Y2C8Xnv_400x400.jpg',
    text: 'Have you heard of react bits? David Haz has lovingly put together a collection of animated and fully customizable React components.',
    handle: '@DIYDevs',
    url: 'https://x.com/DIYDevs/status/1892964440900763761'
  },
  {
    id: 7,
    avatar: 'https://pbs.twimg.com/profile_images/1724192049002340352/-tood-4D_400x400.jpg',
    text: 'React Bits has got to be the most artistic ui component lib I have seen in a while 🤌',
    handle: '@GibsonSMurray',
    url: 'https://x.com/GibsonSMurray/status/1889909058838339626'
  },
  {
    id: 8,
    avatar: 'https://pbs.twimg.com/profile_images/1920165535351742464/CJU2uWMU_400x400.jpg',
    text: 'Got to know about React Bits and its just wow, the components are incredibly well designed! Really loved the overall feel and quality.',
    handle: '@irohandev',
    url: 'https://x.com/irohandev/status/1934877463064268822'
  },
  {
    id: 9,
    avatar: 'https://pbs.twimg.com/profile_images/1756766826736893952/6Gvg6jha_400x400.jpg',
    text: "React Bits has become the ultimate visual animation library for React. This level of flexibility doesn't exist anywhere else.",
    handle: '@orcdev',
    url: 'https://x.com/orcdev/status/2005627805938422123?s=20'
  },
  {
    id: 10,
    avatar: 'https://pbs.twimg.com/profile_images/1957717329397141507/7ctDgOuc_400x400.jpg',
    text: 'The next shadcn is emerging this year 🙌',
    handle: 'ajaypatel_aj',
    url: 'https://x.com/ajaypatel_aj/status/2006990484045193652?s=20'
  }
];

const REPEAT_COUNT = 2;
const MARQUEE_BASE_PX_PER_SECOND = 24;

const TweetCard = memo(({ tweet }: { tweet: Tweet }) => {
  return (
    <a
      className="testimonial-card"
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open testimonial from ${tweet.handle}`}
    >
      <p className="testimonial-text">{tweet.text}</p>
      <div className="testimonial-author">
        <img src={tweet.avatar} alt="" className="testimonial-avatar" loading="lazy" decoding="async" />
        <span className="testimonial-handle">{tweet.handle}</span>
      </div>
    </a>
  );
});

TweetCard.displayName = 'TweetCard';

function MarqueeRow({ tweets, direction = 'left', speed = 3 }: { tweets: Tweet[]; direction?: MarqueeDirection; speed?: number }) {
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
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-container">
        <div ref={headerRef} className={`testimonials-header ${titleVisible ? 'visible' : ''}`}>
          <h2 id="testimonials-title" className="testimonials-title">
            Loved by devs worldwide
          </h2>
          <p className="testimonials-subtitle">See what developers are saying about React Bits</p>
        </div>

        <div className="testimonials-marquee-container">
          <MarqueeRow tweets={tweets.slice(0, 4)} direction="left" speed={2.5} />
          <MarqueeRow tweets={tweets.slice(4, 7)} direction="right" speed={3} />
          <MarqueeRow tweets={tweets.slice(7, 10)} direction="left" speed={3.5} />
        </div>
      </div>
    </section>
  );
}
