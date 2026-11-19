import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import SiteHeader from '../../components/SiteHeader';
import { sitePaths } from '../../site';
import {
  createFigureChatLocalFallback,
  createFigureChatMessageId,
  FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS,
  FIGURE_CHAT_INPUT_MAX_LENGTH,
  FIGURE_CHAT_REQUEST_TIMEOUT_MS,
  getFigureChatDeveloperUnlimited,
  getFigureChatInitialRemaining,
  getFigureChatQuotaText,
  getFigureChatStatusMeta,
  normalizeAssistantReply,
  normalizeUserInput,
  setFigureChatStoredRemaining
} from './client';
import { getFigureChatApiUrl } from './runtime';
import { isFigureChatApiResponse } from './core';
import { requestFigureChat } from './request';
import {
  type FigureChatConfig,
  resolveFigureChatServiceStatus,
  type FigureChatRole,
  type FigureChatServiceStatus
} from './shared';
import './FigureChatPage.css';

type ChatMessage = {
  id: string;
  role: FigureChatRole;
  content: string;
};

type AuthStatePayload = {
  authenticated: boolean;
  dailyLimit: number;
  loginEnabled: boolean;
  quota?: {
    enforced?: boolean;
    limit: number;
    mode: 'daily' | 'unavailable';
    reason?: string;
    remaining: number | null;
    scope: 'account';
  } | null;
  user: null | {
    subject: string;
  };
};

