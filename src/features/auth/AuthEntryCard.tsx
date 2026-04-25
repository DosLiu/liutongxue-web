import { useEffect, useMemo, useState } from 'react';

type AuthPayload = {
  authenticated: boolean;
  dailyLimit: number;
  loginProviders: Array<{
    label: string;
    type: string;
    url: string;
  }>;
  loginReady: boolean;
  loginUrl: string;
  logoutUrl: string;
  message: string;
  missingEnv: string[];
  provider: 'daen';
  status: 'disabled' | 'signed_out' | 'authenticated';
  user: null | {
    avatarUrl?: string;
    displayName: string;
    expiresAt: string;
    issuedAt: string;
    loginType: string;
    provider: 'daen';
    storage: string;
    subject: string;
  };
};

type FlashState = {
  description: string;
  tone: 'info' | 'warning';
} | null;

const getFlashState = (): FlashState => {
  const params = new URLSearchParams(window.location.search);
  const authState = params.get('auth');

  if (authState === 'signed-in') {
    return {
      description: '登录成功，可以继续对话',
      tone: 'info'
    };
  }

  if (authState === 'auth-error') {
    return {
      description: '登录暂未完成，请稍后重试。',
      tone: 'warning'
    };
  }

  if (authState === 'signed-out') {
    return {
      description: '已退出当前账号。',
      tone: 'info'
    };
  }

  return null;
};

const formatExpiry = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN');
};

const getStatusLabel = (status?: AuthPayload['status'], isLoading?: boolean) => {
  if (isLoading) {
    return '检查中';
  }

  if (status === 'authenticated') {
    return '已登录';
  }

  if (status === 'signed_out') {
    return '登录状态';
  }

  return '暂不可用';
};

export default function AuthEntryCard() {
  const [payload, setPayload] = useState<AuthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let aborted = false;

    const loadAuthState = async () => {
      try {
        const response = await fetch('/api/daen?route=me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`auth_me_${response.status}`);
        }

        const data = (await response.json()) as AuthPayload;
        if (!aborted) {
          setPayload(data);
          setErrorMessage('');
        }
      } catch {
        if (!aborted) {
          setPayload(null);
          setErrorMessage('暂时无法确认登录状态，请稍后刷新重试。');
        }
      } finally {
        if (!aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadAuthState();

    return () => {
      aborted = true;
    };
  }, []);

  const flash = useMemo(() => getFlashState(), []);
  const statusLabel = getStatusLabel(payload?.status, isLoading);
  const statusTone =
    payload?.status === 'authenticated'
      ? 'auth-entry-card__status--success'
      : payload?.status === 'signed_out'
        ? 'auth-entry-card__status--default'
        : 'auth-entry-card__status--muted';
  const isAuthenticated = payload?.status === 'authenticated' && Boolean(payload.user);
  const isPrimaryActionDisabled = isLoading || (!payload?.loginReady && payload?.status !== 'authenticated');
  const returnTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/figures/';
  const summaryText = errorMessage
    ? errorMessage
    : isAuthenticated
      ? '已登录，可继续使用对话功能。'
      : payload?.missingEnv?.length
        ? '登录入口暂不可用。'
        : '登录后可使用对话功能。';

  return (
    <aside className="auth-entry-card" aria-labelledby="auth-entry-title">
      <div className="auth-entry-card__header">
        <div className="auth-entry-card__header-main">
          <h2 id="auth-entry-title" className="auth-entry-card__title">
            {isAuthenticated && payload?.user ? payload.user.displayName : '登录后可使用对话'}
          </h2>
        </div>
        <span className={`auth-entry-card__status ${statusTone}`}>{statusLabel}</span>
      </div>

      {flash ? <p className={`auth-entry-card__flash auth-entry-card__flash--${flash.tone}`}>{flash.description}</p> : null}

      <div className="auth-entry-card__actions">
        {isAuthenticated ? (
          <a href={payload?.logoutUrl} className="auth-entry-card__button auth-entry-card__button--primary">
            退出登录
          </a>
        ) : (
          payload?.loginProviders?.map((provider) => {
            const href = `${provider.url}&return_to=${encodeURIComponent(returnTo)}`;
            const actionLabel = provider.type === 'qq' ? 'QQ登录' : provider.type === 'baidu' ? '百度登录' : provider.label.replace(/\s+/g, '');

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
