import { useEffect, useMemo, useState } from 'react';

export type AuthPayload = {
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

export type FlashState = {
  description: string;
  tone: 'info' | 'warning';
} | null;

export const getFlashState = (): FlashState => {
  if (typeof window === 'undefined') {
    return null;
  }

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

export const getAuthStatusLabel = (status?: AuthPayload['status'], isLoading?: boolean) => {
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

export const getAuthProviderActionLabel = (type: string, label: string) => {
  if (type === 'qq') {
    return 'QQ登录';
  }

  if (type === 'baidu') {
    return '百度登录';
  }

  return label.replace(/\s+/g, '');
};

export const getAccountMonogram = (displayName?: string) => {
  const normalized = displayName?.trim();

  if (!normalized) {
    return '我';
  }

  const compactName = normalized.replace(/\s+/g, '');
  return compactName.slice(0, compactName.length > 2 ? 2 : 1).toUpperCase();
};

export const getCompactDisplayName = (displayName?: string) => {
  const normalized = displayName?.trim();

  if (!normalized) {
    return '我的账户';
  }

  return normalized.length > 8 ? `${normalized.slice(0, 8)}…` : normalized;
};

export function useAuthEntryState() {
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
  const statusLabel = getAuthStatusLabel(payload?.status, isLoading);
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
      ? `当前账号每日可聊 ${payload?.dailyLimit && payload.dailyLimit > 0 ? payload.dailyLimit : 10} 次。`
      : payload?.missingEnv?.length
        ? '登录入口暂不可用。'
        : '先体验 5 次，登录后每日 10 次。';
  const loginProviders = useMemo(
    () =>
      (payload?.loginProviders ?? []).map((provider) => ({
        ...provider,
        actionLabel: getAuthProviderActionLabel(provider.type, provider.label),
        href: `${provider.url}&return_to=${encodeURIComponent(returnTo)}`
      })),
    [payload?.loginProviders, returnTo]
  );

  return {
    errorMessage,
    flash,
    isAuthenticated,
    isLoading,
    isPrimaryActionDisabled,
    loginProviders,
    payload,
    returnTo,
    statusLabel,
    statusTone,
    summaryText
  };
}