export default function FigureChatPage({ config }: { config: FigureChatConfig }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(() => getFigureChatDeveloperUnlimited(config));
  const [quotaScope, setQuotaScope] = useState<'device' | 'account'>('device');
  const [quotaMode, setQuotaMode] = useState<'device' | 'daily' | 'unavailable'>('device');
  const [quotaLimit, setQuotaLimit] = useState(config.freeLimit);
  const [remaining, setRemaining] = useState<number | null>(() => getFigureChatInitialRemaining(config));
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<FigureChatServiceStatus>('checking');
  const [hasModelReply, setHasModelReply] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const requestStartedRef = useRef(false);
  const sendingRef = useRef(false);
  const guestQuotaLoadedRef = useRef(false);
  const normalizedInput = useMemo(() => normalizeUserInput(input), [input]);
  const isQuotaExhausted = !isDeveloperUnlimited && remaining !== null && remaining <= 0;
  const canSend = useMemo(
    () => normalizedInput.length > 0 && !isQuotaExhausted && !isSending,
    [normalizedInput, isQuotaExhausted, isSending]
  );
  const quotaText = getFigureChatQuotaText(config, isDeveloperUnlimited, remaining, quotaLimit, quotaScope, quotaMode);
  const statusMeta = getFigureChatStatusMeta(serviceStatus);
  const quotaExhaustedText = quotaScope === 'account' ? '今日对话次数已用完' : '免费体验次数已用完';

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

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

        const payload = (await response.json()) as AuthStatePayload;
        if (aborted || requestStartedRef.current || payload.loginEnabled !== true) {
          return;
        }

        if (payload.authenticated && payload.user?.subject) {
          const nextLimit = payload.quota?.limit && payload.quota.limit > 0 ? payload.quota.limit : payload.dailyLimit > 0 ? payload.dailyLimit : config.freeLimit;
          setQuotaScope('account');
          setQuotaMode(payload.quota?.mode ?? 'unavailable');
          setQuotaLimit(nextLimit);
          setRemaining(payload.quota?.remaining ?? null);
          setStatusNotice(payload.quota?.mode === 'unavailable' ? payload.quota.reason || '' : '');
          return;
        }

        if (guestQuotaLoadedRef.current) return;
        setQuotaScope('device');
        setQuotaMode('device');
        setQuotaLimit(config.freeLimit);
        setRemaining(getFigureChatInitialRemaining(config));
        setStatusNotice('');
      } catch {
        if (!aborted && !requestStartedRef.current && !guestQuotaLoadedRef.current) {
          setQuotaScope('device');
          setQuotaMode('device');
          setQuotaLimit(config.freeLimit);
          setRemaining(getFigureChatInitialRemaining(config));
        }
      }
    };

    void loadAuthState();

    return () => {
      aborted = true;
    };
  }, [config]);

  useEffect(() => {
    const apiUrl = getFigureChatApiUrl();
    const isDigitalHuman = config.id === 'liu-dongsheng';

    if (!apiUrl) {
      setServiceStatus('offline');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), isDigitalHuman ? 10000 : FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS);

    const checkApiHealth = async () => {
      try {
        const healthUrl = new URL(apiUrl, window.location.href);
        if (isDigitalHuman) healthUrl.searchParams.set('figureId', config.id);
        const response = await fetch(healthUrl, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        });

        if (cancelled || requestStartedRef.current) {
          return;
        }

        if (!response.ok) {
          setServiceStatus('offline');
          return;
        }

        const payload = await response.json().catch(() => null);
        if (cancelled || requestStartedRef.current) return;
        if (!isFigureChatApiResponse(payload)) {
          setServiceStatus('offline');
          return;
        }
        if (payload.quota?.scope === 'device') {
          guestQuotaLoadedRef.current = true;
          const guestRemaining = payload.quota.remaining === null ? null : Math.min(payload.quota.remaining, getFigureChatInitialRemaining(config));
          setQuotaScope('device');
          setQuotaMode(payload.quota.mode);
          setQuotaLimit(payload.quota.limit);
          setRemaining(guestRemaining);
          if (guestRemaining !== null) setFigureChatStoredRemaining(config, guestRemaining, payload.quota.limit);
        }
        setServiceStatus(resolveFigureChatServiceStatus(payload.status, payload.mode, 'offline'));
        if (payload.quota?.mode === 'unavailable' || (isDigitalHuman && (payload.status === 'offline' || payload.reason?.includes('上次成功读取')))) {
          setStatusNotice(payload.reason || '数字分身暂时无法连接。');
        }
      } catch {
        if (!cancelled && !requestStartedRef.current) {
          setServiceStatus('offline');
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void checkApiHealth();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [config.id]);

  const handleClear = () => {
    setMessages([]);
    setInput('');
    setError('');
    setStatusNotice('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const submitMessage = async () => {
    const content = normalizedInput;

    if (!content || sendingRef.current) {
      return;
    }

    if (isQuotaExhausted) {
      setError(quotaScope === 'account' ? '当前账号今日对话次数已用完。' : '本设备的免费体验次数已用完。');
      return;
    }

    const userMessage: ChatMessage = {
      id: createFigureChatMessageId('user'),
      role: 'user',
      content
    };

    const requestMessages = [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text }));
    const apiUrl = getFigureChatApiUrl();
    sendingRef.current = true;
    requestStartedRef.current = true;

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setStatusNotice('');
    setIsSending(true);

    let { replyText, nextStatus, nextNotice, shouldConsume } = createFigureChatLocalFallback({
      content,
      apiUrl,
      config
    });
    let nextQuotaScope = quotaScope;
    let nextQuotaLimit = quotaLimit;
    let hasServerGuestQuota = false;

    if (apiUrl) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), FIGURE_CHAT_REQUEST_TIMEOUT_MS);

      try {
        const { response, payload } = await requestFigureChat(apiUrl, { figureId: config.id, messages: requestMessages }, controller.signal);

        if (payload?.quota) {
          nextQuotaScope = payload.quota.scope;
          nextQuotaLimit = payload.quota.limit > 0 ? payload.quota.limit : quotaLimit;
          setQuotaScope(payload.quota.scope);
          setQuotaMode(payload.quota.mode);
          setQuotaLimit(nextQuotaLimit);
          const nextRemaining = payload.quota.scope === 'device' && payload.quota.remaining !== null
            ? Math.min(payload.quota.remaining, getFigureChatInitialRemaining(config)) : payload.quota.remaining ?? null;
          setRemaining(nextRemaining);
          if (payload.quota.scope === 'device') {
            hasServerGuestQuota = true;
            if (nextRemaining !== null) setFigureChatStoredRemaining(config, nextRemaining, nextQuotaLimit);
          }
        }

        if (response.status === 429 || payload?.error === 'quota_exhausted' || payload?.error === 'quota_unavailable' || payload?.error === 'guest_session_required' || payload?.error === 'guest_quota_unavailable') {
          setError(payload?.reason || payload?.quota?.reason || '当前对话次数已用完。');
          if (payload?.status === 'offline') setServiceStatus('offline');
          setStatusNotice(payload?.quota?.mode === 'unavailable' ? payload.quota.reason || '' : '');
          if (payload?.error === 'quota_unavailable') {
            setInput(current => current || content);
            setMessages(current => current.filter(message => message.id !== userMessage.id));
          }
          setIsSending(false);
          sendingRef.current = false;
          return;
        }

        if (!response.ok || !payload || (payload.mode === 'api' && !payload.reply.trim())) {
          throw new Error(`Request failed with ${response.status}`);
        }

        replyText = normalizeAssistantReply(payload.reply || replyText);
        setHasModelReply(payload.mode === 'api');
        nextStatus = resolveFigureChatServiceStatus(payload.status, payload.mode, 'mock');
        shouldConsume = Boolean(payload.shouldConsume ?? payload.mode === 'api');
        nextNotice = payload.mode === 'api'
          ? config.id === 'liu-dongsheng' && payload.reason?.includes('上次成功读取')
            ? payload.reason
            : payload.quota?.scope === 'account' && payload.quota.mode === 'unavailable'
            ? payload.quota.reason || ''
            : ''
          : payload.reason || nextNotice;
      } catch {
        nextStatus = 'offline';
        nextNotice = config.id === 'liu-dongsheng' ? '数字分身暂时无法连接，请稍后再试。' : '当前没连上在线服务，先给你演示回复，不会扣减次数。';
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    setServiceStatus(nextStatus);
    setStatusNotice(nextNotice);
    setMessages((current) => [
      ...current,
      {
        id: createFigureChatMessageId('assistant'),
        role: 'assistant',
        content: replyText
      }
    ]);

    if (shouldConsume && !hasServerGuestQuota && !isDeveloperUnlimited && nextQuotaScope === 'device') {
      setRemaining((value) => {
        const current = typeof value === 'number' ? value : nextQuotaLimit;
        const next = Math.max(0, current - 1);
        setFigureChatStoredRemaining(config, next, nextQuotaLimit);
        return next;
      });
    }

    setIsSending(false);
    sendingRef.current = false;
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);

    if (error) {
      setError('');
    }
  };

  return (
    <>
      <SiteHeader activeKey="figures" />

      <main className="jobs-chat-page">
        <div className="jobs-chat-page__ambient jobs-chat-page__ambient--left" aria-hidden="true" />
        <div className="jobs-chat-page__ambient jobs-chat-page__ambient--right" aria-hidden="true" />
        <div className="jobs-chat-page__grid" aria-hidden="true" />

        <div className="jobs-chat-shell">
          <a href={sitePaths.figures} className="jobs-chat-back-link">
            <span className="jobs-chat-back-link__icon" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 2.25L3.75 6L7.5 9.75" />
              </svg>
            </span>
            <span>返回人物入口</span>
          </a>

          <section className="jobs-chat-hero" aria-labelledby="jobs-chat-title">
            <h1 id="jobs-chat-title" className="jobs-chat-title">
              {config.title}
            </h1>
            <p className="jobs-chat-subtitle">{config.description}</p>
          </section>

          <section className="jobs-chat-panel" aria-label={config.panelAriaLabel}>
            <div className="jobs-chat-panel__topline">
              <div className="jobs-chat-panel__status-group" aria-live="polite">
                <div className="jobs-chat-panel__status-line">{quotaText}</div>
                <div className={`jobs-chat-panel__status-line jobs-chat-panel__status-line--mode ${statusMeta.toneClassName}`}>
                  在线模式：{serviceStatus === 'api' && !hasModelReply ? config.id === 'liu-dongsheng' ? '资料已连接' : '服务已配置' : statusMeta.label}
                  <span className="jobs-chat-panel__mode-dot" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="jobs-chat-messages" aria-live="polite" aria-busy={isSending}>
              {messages.map((message) => (
                <article key={message.id} className={`jobs-chat-message jobs-chat-message--${message.role}`}>
                  <span className="jobs-chat-message__role">{message.role === 'assistant' ? config.assistantLabel : '你'}</span>
                  <p className="jobs-chat-message__text">{message.content}</p>
                </article>
              ))}

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            <form className="jobs-chat-form" onSubmit={handleSubmit}>
              <label className="jobs-chat-form__label" htmlFor="jobs-chat-input">
                把你当前最想了解的问题，用一句话说清楚
              </label>
              <textarea
                id="jobs-chat-input"
                ref={textareaRef}
                className="jobs-chat-form__input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder=""
                rows={4}
                maxLength={FIGURE_CHAT_INPUT_MAX_LENGTH}
                aria-describedby="jobs-chat-input-meta jobs-chat-note jobs-chat-feedback"
              />

              <div className="jobs-chat-form__meta" id="jobs-chat-input-meta">
                <span>{isQuotaExhausted ? quotaExhaustedText : 'Enter 发送，Shift+Enter 换行'}</span>
                <span>
                  {input.length}/{FIGURE_CHAT_INPUT_MAX_LENGTH}
                </span>
              </div>

              <div className="jobs-chat-form__footer">
                <button
                  type="button"
                  className="jobs-chat-form__ghost"
                  onClick={handleClear}
                  disabled={isSending || (messages.length === 0 && input.length === 0 && !statusNotice && !error)}
                >
                  清空当前会话
                </button>
                <button type="submit" className="jobs-chat-form__submit" disabled={!canSend}>
                  {isSending ? '发送中…' : '发送问题'}
                </button>
              </div>

              <p className="jobs-chat-form__note" id="jobs-chat-note">
                {config.id === 'liu-dongsheng' ? '你正在与 AI 分身对话。问题会发送给模型服务；刷新页面后当前对话会清空。' : '本AI不保存聊天记录，关闭或刷新页面后，对话将自动清空'}
              </p>
              <div className="jobs-chat-form__feedback" id="jobs-chat-feedback" aria-live="polite">
                {statusNotice ? <p className="jobs-chat-form__notice">{statusNotice}</p> : null}
                {error ? <p className="jobs-chat-form__error">{error}</p> : null}
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
