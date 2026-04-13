import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
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

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatApiResponse = {
  reply: string;
  mode?: 'api' | 'mock';
};

const normalizeAssistantReply = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim())
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const JOBS_CHAT_DEBUG_KEY = `${JOBS_CHAT_STORAGE_KEY}-debug-unlimited`;
const JOBS_CHAT_DEBUG_PARAM = 'debug-unlimited';

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

const getApiStatusText = (isApiHealthy: boolean | null) =>
  isApiHealthy === null ? '检测中' : isApiHealthy ? '正常' : '异常';

export default function JobsChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(getDeveloperUnlimited);
  const [remaining, setRemaining] = useState(getInitialRemaining);
  const [isSending, setIsSending] = useState(false);
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const apiStatusText = getApiStatusText(isApiHealthy);
  const quotaText = getQuotaText(isDeveloperUnlimited, remaining);

  useEffect(() => {
    const apiUrl = getJobsChatApiUrl();

    if (!apiUrl) {
      setIsApiHealthy(false);
      return;
    }

    let cancelled = false;

    const checkApiHealth = async () => {
      try {
        const response = await fetch(apiUrl, { method: 'GET' });
        if (!cancelled) {
          setIsApiHealthy(response.ok || response.status === 405);
        }
      } catch {
        if (!cancelled) {
          setIsApiHealthy(false);
        }
      }
    };

    void checkApiHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSend = useMemo(() => input.trim().length > 0 && (isDeveloperUnlimited || remaining > 0) && !isSending, [input, isDeveloperUnlimited, remaining, isSending]);

  const handleClear = () => {
    setMessages([]);
    setInput('');
    setError('');
  };

  const submitMessage = async () => {
    const content = input.trim();
    if (!content || !canSend) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content
    };

    const requestMessages = [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text }));

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      let replyText = normalizeAssistantReply(buildMockReply(content));
      let mode: ChatApiResponse['mode'] = 'mock';
      const apiUrl = getJobsChatApiUrl();

      if (apiUrl) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: requestMessages })
          });

          if (response.ok) {
            const payload = (await response.json()) as ChatApiResponse;
            replyText = normalizeAssistantReply(payload.reply || replyText);
            mode = payload.mode ?? mode;
          }
        } catch {
          // keep mock reply
        }
      }

      setIsApiHealthy(mode === 'api');

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText
        }
      ]);

      setRemaining((value) => {
        if (isDeveloperUnlimited) {
          return value;
        }

        const next = Math.max(0, value - 1);
        setStoredRemaining(next);
        return next;
      });
    } catch {
      setError('这次发送没有成功，你可以再试一次。');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitMessage();
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
              <div className="jobs-chat-panel__status-group">
                <div className="jobs-chat-panel__status-line">{quotaText}</div>
                <div className={`jobs-chat-panel__status-line jobs-chat-panel__status-line--mode ${isApiHealthy === null ? 'is-pending' : isApiHealthy ? 'is-healthy' : 'is-unhealthy'}`}>
                  在线模式：{apiStatusText}
                  <span className="jobs-chat-panel__mode-dot" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="jobs-chat-messages">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`jobs-chat-message jobs-chat-message--${message.role}`}
                >
                  <span className="jobs-chat-message__role">
                    {message.role === 'assistant' ? '虚拟乔布斯' : '你'}
                  </span>
                  <p className="jobs-chat-message__text">{message.content}</p>
                </article>
              ))}
            </div>

            <form className="jobs-chat-form" onSubmit={handleSubmit}>
              <label className="jobs-chat-form__label" htmlFor="jobs-chat-input">
                把你当前最想了解的问题，用一句话说清楚
              </label>
              <textarea
                id="jobs-chat-input"
                className="jobs-chat-form__input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder=""
                rows={4}
                maxLength={400}
              />

              <div className="jobs-chat-form__footer">
                <button type="button" className="jobs-chat-form__ghost" onClick={handleClear}>
                  清空当前会话
                </button>
                <button type="submit" className="jobs-chat-form__submit" disabled={!canSend}>
                  {isSending ? '发送中…' : '发送问题'}
                </button>
              </div>

              <p className="jobs-chat-form__note">本AI不保存聊天记录，关闭或刷新页面后，对话将自动清空</p>
              {error ? <p className="jobs-chat-form__error">{error}</p> : null}
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
