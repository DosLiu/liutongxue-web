import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FIGURE_CHAT_HISTORY_LIMIT } from '../../../api/_lib/figure-chat-limits.js';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { sitePaths } from '../../site';
import {
  createFigureChatLocalFallback,
  createFigureChatMessageId,
  FIGURE_CHAT_DIGITAL_HUMAN_HEALTHCHECK_TIMEOUT_MS,
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
import { canUseFigureChatStaticFallback, getFigureChatApiUrl } from './runtime';
import { type FigureChatQuota } from './core';
import { isStaticChatResponse, requestFigureChat, requestFigureChatHealth } from './request';
import {
  type FigureChatConfig,
  resolveFigureChatServiceStatus,
  type FigureChatRole,
  type FigureChatServiceStatus
} from './shared';
import './FigureChatPage.css';

const GUEST_QUOTA_REFRESH_RETRY_MS = 15000;

type ChatMessage = {
  id: string;
  role: FigureChatRole;
  content: string;
};

export default function FigureChatPage({ config }: { config: FigureChatConfig }) {
  const apiUrl = getFigureChatApiUrl();
  const allowStaticFallback = canUseFigureChatStaticFallback(apiUrl);
  const isDigitalHuman = config.id === 'liu-dongsheng';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(() => getFigureChatDeveloperUnlimited(config));
  const [serverQuota, setServerQuota] = useState<FigureChatQuota>();
  const [localRemaining, setLocalRemaining] = useState<number | null>(() => apiUrl ? null : getFigureChatInitialRemaining(config));
  const [shouldCheckService, setShouldCheckService] = useState(Boolean(apiUrl));
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<FigureChatServiceStatus>(apiUrl ? 'checking' : 'offline');
  const [hasModelReply, setHasModelReply] = useState(false);
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const healthCheckRef = useRef<AbortController | null>(null);
  const requestCountRef = useRef(0);
  const sendingRef = useRef(false);
  const quotaScope = serverQuota?.scope ?? 'device';
  const quotaMode = serverQuota?.mode ?? 'device';
  const quotaLimit = serverQuota && serverQuota.limit > 0 ? serverQuota.limit : config.freeLimit;
  const remaining = serverQuota ? serverQuota.remaining ?? null : localRemaining;
  const hasServerQuota = Boolean(serverQuota);
  const guestQuotaResetAt = quotaScope === 'device' ? Date.parse(serverQuota?.resetAt ?? '') : NaN;
  const normalizedInput = useMemo(() => normalizeUserInput(input), [input]);
  const isQuotaExhausted = !isDeveloperUnlimited && remaining !== null && remaining <= 0;
  const canSend = normalizedInput.length > 0 && !isQuotaExhausted && !isSending;
  const quotaText = getFigureChatQuotaText(config, isDeveloperUnlimited, remaining, quotaLimit, quotaScope, quotaMode);
  const statusMeta = getFigureChatStatusMeta(serviceStatus);
  const quotaExhaustedText = quotaScope === 'account'
    ? '今日对话次数已用完'
    : quotaMode === 'daily' ? '今日体验次数已用完，北京时间 0 点恢复' : '免费体验次数已用完';

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!apiUrl || (!shouldCheckService && !Number.isFinite(guestQuotaResetAt))) return;

    let cancelled = false;
    let timerId: number | undefined;
    let pending: AbortController | null = null;

    const scheduleRefresh = (delay: number) => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => void refresh(), delay);
    };

    const refresh = async () => {
      if (cancelled || pending || document.visibilityState === 'hidden' || !navigator.onLine) return;
      if (sendingRef.current) {
        scheduleRefresh(1000);
        return;
      }

      const requestCount = requestCountRef.current;
      const controller = new AbortController();
      pending = healthCheckRef.current = controller;
      const checkDigitalHuman = shouldCheckService && isDigitalHuman;
      const healthcheckTimeout = checkDigitalHuman ? FIGURE_CHAT_DIGITAL_HUMAN_HEALTHCHECK_TIMEOUT_MS : FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS;
      const timeoutId = window.setTimeout(() => controller.abort(), healthcheckTimeout);
      const isCurrent = () => !cancelled && requestCount === requestCountRef.current;

      try {
        const healthUrl = new URL(apiUrl, window.location.href);
        if (checkDigitalHuman) healthUrl.searchParams.set('figureId', config.id);
        const payload = await requestFigureChatHealth(healthUrl.toString(), controller.signal, allowStaticFallback);
        if (!isCurrent()) return;

        const quota = payload?.quota;
        if (!shouldCheckService) {
          const resetAt = Date.parse(quota?.resetAt ?? '');
          if (quota?.enforced && (quota.scope === 'account' || resetAt > Math.max(Date.now(), guestQuotaResetAt))) {
            setServerQuota(quota);
            setError('');
            return;
          }
          scheduleRefresh(GUEST_QUOTA_REFRESH_RETRY_MS);
          return;
        }

        if (!payload && hasServerQuota) throw new Error('Missing chat health response');
        const status = resolveFigureChatServiceStatus(payload?.status, payload?.mode, 'offline');
        setServiceStatus(status);
        setStatusNotice(quota?.mode === 'unavailable' || (checkDigitalHuman && payload && (status === 'offline' || payload.reason?.includes('上次成功读取')))
          ? payload?.reason || quota?.reason || '对话服务暂时不可用，请稍后重试。'
          : '');
        if (quota) {
          setServerQuota(quota);
        } else if (!hasServerQuota && (!payload || status !== 'offline')) {
          // A static preview or a legacy API can still use the local demo balance.
          setLocalRemaining(current => current ?? getFigureChatInitialRemaining(config));
        }

        if (payload && (status === 'offline' || quota?.mode === 'unavailable')) {
          scheduleRefresh(GUEST_QUOTA_REFRESH_RETRY_MS);
        } else {
          setShouldCheckService(false);
        }
      } catch {
        if (!isCurrent()) return;
        if (shouldCheckService) setServiceStatus('offline');
        scheduleRefresh(GUEST_QUOTA_REFRESH_RETRY_MS);
      } finally {
        window.clearTimeout(timeoutId);
        pending = null;
        if (healthCheckRef.current === controller) healthCheckRef.current = null;
        if (!cancelled && !isCurrent()) scheduleRefresh(1000);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible' && (shouldCheckService || Date.now() >= guestQuotaResetAt)) {
        scheduleRefresh(0);
      }
    };

    scheduleRefresh(shouldCheckService ? 0 : Math.max(0, guestQuotaResetAt - Date.now()));
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('online', refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      pending?.abort();
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('online', refreshWhenVisible);
    };
  }, [allowStaticFallback, apiUrl, config, guestQuotaResetAt, hasServerQuota, isDigitalHuman, shouldCheckService]);

  const handleClear = () => {
    setMessages([]);
    setInput('');
    setError('');
    setStatusNotice('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const submitMessage = async () => {
    const content = normalizedInput;
    if (!content || sendingRef.current) return;

    if (isQuotaExhausted) {
      setError(`${quotaExhaustedText}。`);
      return;
    }

    const draft = input;
    const userMessage: ChatMessage = { id: createFigureChatMessageId('user'), role: 'user', content };
    const requestMessages = [...messages, userMessage]
      .filter(({ content: text }) => text.trim())
      .slice(-FIGURE_CHAT_HISTORY_LIMIT)
      .map(({ role, content: text }) => ({ role, content: text }));
    sendingRef.current = true;
    requestCountRef.current++;
    // Keep a concurrent health check from setting another guest cookie or overwriting the new balance.
    healthCheckRef.current?.abort();

    setMessages((current) => [...current, userMessage]);
    setError('');
    setStatusNotice('');
    setIsSending(true);

    const rejectMessage = (reason: string, retryHealth: boolean) => {
      setMessages(current => current.filter(message => message.id !== userMessage.id));
      setError(reason);
      if (retryHealth) {
        setServiceStatus('offline');
        setShouldCheckService(true);
      }
    };

    const controller = apiUrl ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), FIGURE_CHAT_REQUEST_TIMEOUT_MS) : undefined;
    try {
      let { replyText, nextStatus, nextNotice, shouldConsume } = createFigureChatLocalFallback({ content, apiUrl, config });
      let receivedQuota = false;
      if (apiUrl && controller) {
        const { response, payload } = await requestFigureChat(apiUrl, { figureId: config.id, messages: requestMessages }, controller.signal);
        if (payload?.quota) {
          receivedQuota = true;
          setServerQuota(payload.quota);
        }

        if (response.status === 429 || payload?.error === 'quota_exhausted') {
          rejectMessage(payload?.reason || payload?.quota?.reason || '当前对话次数已用完。', false);
          return;
        }
        if (payload?.error === 'guest_session_required') {
          setServiceStatus('offline');
          setShouldCheckService(false);
          rejectMessage(payload.reason || '需要启用浏览器 Cookie 才能使用游客体验，请重试。', false);
          return;
        }
        if (payload?.error || payload?.status === 'offline' || (isDigitalHuman && payload?.mode === 'mock')) {
          rejectMessage(payload.reason || payload.quota?.reason || '对话服务暂时不可用，请稍后重试。', true);
          return;
        }

        if (!payload && !hasServerQuota && allowStaticFallback && isStaticChatResponse(response)) {
          nextStatus = 'offline';
          setLocalRemaining(current => current ?? getFigureChatInitialRemaining(config));
          setShouldCheckService(false);
        } else {
          if (!response.ok || !payload || (payload.mode === 'api' && !payload.reply.trim())) {
            throw new Error(`Request failed with ${response.status}`);
          }

          replyText = normalizeAssistantReply(payload.reply || replyText);
          setHasModelReply(payload.mode === 'api');
          nextStatus = resolveFigureChatServiceStatus(payload.status, payload.mode, 'mock');
          shouldConsume = Boolean(payload.shouldConsume ?? payload.mode === 'api');
          if (payload.mode === 'mock') nextNotice = payload.reason || nextNotice;
          else if (isDigitalHuman && payload.reason?.includes('上次成功读取')) nextNotice = payload.reason;
          else nextNotice = payload.quota?.mode === 'unavailable' ? payload.quota.reason || '' : '';
          if (payload.quota) setShouldCheckService(payload.quota.mode === 'unavailable');
        }
      }

      setServiceStatus(nextStatus);
      setStatusNotice(nextNotice);
      // Preserve edits made while the request was pending.
      setInput(current => current === draft ? '' : current);
      setMessages((current) => [...current, {
        id: createFigureChatMessageId('assistant'),
        role: 'assistant',
        content: replyText
      }]);

      if (shouldConsume && !hasServerQuota && !receivedQuota && !isDeveloperUnlimited) {
        const next = Math.max(0, (localRemaining ?? getFigureChatInitialRemaining(config)) - 1);
        setFigureChatStoredRemaining(config, next);
        setLocalRemaining(next);
      }
    } catch {
      rejectMessage('暂时无法连接对话服务，请稍后重试。', true);
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
      sendingRef.current = false;
    }
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
            <span>返回硅基同事</span>
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
                {statusNotice && statusNotice !== error ? <p className="jobs-chat-form__notice">{statusNotice}</p> : null}
                {error ? <p className="jobs-chat-form__error">{error}</p> : null}
              </div>
            </form>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
