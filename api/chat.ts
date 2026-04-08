import { JOBS_SYSTEM_PROMPT, buildMockReply } from '../src/config/jobsPersona';

type IncomingMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
};

const mockResponse = (message: string) => ({
  reply: buildMockReply(message),
  mode: 'mock',
  reason: '接口未配置模型 key，返回占位回复。'
});

export default async function handler(req: any, res: any) {
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
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    res.status(200).json(mockResponse(content));
    return;
  }

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
          ...messages.map((message) => ({ role: message.role, content: message.content }))
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(200).json({
        ...mockResponse(content),
        reason: `模型接口返回异常，已自动回退到占位回复。${errorText ? `（${errorText.slice(0, 120)}）` : ''}`
      });
      return;
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      reply: reply || buildMockReply(content),
      mode: 'api',
      reason: '当前回复已通过 Vercel API 返回。'
    });
  } catch {
    res.status(200).json({
      ...mockResponse(content),
      reason: '当前环境未连上 API，已自动切换到占位回复。'
    });
  }
}
