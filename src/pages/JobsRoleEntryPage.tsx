import SiteHeader from '../components/SiteHeader';
import { sitePaths } from '../site';
import './JobsRoleEntryPage.css';

type RoleCard = {
  id: string;
  name: string;
  avatarText: string;
  href?: string;
  disabled?: boolean;
};

const roleCards: RoleCard[] = [
  {
    id: 'steve-jobs',
    name: '乔布斯',
    avatarText: '乔',
    href: sitePaths.jobsChatSteveJobs
  },
  {
    id: 'coming-soon-1',
    name: '即将上线',
    avatarText: '待',
    disabled: true
  },
  {
    id: 'coming-soon-2',
    name: '即将上线',
    avatarText: '待',
    disabled: true
  }
];

function RoleCardItem({ card }: { card: RoleCard }) {
  const cardClassName = `jobs-role-card${card.disabled ? ' jobs-role-card--disabled' : ''}`;
  const content = (
    <>
      <div className="jobs-role-card__avatar" aria-hidden="true">
        <span>{card.avatarText}</span>
      </div>
      <div className="jobs-role-card__name">{card.name}</div>
    </>
  );

  if (card.href && !card.disabled) {
    return (
      <a href={card.href} className={cardClassName}>
        {content}
      </a>
    );
  }

  return (
    <div className={cardClassName} aria-disabled="true">
      {content}
    </div>
  );
}

export default function JobsRoleEntryPage() {
  return (
    <>
      <SiteHeader activeKey="contact" />

      <main className="jobs-role-page">
        <div className="jobs-role-page__ambient jobs-role-page__ambient--left" aria-hidden="true" />
        <div className="jobs-role-page__ambient jobs-role-page__ambient--right" aria-hidden="true" />
        <div className="jobs-role-page__grid" aria-hidden="true" />

        <div className="jobs-role-shell">
          <section className="jobs-role-hero" aria-labelledby="jobs-role-title">
            <p className="jobs-role-eyebrow">人物入口</p>
            <h1 id="jobs-role-title" className="jobs-role-title">
              选择角色
            </h1>
          </section>

          <section className="jobs-role-list" aria-label="角色入口列表">
            {roleCards.map((card) => (
              <RoleCardItem key={card.id} card={card} />
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
