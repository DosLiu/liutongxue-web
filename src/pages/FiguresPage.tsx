import SiteHeader from '../components/SiteHeader';
import steveJobsAvatar from '../assets/figures/steve-jobs.jpg';
import elonMuskAvatar from '../assets/figures/elon-musk.jpg';
import zhangYimingAvatar from '../assets/figures/zhang-yiming.jpg';
import { sitePaths } from '../site';
import './FiguresPage.css';

type FigureEntry = {
  id: string;
  name: string;
  avatarLabel?: string;
  avatarImageSrc?: string;
  avatarImagePosition?: string;
  avatarImageSize?: string;
  href: string;
};

const figureEntries: FigureEntry[] = [
  {
    id: 'steve-jobs',
    name: '乔布斯',
    avatarLabel: 'SJ',
    avatarImageSrc: steveJobsAvatar,
    href: sitePaths.figuresSteveJobs
  },
  {
    id: 'elon-musk',
    name: '马斯克',
    avatarLabel: 'EM',
    avatarImageSrc: elonMuskAvatar,
    avatarImagePosition: 'center 18%',
    href: sitePaths.figuresElonMusk
  },
  {
    id: 'zhang-yiming',
    name: '张一鸣',
    avatarLabel: 'ZY',
    avatarImageSrc: zhangYimingAvatar,
    avatarImagePosition: '46% 27%',
    avatarImageSize: '178%',
    href: sitePaths.figuresZhangYiming
  }
];

function FigureEntryItem({ entry }: { entry: FigureEntry }) {
  return (
    <a
      className="figures-entry figures-entry--active"
      href={entry.href}
      aria-label={`进入 ${entry.name} 人物入口`}
    >
      <div className="figures-entry__visual-shell">
        <div className="figures-entry__glow-backdrop" aria-hidden="true" />
        <div
          className={`figures-entry__avatar${entry.avatarImageSrc ? ' figures-entry__avatar--image' : ''}`}
          style={
            entry.avatarImageSrc
              ? {
                  backgroundImage: `url(${entry.avatarImageSrc})`,
                  backgroundPosition: entry.avatarImagePosition ?? 'center',
                  backgroundSize: entry.avatarImageSize ?? 'cover'
                }
              : undefined
          }
          aria-hidden="true"
        >
          {!entry.avatarImageSrc && entry.avatarLabel ? <span className="figures-entry__avatar-label">{entry.avatarLabel}</span> : null}
        </div>
      </div>
      <h2 className="figures-entry__name">{entry.name}</h2>
    </a>
  );
}

export default function FiguresPage() {
  return (
    <div className="figures-page">
      <SiteHeader activeKey="figures" />

      <main className="figures-shell">
        {/* 宇宙环境星云微光 */}
        <div className="figures-ambient-haze" aria-hidden="true" />

        <section className="figures-hero" aria-labelledby="figures-title">
          <div className="figures-hero__content">
            <h1 id="figures-title" className="figures-title">
              顶级思维面对面
            </h1>
            <p className="figures-subtitle">与行业传奇，展开一场跨时空的深度对话</p>
            <p className="figures-auth-hint">游客可体验 5 次对话</p>
          </div>
        </section>

        <section className="figures-grid" aria-label="人物入口列表">
          {figureEntries.map((entry) => (
            <FigureEntryItem key={entry.id} entry={entry} />
          ))}
        </section>

        <section className="figures-digital-intro" aria-labelledby="figures-digital-intro-title">
          <h2 id="figures-digital-intro-title" className="figures-digital-intro__title">
            一个持续进化中的我
          </h2>
          <p className="figures-digital-intro__subtitle">把我走过的路，和想过的事，跨越时空与你交谈</p>

          <a className="figures-entry figures-entry--active figures-digital-placeholder" href={sitePaths.figuresLiuDongsheng} aria-label="进入刘同学的数字分身对话">
            <div className="figures-entry__visual-shell" aria-hidden="true">
              <div className="figures-entry__glow-backdrop" />
              <div className="figures-entry__avatar figures-digital-placeholder__avatar">
                <svg className="figures-digital-placeholder__icon" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="22" r="10" />
                  <path d="M13 53c1.8-9.7 8.9-15 19-15s17.2 5.3 19 15" />
                </svg>
              </div>
            </div>
            <span className="figures-entry__name">刘同学</span>
          </a>
        </section>
      </main>
    </div>
  );
}
