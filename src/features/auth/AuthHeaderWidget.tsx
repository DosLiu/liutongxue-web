import { useEffect, useRef, useState } from 'react';
import { useAuthEntryState } from './useAuthEntryState';

export default function AuthHeaderWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, isPrimaryActionDisabled, loginProviders, payload } = useAuthEntryState();

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

        </div>
      </div>
    </div>
  );
}
