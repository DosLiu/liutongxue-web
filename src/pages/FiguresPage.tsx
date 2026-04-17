import { ArrowUpRight, Clock3 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import { sitePaths } from '../site';
import './FiguresPage.css';

type FigureEntry = {
  id: string;
  title: string;
  englishTitle: string;
  eyebrow: string;
  summary: string;
  status: string;
  note: string;
  href?: string;
  isPrimary?: boolean;
  avatarLabel: string;
};

const figureEntries: FigureEntry[] = [
  {
    id: 'steve-jobs',
    title: '乔布斯',
    englishTitle: 'Steve Jobs',
    eyebrow: '人物 01',
    summary: '聚焦产品判断、做减法与端到端体验。',
    status: '开放中',
    note: '进入人物对话',
    href: sitePaths.figuresSteveJobs,
    isPrimary: true,
    avatarLabel: 'SJ'
  },
  {
    id: 'figure-slot-02',
    title: '人物入口 02',
    englishTitle: 'Coming Soon',
    eyebrow: '人物 02',
    summary: '下一个人物入口正在准备中。',
    status: '即将上线',
    note: '暂未开放',
    avatarLabel: '02'
  },
  {
    id: 'figure-slot-03',
    title: '人物入口 03',
    englishTitle: 'Coming Soon',
    eyebrow: '人物 03',
    summary: '更多人物入口会在后续逐步开放。',
    status: '即将上线',
    note: '暂未开放',
    avatarLabel: '03'
  }
];

function FigureCard({ entry }: { entry: FigureEntry }) {
  const content = (
    <>
      <div className="figures-card__topline">
        <span className="figures-card__eyebrow">{entry.eyebrow}</span>
        <span className={`figures-card__status${entry.isPrimary ? ' figures-card__status--live' : ''}`}>
          {entry.isPrimary ? <ArrowUpRight size={14} strokeWidth={2} /> : <Clock3 size={14} strokeWidth={2} />}
          {entry.status}
        </span>
      </div>

      <div className={`figures-avatar${entry.isPrimary ? ' figures-avatar--jobs' : ''}`} aria-hidden="true">
        {entry.isPrimary ? (
          <>
            <span className="figures-avatar__silhouette" />
            <span className="figures-avatar__monogram">SJ</span>
          </>
        ) : (
          <span className="figures-avatar__slot">{entry.avatarLabel}</span>
        )}
      </div>

      <div className="figures-card__body">
        <h2 className="figures-card__title">{entry.title}</h2>
        <p className="figures-card__subtitle">{entry.englishTitle}</p>
        <p className="figures-card__summary">{entry.summary}</p>
      </div>

      <div className="figures-card__footer">
        <span className={`figures-card__pill${entry.isPrimary ? ' figures-card__pill--primary' : ''}`}>
          {entry.isPrimary ? '主入口' : '未开放条目'}
        </span>
        <span className="figures-card__note">{entry.note}</span>
      </div>
    </>
  );

  if (!entry.href) {
    return (
      <article className="figures-card figures-card--coming" aria-label={`${entry.title}，${entry.status}`}>
        {content}
      </article>
    );
  }

  return (
    <a className="figures-card figures-card--primary" href={entry.href} aria-label={`进入 ${entry.title} 人物入口`}>
      {content}
    </a>
  );
}

export default function FiguresPage() {
  return (
    <div className="figures-page">
      <SiteHeader activeKey={null} />

      <main className="figures-shell">
        <section className="figures-hero">
          <div>
            <span className="figures-kicker">人物入口</span>
            <h1 className="figures-title">选择角色</h1>
            <p className="figures-subtitle">当前开放 1 个角色入口，其余角色即将上线。</p>
          </div>

          <div className="figures-hero__meta" aria-label="入口状态">
            <span className="figures-hero__meta-pill">3 个入口</span>
            <span className="figures-hero__meta-pill figures-hero__meta-pill--live">1 个开放</span>
          </div>
        </section>

        <section className="figures-grid" aria-label="人物入口列表">
          {figureEntries.map((entry) => (
            <FigureCard key={entry.id} entry={entry} />
          ))}
        </section>
      </main>
    </div>
  );
}
