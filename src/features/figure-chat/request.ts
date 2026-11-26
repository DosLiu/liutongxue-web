import { isFigureChatApiResponse, type FigureChatApiResponse, type RequestBody } from '../../../api/_lib/figure-chat.js';

export const isStaticChatResponse = (response: Response) => response.status === 404 || response.status === 405 ||
  (response.ok && response.headers.get('content-type')?.includes('text/html'));

export async function requestFigureChatHealth(apiUrl: string, signal: AbortSignal, allowStaticFallback = false) {
  const response = await fetch(apiUrl, { method: 'GET', credentials: 'include', signal });
  if (allowStaticFallback && isStaticChatResponse(response)) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok || !isFigureChatApiResponse(payload)) throw new Error('Invalid chat health response');
  return payload;
}

export async function requestFigureChat(apiUrl: string, body: RequestBody, signal: AbortSignal) {
  const send = async () => {
    const response = await fetch(apiUrl, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal
    });
    const raw = await response.json().catch(() => null);
    return { response, payload: isFigureChatApiResponse(raw) ? raw as FigureChatApiResponse : null };
  };
  const result = await send();
  // A first visit can receive its anonymous cookie here if the health request failed.
  if (result.response.status === 428 && result.payload?.error === 'guest_session_required') return send();
  return result;
}
