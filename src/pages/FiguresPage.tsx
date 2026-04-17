import SiteHeader from '../components/SiteHeader';
import steveJobsAvatar from '../assets/figures/steve-jobs.jpg';
import { sitePaths } from '../site';
import './FiguresPage.css';

type FigureEntry = {
  id: string;
  name: string;
  avatarLabel: string;
  avatarImageSrc?: string;
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
    id: 'figure-slot-02',
    name: '人物 02',
    avatarLabel: '02'
  },
  {
    id: 'figure-slot-03',
    name: '人物 03',
    avatarLabel: '03'
  }
];

function FigureEntryItem({ entry }: { entry: FigureEntry }) {
  const content = (
    <>
      <div
        className={`figures-entry__avatar${entry.avatarImageSrc ? ' figures-entry__avatar--image' : ''}`}
        style={entry.avatarImageSrc ? { backgroundImage: `url(${entry.avatarImageSrc})` } : undefined}
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
          <h1 id="figures-title" className="figures-title">
            和不同的人物聊一聊
          </h1>
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
