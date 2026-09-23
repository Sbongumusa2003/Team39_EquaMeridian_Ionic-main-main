import { HttpErrorResponse } from '@angular/common/http';

/**
 * One place that decides what a failed request should say to the user.
 * The API always answers errors as { message, statusCode, traceId }, but the browser produces its own
 * failures too (server unreachable, timeouts, file downloads that fail with a Blob body...).
 */
const BY_STATUS: Record<number, string> = {
  0: 'We could not reach the server. Please check your internet connection and try again.',
  400: 'Some of the information you entered is not valid. Please check it and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  405: "That action isn't supported.",
  408: 'The request took too long. Please try again.',
  409: 'That action conflicts with the current state of the data. Please refresh and try again.',
  413: 'The file you chose is too large.',
  415: "That file type isn't supported.",
  422: 'Some of the information you entered is not valid. Please check it and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again in a moment.',
  502: 'A connected service is unavailable right now. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again in a moment.',
  504: 'The request took too long. Please try again.'
};

export function defaultMessageFor(status: number): string {
  return BY_STATUS[status] ?? (status >= 500 ? BY_STATUS[500] : 'Something went wrong. Please try again.');
}

/** Best user-facing sentence found in a response body, or null when there is none. */
export function extractMessage(body: any): string | null {
  if (!body) return null;
  if (typeof body === 'string') {
    const t = body.trim();
    // Only accept plain sentences - never HTML error pages or bare words like "Not Found".
    return t.length > 3 && !t.startsWith('<') && t.length < 300 && /[a-z]/i.test(t) && /[.!?]$/.test(t) ? t : null;
  }
  if (typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (body.errors && typeof body.errors === 'object') {           // ASP.NET ValidationProblemDetails
      const msgs = ([] as any[]).concat(...(Object.values(body.errors) as any[])).filter((m: any) => typeof m === 'string');
      if (msgs.length) return msgs.join(' ');
    }
    if (typeof body.title === 'string' && body.title.trim() && !/^One or more validation errors/i.test(body.title))
      return body.title.trim();
  }
  return null;
}

/** Friendly message for any error a component catches. */
export function friendlyMessage(err: any, fallback?: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return defaultMessageFor(0);
    return extractMessage(err.error) ?? fallback ?? defaultMessageFor(err.status);
  }
  return extractMessage(err?.error) ?? extractMessage(err) ?? fallback ?? 'Something went wrong. Please try again.';
}

/** Background polling that should fail quietly instead of popping a message every minute. */
export function isBackgroundRequest(method: string, url: string): boolean {
  return method === 'GET' && /\/(notifications|cart\/count|chatbot)/i.test(url);
}
