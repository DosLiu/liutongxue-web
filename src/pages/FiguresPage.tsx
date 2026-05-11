import SiteHeader from '../components/SiteHeader';
import steveJobsAvatar from '../assets/figures/steve-jobs.jpg';
import elonMuskAvatar from '../assets/figures/elon-musk.jpg';
import zhangYimingAvatar from '../assets/figures/zhang-yiming.jpg';
import customerServiceAvatar from '../assets/figures/customer-service.png';
import salesAssistantAvatar from '../assets/figures/sales-assistant.png';
import videoScriptAssistantAvatar from '../assets/figures/video-script-assistant.png';
import AuthEntryCard from '../features/auth/AuthEntryCard';
import { sitePaths } from '../site';
import './FiguresPage.css';

type FigureEntry = {
  id: string;
  name?: string;
  avatarLabel?: string;
  avatarImageSrc?: string;
  avatarImagePosition?: string;
  avatarImageSize?: string;
  href?: string;
  ariaLabel?: string;
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

const roleEntries: FigureEntry[] = [
  {
    id: 'customer-service',
    name: '客服助理',
    avatarLabel: '客服',
    avatarImageSrc: customerServiceAvatar,
    href: sitePaths.figuresCustomerService,
    ariaLabel: '进入 客服助理 岗位入口'
  },
  {
    id: 'sales-assistant',
    name: '销售助理',
    avatarLabel: '销售',
    avatarImageSrc: salesAssistantAvatar,
    href: sitePaths.figuresSalesAssistant,
    ariaLabel: '进入 销售助理 岗位入口'
  },
  {
    id: 'video-script-assistant',
    name: '口播短视频助理',
    avatarLabel: '口播',
    avatarImageSrc: videoScriptAssistantAvatar,
    href: sitePaths.figuresVideoScriptAssistant,
    ariaLabel: '进入 口播短视频助理 岗位入口'
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
        {!entry.avatarImageSrc && entry.avatarLabel ? <span className="figures-entry__avatar-label">{entry.avatarLabel}</span> : null}
      </div>
      {entry.name ? <h2 className="figures-entry__name">{entry.name}</h2> : null}
    </>
  );

  if (!entry.href) {
    return (
      <article className="figures-entry figures-entry--placeholder" aria-label={entry.ariaLabel ?? `${entry.name ?? '岗位头像占位'}，暂未开放`}>
        {content}
      </article>
    );
  }

  return (
    <a className="figures-entry figures-entry--active" href={entry.href} aria-label={entry.ariaLabel ?? `进入 ${entry.name} 人物入口`}>
      {content}
    </a>
  );
}

export default function FiguresPage() {
  return (
    <div className="figures-page">
      <SiteHeader activeKey="figures" />

      <main className="figures-shell">
        <section className="figures-hero" aria-labelledby="figures-title">
          <div className="figures-hero__content">
            <h1 id="figures-title" className="figures-title">
              顶级思维面对面
            </h1>
            <p className="figures-subtitle">与行业传奇，展开一场跨时空的深度对话</p>
            <p className="figures-auth-hint">先体验 5 次，登录后每日 10 次</p>
          </div>

          <div className="figures-hero__auth">
            <AuthEntryCard />
          </div>
        </section>

        <section className="figures-grid" aria-label="人物入口列表">
          {figureEntries.map((entry) => (
            <FigureEntryItem key={entry.id} entry={entry} />
          ))}
        </section>

        <section className="figures-role-intro" aria-labelledby="figures-role-intro-title">
          <h2 id="figures-role-intro-title" className="figures-role-intro__title">
            你的AI岗位搭子
          </h2>
          <p className="figures-role-intro__subtitle">精选不同岗位的AI专家分身，随时陪你拆战略、想内容、做增长</p>
        </section>

        <section className="figures-grid figures-grid--role-placeholders" aria-label="岗位头像入口列表">
          {roleEntries.map((entry) => (
            <FigureEntryItem key={entry.id} entry={entry} />
          ))}
        </section>

        <section className="figures-mobile-auth" aria-label="登录入口">
          <AuthEntryCard />
        </section>
      </main>
    </div>
  );
}
