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
  trimTrailingSlash
} from '../src/features/figure-chat/core';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export default async function handler(req: any, res: any) {
  applyFigureChatCors(req, res, parseFigureChatAllowedOrigins(env.ALLOWED_ORIGINS));

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(getFigureChatHealthPayload(Boolean(env.OPENAI_API_KEY)));
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = parseFigureChatRequestBody(req.body);
  const figureId = normalizeFigureChatId(body.figureId);
  const messages = sanitizeFigureChatMessages(body.messages);
  const latestUserMessage = [...messages].reverse().find((item) => item.role === 'user');
  const content = latestUserMessage?.content || '';

  if (!content) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = trimTrailingSlash(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  const figureDefinition = getFigureChatModelDefinition(figureId);
  const directReply = resolveFigureChatDirectReply(figureId, content);

  if (directReply) {
    const hasApiKey = Boolean(apiKey);
    const reply = figureId === 'zhang-yiming' ? polishZhangYimingReply(directReply.reply, content) : directReply.reply;

    res.status(200).json(
      buildFigureChatResponse({
        reply,
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
        temperature: figureDefinition.temperature ?? 0.1,
        messages: [{ role: 'system', content: figureDefinition.systemPrompt }, ...messages]
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

    const data = await response.json();
    const reply = normalizeFigureChatText(data?.choices?.[0]?.message?.content);
    const finalReply = figureId === 'zhang-yiming' ? polishZhangYimingReply(reply, content) : reply;

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
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
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
