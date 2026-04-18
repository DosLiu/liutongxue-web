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
import { getFigureChatApiUrl, getFigureChatSurface } from './runtime';
import {
  type FigureChatApiResponse,
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

export default function FigureChatPage({ config }: { config: FigureChatConfig }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(() => getFigureChatDeveloperUnlimited(config));
  const [remaining, setRemaining] = useState(() => getFigureChatInitialRemaining(config));
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<FigureChatServiceStatus>('checking');
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const surface = getFigureChatSurface();
  const isStaticPreview = surface === 'static-preview';
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const normalizedInput = useMemo(() => normalizeUserInput(input), [input]);
  const isQuotaExhausted = !isDeveloperUnlimited && remaining <= 0;
  const canSend = useMemo(
    () => normalizedInput.length > 0 && !isQuotaExhausted && !isSending,
    [normalizedInput, isQuotaExhausted, isSending]
  );
  const quotaText = getFigureChatQuotaText(config, isDeveloperUnlimited, remaining);
  const statusMeta = getFigureChatStatusMeta(serviceStatus);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const apiUrl = getFigureChatApiUrl();

    if (!apiUrl) {
      setServiceStatus(isStaticPreview ? 'preview' : 'offline');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS);

    const checkApiHealth = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal
        });

        if (cancelled) {
          return;
        }

        if (response.status === 405) {
          setServiceStatus('api');
          return;
        }

        if (!response.ok) {
          setServiceStatus('offline');
          return;
        }

        const payload = (await response.json().catch(() => null)) as FigureChatApiResponse | null;
        setServiceStatus(resolveFigureChatServiceStatus(payload?.status, payload?.mode, 'api'));
      } catch {
        if (!cancelled) {
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
  }, [isStaticPreview]);

  const handleClear = () => {
    setMessages([]);
    setInput('');
    setError('');
    setStatusNotice('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const submitMessage = async () => {
    const content = normalizedInput;

    if (!content || isSending) {
      return;
    }

    if (isQuotaExhausted) {
      setError('本设备的免费体验次数已用完。');
      return;
    }

    const userMessage: ChatMessage = {
      id: createFigureChatMessageId('user'),
      role: 'user',
      content
    };

    const requestMessages = [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text }));
    const apiUrl = getFigureChatApiUrl();

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setStatusNotice('');
    setIsSending(true);

    let { replyText, nextStatus, nextNotice, shouldConsume } = createFigureChatLocalFallback({
      content,
      apiUrl,
      isStaticPreview,
      config
    });

    if (apiUrl) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), FIGURE_CHAT_REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ figureId: config.id, messages: requestMessages }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as FigureChatApiResponse;
        replyText = normalizeAssistantReply(payload.reply || replyText);
        nextStatus = resolveFigureChatServiceStatus(payload.status, payload.mode, 'mock');
        shouldConsume = Boolean(payload.shouldConsume ?? payload.mode === 'api');
        nextNotice = payload.mode === 'api' ? '' : payload.reason || nextNotice;
      } catch {
        nextStatus = 'offline';
        nextNotice = '当前没连上在线服务，先给你演示回复，不会扣减体验次数。';
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

    if (shouldConsume && !isDeveloperUnlimited) {
      setRemaining((value) => {
        const next = Math.max(0, value - 1);
        setFigureChatStoredRemaining(config, next);
        return next;
      });
    }

    setIsSending(false);
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
      <SiteHeader />

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
                  在线模式：{statusMeta.label}
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
                <span>{isQuotaExhausted ? '免费体验次数已用完' : 'Enter 发送，Shift+Enter 换行'}</span>
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
                本AI不保存聊天记录，关闭或刷新页面后，对话将自动清空
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
