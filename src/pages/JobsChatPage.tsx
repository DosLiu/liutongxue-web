import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import {
  buildMockReply,
  JOBS_CHAT_DESCRIPTION,
  JOBS_CHAT_FREE_LIMIT,
  JOBS_CHAT_STORAGE_KEY,
  JOBS_CHAT_TITLE
} from '../config/jobsPersona';
import { getJobsChatApiUrl } from '../config/jobsChatApi';
import './JobsChatPage.css';

type ChatRole = 'assistant' | 'user';
type ChatServiceStatus = 'checking' | 'api' | 'mock' | 'offline';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatApiResponse = {
  reply: string;
  mode?: 'api' | 'mock';
  status?: Exclude<ChatServiceStatus, 'checking'>;
  reason?: string;
  shouldConsume?: boolean;
};

const normalizeAssistantReply = (content: string) =>
  content
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim())
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(\d+)[.)]\s+/gm, '$1. ')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const normalizeUserInput = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const JOBS_CHAT_DEBUG_KEY = `${JOBS_CHAT_STORAGE_KEY}-debug-unlimited`;
const JOBS_CHAT_DEBUG_PARAM = 'debug-unlimited';
const INPUT_MAX_LENGTH = 400;
const HEALTHCHECK_TIMEOUT_MS = 5000;
const REQUEST_TIMEOUT_MS = 18000;

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const setDeveloperUnlimited = (enabled: boolean) => {
  const storage = getStorage();
  if (!storage) return;

  if (enabled) {
    storage.setItem(JOBS_CHAT_DEBUG_KEY, '1');
    return;
  }

  storage.removeItem(JOBS_CHAT_DEBUG_KEY);
};

const getDeveloperUnlimited = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get(JOBS_CHAT_DEBUG_PARAM);

  if (debugParam === '1') {
    setDeveloperUnlimited(true);
    return true;
  }

  if (debugParam === '0') {
    setDeveloperUnlimited(false);
    return false;
  }

  return getStorage()?.getItem(JOBS_CHAT_DEBUG_KEY) === '1';
};

const getStoredRemaining = () => {
  const storage = getStorage();
  if (!storage) return JOBS_CHAT_FREE_LIMIT;

  const cached = storage.getItem(JOBS_CHAT_STORAGE_KEY);
  if (cached === null) {
    storage.setItem(JOBS_CHAT_STORAGE_KEY, String(JOBS_CHAT_FREE_LIMIT));
    return JOBS_CHAT_FREE_LIMIT;
  }

  const parsed = Number.parseInt(cached, 10);
  return Number.isNaN(parsed) ? JOBS_CHAT_FREE_LIMIT : Math.max(0, parsed);
};

const setStoredRemaining = (value: number) => {
  getStorage()?.setItem(JOBS_CHAT_STORAGE_KEY, String(value));
};

const getInitialRemaining = () => (getDeveloperUnlimited() ? JOBS_CHAT_FREE_LIMIT : getStoredRemaining());

const getQuotaText = (isDeveloperUnlimited: boolean, remaining: number) =>
  isDeveloperUnlimited ? '开发调试：不限次数' : `剩余体验：${remaining}/${JOBS_CHAT_FREE_LIMIT}`;

const getStatusMeta = (status: ChatServiceStatus) => {
  switch (status) {
    case 'api':
      return { label: '真实模型', toneClassName: 'is-healthy' };
    case 'mock':
      return { label: '演示模式', toneClassName: 'is-pending' };
    case 'offline':
      return { label: '未连接', toneClassName: 'is-unhealthy' };
    default:
      return { label: '检测中', toneClassName: 'is-pending' };
  }
};

