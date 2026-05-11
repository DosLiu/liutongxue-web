import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getAccountMonogram,
  getCompactDisplayName,
  useAuthEntryState
} from './useAuthEntryState';

export default function AuthHeaderWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const { flash, isAuthenticated, isLoading, isPrimaryActionDisabled, loginProviders, payload, statusLabel, summaryText } = useAuthEntryState();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!shellRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const accountMonogram = useMemo(() => getAccountMonogram(payload?.user?.displayName), [payload?.user?.displayName]);
  const compactDisplayName = useMemo(() => getCompactDisplayName(payload?.user?.displayName), [payload?.user?.displayName]);
  const providerLabelText = loginProviders.map((provider) => provider.actionLabel).join(' / ');
  const helperText = isAuthenticated
    ? summaryText
    : payload?.loginReady
      ? providerLabelText || '登录后每日 10 次'
      : '先体验 5 次，登录后每日 10 次';

  return (
    <div ref={shellRef} className={`auth-header-widget${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`auth-header-widget__trigger${isAuthenticated ? ' is-authenticated' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isAuthenticated ? `${compactDisplayName} 账户入口` : '打开登录入口'}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isAuthenticated ? (
          <>
            <span className="auth-header-widget__avatar" aria-hidden="true">
              {payload?.user?.avatarUrl ? <img src={payload.user.avatarUrl} alt="" loading="lazy" /> : <span>{accountMonogram}</span>}
            </span>
            <span className="auth-header-widget__trigger-copy">
              <span className="auth-header-widget__trigger-label">{compactDisplayName}</span>
              <span className="auth-header-widget__trigger-meta">{helperText}</span>
            </span>
          </>
        ) : (
          <>
            <span className="auth-header-widget__status-dot" aria-hidden="true" />
            <span className="auth-header-widget__trigger-copy">
              <span className="auth-header-widget__trigger-label">登录</span>
              <span className="auth-header-widget__trigger-meta">{helperText}</span>
            </span>
          </>
        )}
        <span className="auth-header-widget__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <div className="auth-header-widget__popover" hidden={!isOpen}>
        <div className="auth-header-widget__panel">
          <div className="auth-header-widget__panel-head">
            <div>
              <p className="auth-header-widget__panel-title">{isAuthenticated ? compactDisplayName : '人物页登录入口'}</p>
              <p className="auth-header-widget__panel-subtitle">{isAuthenticated ? '当前账号状态正常，可继续体验人物对话。' : '先体验 5 次，登录后每日 10 次。'}</p>
            </div>
            <span className={`auth-entry-card__status ${
              isAuthenticated ? 'auth-entry-card__status--success' : isLoading ? 'auth-entry-card__status--muted' : 'auth-entry-card__status--default'
            }`}>
              {statusLabel}
            </span>
          </div>

          {flash ? <p className={`auth-entry-card__flash auth-entry-card__flash--${flash.tone}`}>{flash.description}</p> : null}

          <p className="auth-header-widget__summary">{summaryText || payload?.message || '先体验 5 次，登录后每日 10 次。'}</p>

          {isAuthenticated ? (
            <div className="auth-header-widget__signed-panel">
              <div className="auth-header-widget__identity">
                <span className="auth-header-widget__identity-label">登录方式</span>
                <span className="auth-header-widget__identity-value">{payload?.user?.loginType || '已连接'}</span>
              </div>
              <a href={payload?.logoutUrl} className="auth-header-widget__action auth-header-widget__action--secondary">
                退出登录
              </a>
            </div>
          ) : (
            <div className="auth-header-widget__actions">
              {loginProviders.length ? (
                loginProviders.map((provider) => (
                  <a
                    key={provider.type}
                    href={isPrimaryActionDisabled ? undefined : provider.href}
                    className={`auth-header-widget__action auth-header-widget__action--primary${isPrimaryActionDisabled ? ' is-disabled' : ''}`}
                    aria-disabled={isPrimaryActionDisabled}
                    onClick={(event) => {
                      if (isPrimaryActionDisabled) {
                        event.preventDefault();
                      }
                    }}
                  >
                    {provider.actionLabel}
                  </a>
                ))
              ) : (
                <span className="auth-header-widget__action auth-header-widget__action--secondary is-disabled">登录入口暂不可用</span>
              )}
            </div>
          )}

          {payload?.missingEnv?.length ? <p className="auth-header-widget__footnote">登录服务配置中</p> : null}
        </div>
      </div>
    </div>
  );
}
