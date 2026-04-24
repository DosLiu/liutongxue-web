import { useEffect, useMemo, useState } from 'react';

type AuthPayload = {
  authenticated: boolean;
  loginReady: boolean;
  loginUrl: string;
  logoutUrl: string;
  message: string;
  missingEnv: string[];
  provider: 'daen';
  status: 'disabled' | 'signed_out' | 'authenticated';
  user: null | {
    displayName: string;
    expiresAt: string;
    issuedAt: string;
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

  if (authState === 'callback-ready') {
    return {
      description: '回调链路已经回站。下一步补 token exchange、userinfo 和 KV session。',
      tone: 'info'
    };
  }

  if (authState === 'auth-error') {
    const providerError = params.get('provider_error');
    return {
      description: providerError ? `大恩侧返回错误：${providerError}` : '登录回调返回了错误，请继续补 provider 配置。',
      tone: 'warning'
    };
  }

  if (authState === 'signed-out') {
    return {
      description: '本地 session 已清理。后续如果启用 KV，会在 logout 一起删掉服务端态。',
      tone: 'info'
    };
  }

  return null;
};

const formatExpiry = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN');
};

export default function AuthEntryCard() {
  const [payload, setPayload] = useState<AuthPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let aborted = false;

    const loadAuthState = async () => {
      try {
        const response = await fetch('/api/auth/me', {
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
      } catch (error) {
        if (!aborted) {
          setPayload(null);
          setErrorMessage('认证骨架已挂上，但当前还没拿到 /api/auth/me 返回。');
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
  const statusLabel =
    isLoading ? '检查中' : payload?.status === 'authenticated' ? '已登录' : payload?.status === 'signed_out' ? '未登录' : '待配置';
  const statusTone =
    payload?.status === 'authenticated' ? 'auth-entry-card__status--success' : payload?.status === 'signed_out' ? '' : 'auth-entry-card__status--muted';
  const primaryActionLabel = payload?.status === 'authenticated' ? '退出登录（预留）' : '大恩登录（预留）';
  const primaryActionHref = payload?.status === 'authenticated' ? payload.logoutUrl : payload?.loginUrl ?? '/api/auth/login';
  const isPrimaryActionDisabled = isLoading || (!payload?.loginReady && payload?.status !== 'authenticated');
  const helperText = errorMessage || payload?.message || '预留登录入口与未登录状态结构，第二步再接真实鉴权。';

  return (
    <section className="auth-entry-card" aria-labelledby="auth-entry-title">
      <div className="auth-entry-card__header">
        <div>
          <p className="auth-entry-card__eyebrow">AUTH STEP 1</p>
          <h2 id="auth-entry-title" className="auth-entry-card__title">
            登录入口先挂上，真实鉴权下一步接
          </h2>
        </div>
        <span className={`auth-entry-card__status ${statusTone}`}>{statusLabel}</span>
      </div>

      <p className="auth-entry-card__description">{helperText}</p>

      {flash ? (
        <p className={`auth-entry-card__flash auth-entry-card__flash--${flash.tone}`}>{flash.description}</p>
      ) : null}

      {payload?.status === 'authenticated' && payload.user ? (
        <div className="auth-entry-card__user-block">
          <strong>{payload.user.displayName}</strong>
          <span>provider：{payload.user.provider}</span>
          <span>session 过期：{formatExpiry(payload.user.expiresAt) || '待补'}</span>
        </div>
      ) : (
        <div className="auth-entry-card__user-block auth-entry-card__user-block--placeholder">
          <strong>未登录状态占位已预留</strong>
          <span>当前只保留最小入口，不提前改大面积 UI。</span>
          <span>后续接入成功后，可以在这里换成用户卡片 / 工作台入口。</span>
        </div>
      )}

      <div className="auth-entry-card__actions">
        <a
          href={isPrimaryActionDisabled ? undefined : primaryActionHref}
          className={`auth-entry-card__button auth-entry-card__button--primary${isPrimaryActionDisabled ? ' is-disabled' : ''}`}
          aria-disabled={isPrimaryActionDisabled}
          onClick={(event) => {
            if (isPrimaryActionDisabled) {
              event.preventDefault();
            }
          }}
        >
          {primaryActionLabel}
        </a>
        <a href="/api/auth/me" className="auth-entry-card__button auth-entry-card__button--ghost">
          查看 auth/me
        </a>
      </div>

      {payload?.missingEnv?.length ? (
        <p className="auth-entry-card__footnote">缺少配置：{payload.missingEnv.join('、')}</p>
      ) : null}
    </section>
  );
}
