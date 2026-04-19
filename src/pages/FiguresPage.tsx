import SiteHeader from '../components/SiteHeader';
import steveJobsAvatar from '../assets/figures/steve-jobs.jpg';
import elonMuskAvatar from '../assets/figures/elon-musk.jpg';
import zhangYimingAvatar from '../assets/figures/zhang-yiming.jpg';
import { sitePaths } from '../site';
import './FiguresPage.css';

type FigureEntry = {
  id: string;
  name: string;
  avatarLabel: string;
  avatarImageSrc?: string;
  avatarImagePosition?: string;
  avatarImageSize?: string;
  href?: string;
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
    avatarImagePosition: '46% 22%',
    avatarImageSize: '178%',
    href: sitePaths.figuresZhangYiming
  }
];

function FigureEntryItem({ entry }: { entry: FigureEntry }) {
  const content = (
    <>
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
        {!entry.avatarImageSrc ? <span className="figures-entry__avatar-label">{entry.avatarLabel}</span> : null}
      </div>
      <h2 className="figures-entry__name">{entry.name}</h2>
    </>
  );

  if (!entry.href) {
    return (
      <article className="figures-entry figures-entry--placeholder" aria-label={`${entry.name}，暂未开放`}>
        {content}
      </article>
    );
  }

  return (
    <a className="figures-entry figures-entry--active" href={entry.href} aria-label={`进入 ${entry.name} 人物入口`}>
      {content}
    </a>
  );
}

export default function FiguresPage() {
  return (
    <div className="figures-page">
      <SiteHeader activeKey={null} />

      <main className="figures-shell">
        <section className="figures-hero" aria-labelledby="figures-title">
          <div className="figures-hero__content">
            <h1 id="figures-title" className="figures-title">
              顶级思维面对面
            </h1>
            <p className="figures-subtitle">与行业传奇，展开一场跨时空的深度对话</p>
          </div>
        </section>

        <section className="figures-grid" aria-label="人物入口列表">
          {figureEntries.map((entry) => (
            <FigureEntryItem key={entry.id} entry={entry} />
          ))}
        </section>
      </main>
    </div>
  );
}
