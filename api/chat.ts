import { readSessionFromRequest } from './_lib/auth.js';
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
  trimTrailingSlash,
  type FigureChatQuota
} from './_lib/figure-chat.js';
import { getAccountQuotaSnapshot, reserveAccountQuotaSlot, rollbackAccountQuotaSlot } from './_lib/quota.js';
import { buildDigitalHumanSystemPrompt, loadDigitalHumanKnowledge } from './_lib/digital-human-skill.js';
import {
  getGuestQuotaSnapshot, readOrCreateGuestIdentity, reserveGuestQuotaSlot, rollbackGuestQuotaSlot,
  type GuestReservation
} from './_lib/guest-quota.js';

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
const allowedOrigins = parseFigureChatAllowedOrigins(env.ALLOWED_ORIGINS);

export default async function handler(req: any, res: any) {
  applyFigureChatCors(req, res, allowedOrigins);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const session = req.method === 'GET' || req.method === 'POST' ? await readSessionFromRequest(req) : null;
  const subject = session?.subject;

  if (req.method === 'GET') {
    const quota = subject ? await getAccountQuotaSnapshot(subject) : await getGuestQuotaSnapshot(readOrCreateGuestIdentity(req, res).identity);
    const sendHealth = (payload: ReturnType<typeof getFigureChatHealthPayload>) => res.status(200).json({ ...payload, quota });
    if (env.OPENAI_API_KEY && !quota.enforced) {
      sendHealth(buildFigureChatResponse({ reply: '', mode: 'mock', status: 'offline', reason: quota.reason || '次数校验暂时不可用。', shouldConsume: false }));
      return;
    }
    if (req.query?.figureId === 'liu-dongsheng') {
      if (!env.OPENAI_API_KEY || !env.DIGITAL_HUMAN_GITHUB_TOKEN) {
        sendHealth(buildFigureChatResponse({ reply: '', mode: 'mock', status: 'offline', reason: '数字分身服务尚未配置完成。', shouldConsume: false }));
        return;
      }
      try {
        const knowledge = await loadDigitalHumanKnowledge(env.DIGITAL_HUMAN_GITHUB_TOKEN);
        sendHealth(buildFigureChatResponse({ reply: '', mode: 'api', status: 'api', reason: knowledge.stale ? '资料暂时未能更新，当前使用上次成功读取的版本。' : '资料已连接，模型将在对话时验证。', shouldConsume: false }));
      } catch {
        sendHealth(buildFigureChatResponse({ reply: '', mode: 'mock', status: 'offline', reason: '数字分身资料暂时无法连接。', shouldConsume: false }));
      }
      return;
    }
    sendHealth(getFigureChatHealthPayload(Boolean(env.OPENAI_API_KEY)));
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
  const hasApiKey = Boolean(apiKey);
  const model = env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = trimTrailingSlash(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  const figureDefinition = getFigureChatModelDefinition(figureId);
  let systemPrompt = figureDefinition.systemPrompt;
  let usingStaleKnowledge = false;
  if (figureId === 'liu-dongsheng' && apiKey) {
    try {
      const knowledge = await loadDigitalHumanKnowledge(env.DIGITAL_HUMAN_GITHUB_TOKEN);
      systemPrompt = buildDigitalHumanSystemPrompt(knowledge);
      usingStaleKnowledge = Boolean(knowledge.stale);
    } catch {
      res.status(200).json(buildFigureChatMockResponse(figureId, content, '数字分身资料暂时无法连接，请稍后再试。', 'offline'));
      return;
    }
  }
  const directReply = resolveFigureChatDirectReply(figureId, content);
  const shouldUseDirectReply = Boolean(directReply);
  const shouldCallModel = hasApiKey && !shouldUseDirectReply;
  let accountQuota: FigureChatQuota | undefined;
  let reservedAccountQuota = false;
  let quotaReservationDate: Date | undefined;
  let guestReservation: GuestReservation | undefined;
  const restoreQuota = async () => {
    if (guestReservation) {
      const reservation = guestReservation;
      guestReservation = undefined;
      return rollbackGuestQuotaSlot(reservation);
    }
    if (reservedAccountQuota && subject) {
      reservedAccountQuota = false;
      return rollbackAccountQuotaSlot(subject, quotaReservationDate);
    }
    return accountQuota;
  };

  if (subject) {
    if (shouldCallModel) {
      quotaReservationDate = new Date();
      const reservation = await reserveAccountQuotaSlot(subject, quotaReservationDate);
      accountQuota = reservation.quota;
      reservedAccountQuota = reservation.reserved;

      if (!reservation.allowed) {
        const unavailable = reservation.quota.mode === 'unavailable';
        res.status(unavailable ? 503 : 429).json(
          buildFigureChatResponse({
            error: unavailable ? 'quota_unavailable' : 'quota_exhausted',
            quota: reservation.quota,
            reply: '',
            mode: unavailable ? 'mock' : 'api',
            status: unavailable ? 'offline' : 'api',
            reason: reservation.quota.reason || '当前账号今日次数已用完。',
            shouldConsume: false
          })
        );
        return;
      }
    } else {
      accountQuota = await getAccountQuotaSnapshot(subject);

      if (accountQuota.exhausted) {
        res.status(429).json(
          buildFigureChatResponse({
            error: 'quota_exhausted',
            quota: accountQuota,
            reply: '',
            mode: 'mock',
            status: 'mock',
            reason: accountQuota.reason || '当前账号今日次数已用完。',
            shouldConsume: false
          })
        );
        return;
      }
    }
  }

  if (!subject && shouldCallModel) {
    const guest = readOrCreateGuestIdentity(req, res);
    if (!guest.identity || guest.created) {
      const quota = await getGuestQuotaSnapshot(guest.identity);
      const ready = Boolean(quota.enforced);
      res.status(ready ? 428 : 503).json(buildFigureChatResponse({
        error: ready ? 'guest_session_required' : 'guest_quota_unavailable', quota, reply: '', mode: 'mock', status: 'offline',
        reason: ready ? '需要启用浏览器 Cookie 才能使用游客体验，请重试。' : quota.reason || '游客体验暂时不可用。',
        shouldConsume: false
      }));
      return;
    }
    const reservation = await reserveGuestQuotaSlot(guest.identity);
    accountQuota = reservation.quota;
    guestReservation = reservation.reservation;
    if (!reservation.allowed) {
      const exhausted = Boolean(reservation.quota.exhausted);
      res.status(exhausted ? 429 : 503).json(buildFigureChatResponse({
        error: exhausted ? 'quota_exhausted' : 'guest_quota_unavailable', quota: reservation.quota,
        reply: '', mode: 'mock', status: exhausted ? 'mock' : 'offline',
        reason: reservation.quota.reason || '游客体验暂时不可用。', shouldConsume: false
      }));
      return;
    }
  }

  if (directReply) {
    res.status(200).json(
      buildFigureChatResponse({
        quota: accountQuota,
        reply: figureId === 'zhang-yiming' ? polishZhangYimingReply(directReply.reply, content) : directReply.reply,
        mode: 'mock',
        status: 'mock',
        reason: directReply.reason,
        shouldConsume: false
      })
    );
    return;
  }

  if (!apiKey) {
    res.status(200).json(buildFigureChatMockResponse(figureId, content, '当前未配置模型 key，已自动切到演示模式。', 'mock', accountQuota));
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
        messages: [{ role: 'system', content: systemPrompt }, ...messages]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      const restoredQuota = await restoreQuota();
      res.status(200).json(
        buildFigureChatMockResponse(
          figureId,
          content,
          figureId === 'liu-dongsheng' ? '数字分身暂时无法连接模型，请稍后再试。' : '模型接口返回异常，已自动切到演示模式。',
          'mock',
          restoredQuota
        )
      );
      return;
    }

    const data = await response.json();
    const reply = normalizeFigureChatText(data?.choices?.[0]?.message?.content);
    const finalReply = figureId === 'zhang-yiming' ? polishZhangYimingReply(reply, content) : reply;

    if (!finalReply) {
      const restoredQuota = await restoreQuota();
      res.status(200).json(buildFigureChatMockResponse(figureId, content, '模型接口返回了空内容，已自动切到演示模式。', 'mock', restoredQuota));
      return;
    }

    const replyQuota = guestReservation && Date.parse(guestReservation.resetAt) <= Date.now()
      ? await getGuestQuotaSnapshot(guestReservation.identity)
      : accountQuota;
    res.status(200).json(
      buildFigureChatResponse({
        quota: replyQuota,
        reply: finalReply,
        mode: 'api',
        status: 'api',
        reason: usingStaleKnowledge ? '资料暂时未能更新，当前使用上次成功读取的版本。' : '当前回复来自真实模型。',
        shouldConsume: true
      })
    );
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    const restoredQuota = await restoreQuota();
    res.status(200).json(
      buildFigureChatMockResponse(
        figureId,
        content,
        isTimeout ? '模型接口响应超时，已自动切到演示模式。' : '当前环境未连上模型 API，已自动切到演示模式。',
        'mock',
        restoredQuota
      )
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
