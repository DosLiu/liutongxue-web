import { FormEvent, useMemo, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import {
  buildMockReply,
  JOBS_CHAT_DESCRIPTION,
  JOBS_CHAT_FREE_LIMIT,
  JOBS_CHAT_STORAGE_KEY,
  JOBS_CHAT_TITLE
} from '../config/jobsPersona';
import {
  getJobsChatApiFallbackReason,
  getJobsChatApiHint,
  getJobsChatApiUrl
} from '../config/jobsChatApi';
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
  reason?: string;
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

const getDeveloperUnlimited = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get(JOBS_CHAT_DEBUG_PARAM);

  if (debugParam === '1') {
    window.localStorage.setItem(JOBS_CHAT_DEBUG_KEY, '1');
    return true;
  }

  if (debugParam === '0') {
    window.localStorage.removeItem(JOBS_CHAT_DEBUG_KEY);
    return false;
  }

  return window.localStorage.getItem(JOBS_CHAT_DEBUG_KEY) === '1';
};

const getInitialRemaining = () => {
  if (typeof window === 'undefined') return JOBS_CHAT_FREE_LIMIT;
  if (getDeveloperUnlimited()) return JOBS_CHAT_FREE_LIMIT;

  const cached = window.localStorage.getItem(JOBS_CHAT_STORAGE_KEY);
  if (cached === null) {
    window.localStorage.setItem(JOBS_CHAT_STORAGE_KEY, String(JOBS_CHAT_FREE_LIMIT));
    return JOBS_CHAT_FREE_LIMIT;
  }
  const parsed = Number.parseInt(cached, 10);
  return Number.isNaN(parsed) ? JOBS_CHAT_FREE_LIMIT : Math.max(0, parsed);
};

const initialAssistantMessage: ChatMessage = {
  id: 'assistant-intro',
  role: 'assistant',
  content: '我先说明一次：我会以乔布斯视角和你聊，基于公开言论推断，不是本人。现在，说重点。你最痛的业务问题是什么？一句话，不要背景。'
};

export default function JobsChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const [input, setInput] = useState('');
  const [isDeveloperUnlimited] = useState(getDeveloperUnlimited);
  const [remaining, setRemaining] = useState(getInitialRemaining);
  const [isSending, setIsSending] = useState(false);
  const [modeLabel, setModeLabel] = useState(`演示模式：${getJobsChatApiHint()}`);
  const [error, setError] = useState('');

  const canSend = useMemo(() => input.trim().length > 0 && (isDeveloperUnlimited || remaining > 0) && !isSending, [input, isDeveloperUnlimited, remaining, isSending]);

  const handleClear = () => {
    setMessages([initialAssistantMessage]);
    setInput('');
    setError('');
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !canSend) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      let replyText = normalizeAssistantReply(buildMockReply(content));
      let mode = 'mock';
      let reason = getJobsChatApiFallbackReason();
      const apiUrl = getJobsChatApiUrl();

      if (apiUrl) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text }))
            })
          });

          if (response.ok) {
            const payload = (await response.json()) as ChatApiResponse;
            replyText = normalizeAssistantReply(payload.reply || replyText);
            mode = payload.mode ?? mode;
            reason = payload.reason ?? reason;
          } else {
            reason = '模型接口暂时不可用，已自动回退到演示回复。';
          }
        } catch {
          reason = '模型接口暂时不可达，已自动回退到演示回复。';
        }
      }

      setModeLabel(
        mode === 'api'
          ? `在线模式：${reason || '当前回复已通过真实模型返回。'}`
          : `演示模式：${reason}`
      );

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
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(JOBS_CHAT_STORAGE_KEY, String(next));
        }
        return next;
      });
    } catch {
      setError('这次发送没有成功，你可以再试一次。');
    } finally {
      setIsSending(false);
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
            <span className="jobs-chat-kicker">Embodied AI Demo</span>
            <h1 id="jobs-chat-title" className="jobs-chat-title">
              {JOBS_CHAT_TITLE}
            </h1>
            <p className="jobs-chat-subtitle">{JOBS_CHAT_DESCRIPTION}</p>
          </section>

          <section className="jobs-chat-panel" aria-label="虚拟乔布斯对话区域">
            <div className="jobs-chat-panel__topline">
              <p className="jobs-chat-panel__mode">{modeLabel}</p>
              <span className="jobs-chat-panel__quota">{isDeveloperUnlimited ? '开发调试：不限次数' : `剩余体验：${remaining}/${JOBS_CHAT_FREE_LIMIT}`}</span>
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
                  <p className="jobs-chat-message__text">
                    {message.role === 'assistant' ? normalizeAssistantReply(message.content) : message.content}
                  </p>
                </article>
              ))}
            </div>

            <form className="jobs-chat-form" onSubmit={sendMessage}>
              <label className="jobs-chat-form__label" htmlFor="jobs-chat-input">
                把你当前最想解决的业务问题，用一句话说清楚
              </label>
              <textarea
                id="jobs-chat-input"
                className="jobs-chat-form__input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="例如：我的小公司想用 AI 提高销售转化，但不知道先从哪里下手。"
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

              <p className="jobs-chat-form__note">本 Demo 不保存聊天记录，关闭或刷新页面后，对话将自动清空。</p>
              {error ? <p className="jobs-chat-form__error">{error}</p> : null}
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
