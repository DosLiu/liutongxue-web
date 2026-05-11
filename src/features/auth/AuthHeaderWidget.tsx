import { useEffect, useRef, useState } from 'react';
import { useAuthEntryState } from './useAuthEntryState';

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

  const loginStatusText = isAuthenticated ? `已登录 · ${payload?.user?.loginType || '已连接'}` : statusLabel;
  const hintText = flash?.description || summaryText || payload?.message || '先体验 5 次，登录后每日 10 次。';

  return (
    <div ref={shellRef} className={`auth-header-widget${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`nav-link auth-header-widget__trigger${isOpen ? ' is-open' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="打开登录入口"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="auth-header-widget__trigger-label">登录</span>
        <span className="auth-header-widget__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <div className="auth-header-widget__popover" hidden={!isOpen}>
        <div className="auth-header-widget__panel" role="menu" aria-label="登录方式">
          <div className="auth-header-widget__panel-status">
            <span
              className={`auth-entry-card__status ${
                isAuthenticated ? 'auth-entry-card__status--success' : isLoading ? 'auth-entry-card__status--muted' : 'auth-entry-card__status--default'
              }`}
            >
              {loginStatusText}
            </span>
            {hintText ? <p className="auth-header-widget__summary">{hintText}</p> : null}
          </div>

          {isAuthenticated ? (
            <div className="auth-header-widget__signed-panel">
              <a href={payload?.logoutUrl} className="auth-header-widget__action auth-header-widget__action--secondary" role="menuitem">
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
                    role="menuitem"
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
