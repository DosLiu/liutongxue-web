import {
  applyFigureChatCors,
  buildFigureChatMockResponse,
  buildFigureChatResponse,
  getFigureChatHealthPayload,
  getFigureChatModelDefinition,
  normalizeFigureChatId,
  normalizeFigureChatText,
  parseFigureChatAllowedOrigins,
  parseFigureChatRequestBody,
  polishZhangYimingReply,
  resolveFigureChatDirectReply,
  sanitizeFigureChatMessages,
  type FigureChatId,
  type IncomingMessage
} from '../src/features/figure-chat/core.ts';

type ServerEnv = Record<string, string | undefined>;

type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
  end: () => void;
};

type OpenAiMessage = IncomingMessage | { role: 'system'; content: string };

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const env: ServerEnv = (globalThis as { process?: { env?: ServerEnv } }).process?.env ?? {};
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const FIGURE_CHAT_MODEL_TIMEOUT_MS = 20000;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getOriginHeader = (headers?: ApiRequest['headers']) => {
  const value = headers?.origin;
  return Array.isArray(value) ? value[0] : value;
};

const formatFigureChatReply = (figureId: FigureChatId, reply: string, message: string) =>
  figureId === 'zhang-yiming' ? polishZhangYimingReply(reply, message) : reply;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyFigureChatCors(
    { headers: { origin: getOriginHeader(req.headers) } },
    res,
    parseFigureChatAllowedOrigins(env.ALLOWED_ORIGINS)
  );

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(getFigureChatHealthPayload(Boolean(env.OPENAI_API_KEY?.trim())));
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = parseFigureChatRequestBody(req.body);
  const figureId = normalizeFigureChatId(body.figureId);
  const messages = sanitizeFigureChatMessages(body.messages);
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const content = latestUserMessage?.content ?? '';

  if (!content) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const apiKey = env.OPENAI_API_KEY?.trim();
  const directReply = resolveFigureChatDirectReply(figureId, content);

  if (directReply) {
    const hasApiKey = Boolean(apiKey);

    res.status(200).json(
      buildFigureChatResponse({
        reply: formatFigureChatReply(figureId, directReply.reply, content),
        mode: hasApiKey ? 'api' : 'mock',
        status: hasApiKey ? 'api' : 'mock',
        reason: directReply.reason,
        shouldConsume: hasApiKey
      })
    );
    return;
  }

  if (!apiKey) {
    res.status(200).json(buildFigureChatMockResponse(figureId, content, '当前未配置模型 key，已自动切到演示模式。'));
    return;
  }

  const model = env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  const baseUrl = trimTrailingSlash(env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL);
  const figureDefinition = getFigureChatModelDefinition(figureId);
  const requestMessages: OpenAiMessage[] = [{ role: 'system', content: figureDefinition.systemPrompt }, ...messages];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FIGURE_CHAT_MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: figureDefinition.temperature ?? 0.1,
        messages: requestMessages
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(200).json(
        buildFigureChatMockResponse(
          figureId,
          content,
          `模型接口返回异常，已自动切到演示模式。${errorText ? `（${errorText.slice(0, 120)}）` : ''}`
        )
      );
      return;
    }

    const data = (await response.json()) as OpenAiChatCompletionResponse;
    const reply = normalizeFigureChatText(data.choices?.[0]?.message?.content);
    const finalReply = formatFigureChatReply(figureId, reply, content);

    if (!finalReply) {
      res.status(200).json(buildFigureChatMockResponse(figureId, content, '模型接口返回了空内容，已自动切到演示模式。'));
      return;
    }

    res.status(200).json(
      buildFigureChatResponse({
        reply: finalReply,
        mode: 'api',
        status: 'api',
        reason: '当前回复来自真实模型。',
        shouldConsume: true
      })
    );
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    res.status(200).json(
      buildFigureChatMockResponse(
        figureId,
        content,
        isTimeout ? '模型接口响应超时，已自动切到演示模式。' : '当前环境未连上模型 API，已自动切到演示模式。'
      )
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
