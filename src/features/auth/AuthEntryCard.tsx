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
      description: '登录回调已打通，站内 session 已建立。下一步继续接 Vercel KV 的每日 10 次限制。',
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
  const isPrimaryActionDisabled = isLoading || (!payload?.loginReady && payload?.status !== 'authenticated');
  const helperText = errorMessage || payload?.message || '人物页登录入口已接到真实大恩协议，下一步补 Vercel KV 限次。';

  return (
    <section className="auth-entry-card" aria-labelledby="auth-entry-title">
      <div className="auth-entry-card__header">
        <div>
          <p className="auth-entry-card__eyebrow">AUTH STEP 2</p>
          <h2 id="auth-entry-title" className="auth-entry-card__title">
            人物页登录已切到大恩真实协议，下一步接每日 10 次
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
          <span>登录方式：{payload.user.loginType}</span>
          <span>session 过期：{formatExpiry(payload.user.expiresAt) || '待补'}</span>
          <span>当前目标：每日 {payload.dailyLimit} 次（KV 下一步接入）</span>
        </div>
      ) : (
        <div className="auth-entry-card__user-block auth-entry-card__user-block--placeholder">
          <strong>先登录再进入人物对话</strong>
          <span>建议从这里先用 QQ 或百度登录。</span>
          <span>登录成功后，这里会继续显示剩余次数与账号状态。</span>
        </div>
      )}

      <div className="auth-entry-card__actions">
        {payload?.status === 'authenticated' ? (
          <a href={payload.logoutUrl} className="auth-entry-card__button auth-entry-card__button--primary">
            退出登录
          </a>
        ) : (
          payload?.loginProviders?.map((provider) => {
            const returnTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/figures/';
            const href = `${provider.url}&return_to=${encodeURIComponent(returnTo)}`;
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
                {provider.label}
              </a>
            );
          })
        )}
        <a href="/api/auth/me" className="auth-entry-card__button auth-entry-card__button--ghost">
          查看 auth/me
        </a>
      </div>

      <p className="auth-entry-card__footnote">正式回调建议固定到 /api/auth/callback，再由系统回跳到人物页。</p>

      {payload?.missingEnv?.length ? (
        <p className="auth-entry-card__footnote">缺少配置：{payload.missingEnv.join('、')}</p>
      ) : null}
    </section>
  );
}
