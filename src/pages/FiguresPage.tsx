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

type FigureEntryCategory = 'figure' | 'role';

type FigureEntry = {
  id: string;
  category: FigureEntryCategory;
  name: string;
  avatarLabel?: string;
  avatarImageSrc?: string;
  avatarImagePosition?: string;
  avatarImageSize?: string;
  href: string;
  ariaLabel?: string;
};

type FigureEntrySection = {
  ariaLabel: string;
  category: FigureEntryCategory;
  className?: string;
};

const figureEntries: FigureEntry[] = [
  {
    id: 'steve-jobs',
    category: 'figure',
    name: '乔布斯',
    avatarLabel: 'SJ',
    avatarImageSrc: steveJobsAvatar,
    href: sitePaths.figuresSteveJobs
  },
  {
    id: 'elon-musk',
    category: 'figure',
    name: '马斯克',
    avatarLabel: 'EM',
    avatarImageSrc: elonMuskAvatar,
    avatarImagePosition: 'center 18%',
    href: sitePaths.figuresElonMusk
  },
  {
    id: 'zhang-yiming',
    category: 'figure',
    name: '张一鸣',
    avatarLabel: 'ZY',
    avatarImageSrc: zhangYimingAvatar,
    avatarImagePosition: '46% 27%',
    avatarImageSize: '178%',
    href: sitePaths.figuresZhangYiming
  },
  {
    id: 'customer-service',
    category: 'role',
    name: '客服助理',
    avatarLabel: '客服',
    avatarImageSrc: customerServiceAvatar,
    href: sitePaths.figuresCustomerService,
    ariaLabel: '进入 客服助理 岗位入口'
  },
  {
    id: 'sales-assistant',
    category: 'role',
    name: '销售助理',
    avatarLabel: '销售',
    avatarImageSrc: salesAssistantAvatar,
    href: sitePaths.figuresSalesAssistant,
    ariaLabel: '进入 销售助理 岗位入口'
  },
  {
    id: 'video-script-assistant',
    category: 'role',
    name: '口播短视频助理',
    avatarLabel: '口播',
    avatarImageSrc: videoScriptAssistantAvatar,
    href: sitePaths.figuresVideoScriptAssistant,
    ariaLabel: '进入 口播短视频助理 岗位入口'
  }
];

const figureEntrySections: FigureEntrySection[] = [
  {
    ariaLabel: '人物入口列表',
    category: 'figure'
  },
  {
    ariaLabel: '岗位头像入口列表',
    category: 'role',
    className: 'figures-grid--role-placeholders'
  }
];

const [figureSection, roleSection] = figureEntrySections;
const getFigureEntries = (category: FigureEntryCategory) => figureEntries.filter((entry) => entry.category === category);

function FigureEntryItem({ entry }: { entry: FigureEntry }) {
  return (
    <a
      className="figures-entry figures-entry--active"
      href={entry.href}
      aria-label={entry.ariaLabel ?? `进入 ${entry.name} ${entry.category === 'role' ? '岗位' : '人物'}入口`}
    >
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
      <h2 className="figures-entry__name">{entry.name}</h2>
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

        <section className="figures-grid" aria-label={figureSection.ariaLabel}>
          {getFigureEntries(figureSection.category).map((entry) => (
            <FigureEntryItem key={entry.id} entry={entry} />
          ))}
        </section>

        <section className="figures-role-intro" aria-labelledby="figures-role-intro-title">
          <h2 id="figures-role-intro-title" className="figures-role-intro__title">
            你的AI岗位搭子
          </h2>
          <p className="figures-role-intro__subtitle">精选不同岗位的AI专家分身，随时陪你拆战略、想内容、做增长</p>
        </section>

        <section className={`figures-grid ${roleSection.className ?? ''}`.trim()} aria-label={roleSection.ariaLabel}>
          {getFigureEntries(roleSection.category).map((entry) => (
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