const resolveServiceStatus = (
  status?: ChatApiResponse['status'],
  mode?: ChatApiResponse['mode'],
  fallbackStatus: Exclude<ChatServiceStatus, 'checking'> = 'offline'
): Exclude<ChatServiceStatus, 'checking'> => {
  if (status === 'api' || status === 'mock' || status === 'offline') {
    return status;
  }

  if (mode === 'api') {
    return 'api';
  }

  if (mode === 'mock') {
    return 'mock';
  }

  return fallbackStatus;
};

const createMessageId = (role: ChatRole) => `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function JobsChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(getDeveloperUnlimited);
  const [remaining, setRemaining] = useState(getInitialRemaining);
  const [isSending, setIsSending] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ChatServiceStatus>('checking');
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const normalizedInput = useMemo(() => normalizeUserInput(input), [input]);
  const isQuotaExhausted = !isDeveloperUnlimited && remaining <= 0;
  const canSend = useMemo(
    () => normalizedInput.length > 0 && !isQuotaExhausted && !isSending,
    [normalizedInput, isQuotaExhausted, isSending]
  );
  const quotaText = getQuotaText(isDeveloperUnlimited, remaining);
  const statusMeta = getStatusMeta(serviceStatus);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const apiUrl = getJobsChatApiUrl();

    if (!apiUrl) {
      setServiceStatus('offline');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);

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

        const payload = (await response.json().catch(() => null)) as ChatApiResponse | null;
        setServiceStatus(resolveServiceStatus(payload?.status, payload?.mode, 'api'));
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
  }, []);

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
      id: createMessageId('user'),
      role: 'user',
      content
    };

    const requestMessages = [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text }));
    const apiUrl = getJobsChatApiUrl();

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setStatusNotice('');
    setIsSending(true);

    let replyText = normalizeAssistantReply(buildMockReply(content));
    let nextStatus: Exclude<ChatServiceStatus, 'checking'> = apiUrl ? 'mock' : 'offline';
    let nextNotice = apiUrl ? '当前返回的是演示回复，不会扣减体验次数。' : '当前未连接服务，先给你演示回复，不会扣减体验次数。';
    let shouldConsume = false;

    if (apiUrl) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: requestMessages }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ChatApiResponse;
        replyText = normalizeAssistantReply(payload.reply || replyText);
        nextStatus = resolveServiceStatus(payload.status, payload.mode, 'mock');
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
        id: createMessageId('assistant'),
        role: 'assistant',
        content: replyText
      }
    ]);

    if (shouldConsume && !isDeveloperUnlimited) {
      setRemaining((value) => {
        const next = Math.max(0, value - 1);
        setStoredRemaining(next);
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
      <SiteHeader activeKey="contact" />

      <main className="jobs-chat-page">
        <div className="jobs-chat-page__ambient jobs-chat-page__ambient--left" aria-hidden="true" />
        <div className="jobs-chat-page__ambient jobs-chat-page__ambient--right" aria-hidden="true" />
        <div className="jobs-chat-page__grid" aria-hidden="true" />

        <div className="jobs-chat-shell">
          <section className="jobs-chat-hero" aria-labelledby="jobs-chat-title">
            <h1 id="jobs-chat-title" className="jobs-chat-title">
              {JOBS_CHAT_TITLE}
            </h1>
            <p className="jobs-chat-subtitle">{JOBS_CHAT_DESCRIPTION}</p>
          </section>

          <section className="jobs-chat-panel" aria-label="虚拟乔布斯对话区域">
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
                  <span className="jobs-chat-message__role">{message.role === 'assistant' ? '虚拟乔布斯' : '你'}</span>
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
                maxLength={INPUT_MAX_LENGTH}
                aria-describedby="jobs-chat-input-meta jobs-chat-note jobs-chat-feedback"
              />

              <div className="jobs-chat-form__meta" id="jobs-chat-input-meta">
                <span>{isQuotaExhausted ? '免费体验次数已用完' : 'Enter 发送，Shift+Enter 换行'}</span>
                <span>
                  {input.length}/{INPUT_MAX_LENGTH}
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
