import { FormEvent, useMemo, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import {
  buildMockReply,
  JOBS_CHAT_DESCRIPTION,
  JOBS_CHAT_FREE_LIMIT,
  JOBS_CHAT_STORAGE_KEY,
  JOBS_CHAT_TITLE
} from '../config/jobsPersona';
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

const getInitialRemaining = () => {
  if (typeof window === 'undefined') return JOBS_CHAT_FREE_LIMIT;
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
  content: '说吧。你现在最该解决的业务问题是什么？不要讲一堆背景，先用一句话把真正的问题说清楚。'
};

export default function JobsChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(getInitialRemaining);
  const [isSending, setIsSending] = useState(false);
  const [modeLabel, setModeLabel] = useState('演示模式：当前环境未连上模型，系统将返回占位回复');
  const [error, setError] = useState('');

  const canSend = useMemo(() => input.trim().length > 0 && remaining > 0 && !isSending, [input, remaining, isSending]);

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
      let replyText = buildMockReply(content);
      let mode = 'mock';
      let reason = '当前环境未连上 API，前端本地兜底。';

      try {
        const response = await fetch('/api/chat', {
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
          replyText = payload.reply || replyText;
          mode = payload.mode ?? mode;
          reason = payload.reason ?? reason;
        }
      } catch {
        // Ignore network errors and keep local fallback reply.
      }

      setModeLabel(
        mode === 'api'
          ? '在线模式：当前回复已通过 Vercel API 返回'
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
              <span className="jobs-chat-panel__quota">剩余体验：{remaining}/{JOBS_CHAT_FREE_LIMIT}</span>
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
