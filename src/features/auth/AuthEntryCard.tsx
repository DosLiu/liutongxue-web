import { useAuthEntryState } from './useAuthEntryState';

export default function AuthEntryCard() {
  const { flash, isAuthenticated, isPrimaryActionDisabled, loginProviders, payload, returnTo, statusLabel, statusTone, summaryText } =
    useAuthEntryState();

  return (
    <aside className="auth-entry-card" aria-labelledby="auth-entry-title">
      <div className="auth-entry-card__header">
        <div className="auth-entry-card__header-main">
          <h2 id="auth-entry-title" className="auth-entry-card__title">
            {isAuthenticated && payload?.user ? payload.user.displayName : '先体验 5 次'}
          </h2>
        </div>
        <span className={`auth-entry-card__status ${statusTone}`}>{statusLabel}</span>
      </div>

      {flash ? <p className={`auth-entry-card__flash auth-entry-card__flash--${flash.tone}`}>{flash.description}</p> : null}
      <p className="auth-entry-card__description">{summaryText || payload?.message || '先体验 5 次，登录后每日 10 次。'}</p>

      <div className="auth-entry-card__actions">
        {isAuthenticated ? (
          <a href={payload?.logoutUrl} className="auth-entry-card__button auth-entry-card__button--primary">
            退出登录
          </a>
        ) : (
          loginProviders.map((provider) => {
            const href = provider.href || `${provider.url}&return_to=${encodeURIComponent(returnTo)}`;
            const actionLabel = provider.actionLabel;

            return (
              <a
                key={provider.type}
                href={isPrimaryActionDisabled ? undefined : href}
                className={`auth-entry-card__button auth-entry-card__button--primary${isPrimaryActionDisabled ? ' is-disabled' : ''}`}
                aria-disabled={isPrimaryActionDisabled}
                onClick={(event) => {
                  if (isPrimaryActionDisabled) {
                    event.preventDefault();
                  }
                }}
              >
                {actionLabel}
              </a>
            );
          })
        )}
      </div>

      {payload?.missingEnv?.length ? (
        <div className="auth-entry-card__footer">
          <p className="auth-entry-card__footnote">登录服务配置中</p>
        </div>
      ) : null}
    </aside>
  );
}
