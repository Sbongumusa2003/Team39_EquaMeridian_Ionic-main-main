import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, map, of, switchMap, tap, throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppToastService } from '../services/toast.service';
import { defaultMessageFor, extractMessage, isBackgroundRequest } from '../utils/http-error';

/**
 * Every failed request passes through here:
 *  1. an expired session (401 from a protected API) clears the session and opens the login page;
 *  2. the error is normalised so `err.error.message` is ALWAYS a friendly sentence - even when the server was
 *     unreachable, timed out, or the failed request was a download (Blob body) - so every page that shows
 *     `err.error.message` shows a consistent, readable message;
 *  3. system-level failures (no connection, server errors, timeouts, expired session) also raise a toast.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(AppToastService);

  const normalise = (err: HttpErrorResponse): Observable<HttpErrorResponse> => {
    const build = (body: any): HttpErrorResponse => {
      const isPlainObject = body && typeof body === 'object'
        && !(body instanceof Blob) && !(typeof ProgressEvent !== 'undefined' && body instanceof ProgressEvent);
      const obj: any = isPlainObject ? { ...body } : {};
      obj.message = err.status === 0 ? defaultMessageFor(0) : (extractMessage(body) ?? defaultMessageFor(err.status));
      return new HttpErrorResponse({
        error: obj, headers: err.headers, status: err.status, statusText: err.statusText, url: err.url ?? undefined
      });
    };
    if (err.error instanceof Blob) {
      return from(err.error.text().then(t => { try { return JSON.parse(t); } catch { return t; } })).pipe(map(build));
    }
    return of(build(err.error));
  };

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = /\/auth\//.test(req.url) || /\/login/.test(req.url);
      let sessionExpired = false;
      if (err.status === 401 && !isAuthEndpoint && auth.isLoggedIn) {
        sessionExpired = true;
        // Clear session without navigating to landing mid-request
        try {
          localStorage.removeItem('equa_user');
        } catch { /* ignore */ }
        // Prefer AuthService storage key if available
        try { (auth as any).currentUserSubject?.next?.(null); } catch { /* ignore */ }
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url.startsWith('/auth') ? '/tabs/home' : router.url }
        });
      }

      return normalise(err).pipe(
        tap(normalised => {
          const systemLevel = normalised.status === 0 || normalised.status >= 500
            || normalised.status === 408 || normalised.status === 429;
          if (sessionExpired) {
            void toast.error(defaultMessageFor(401));
          } else if (systemLevel && !isBackgroundRequest(req.method, req.url)) {
            void toast.error(normalised.error.message);
          }
        }),
        switchMap(normalised => throwError(() => normalised))
      );
    })
  );
};
