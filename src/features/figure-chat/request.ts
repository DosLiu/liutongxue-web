import { isFigureChatApiResponse, type FigureChatApiResponse, type RequestBody } from '../../../api/_lib/figure-chat.js';

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
