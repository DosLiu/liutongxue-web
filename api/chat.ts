import { JOBS_SYSTEM_PROMPT, buildMockReply } from '../src/config/jobsPersona.ts';

type IncomingMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://dosliu.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const parseAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
};

const isAllowedOrigin = (origin: string | undefined, allowedOrigins: Set<string>) => {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const applyCors = (req: any, res: any) => {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = req.headers.origin as string | undefined;
  const allowOrigin = isAllowedOrigin(requestOrigin, allowedOrigins)
    ? requestOrigin
    : DEFAULT_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

const mockResponse = (message: string, reason = '接口未配置模型 key，返回演示回复。') => ({
  reply: buildMockReply(message),
  mode: 'mock',
  reason
});

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as RequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const latestUserMessage = [...messages].reverse().find((item) => item.role === 'user');
  const content = latestUserMessage?.content?.trim() || '';

  if (!content) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = trimTrailingSlash(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');

  if (!apiKey) {
    res.status(200).json(mockResponse(content));
    return;
  }

  const requestMessages = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({ role: message.role, content: message.content.trim() }))
    .filter((message) => message.content)
    .slice(-12);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: JOBS_SYSTEM_PROMPT },
          ...requestMessages
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(200).json(
        mockResponse(
          content,
          `模型接口返回异常，已自动回退到演示回复。${errorText ? `（${errorText.slice(0, 120)}）` : ''}`
        )
      );
      return;
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      reply: reply || buildMockReply(content),
      mode: 'api',
      reason: '当前回复已通过真实模型返回。'
    });
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    res.status(200).json(
      mockResponse(content, isTimeout ? '模型接口响应超时，已自动回退到演示回复。' : '当前环境未连上模型 API，已自动回退到演示回复。')
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
