import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppToastService } from './services/toast.service';

/**
 * Catches every error nobody else handled (a bug in a page, a rejected promise, a lazy page that failed to load).
 * The user gets one friendly message instead of a silently broken screen; the technical detail goes to the console.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(AppToastService);

  handleError(error: any): void {
    console.error(error);
    const err = error?.rejection ?? error;                 // unhandled promise rejections are wrapped
    if (err instanceof HttpErrorResponse) return;          // the HTTP interceptor already told the user

    const text = String(err?.message ?? err ?? '');
    if (/Loading chunk|dynamically imported module|ChunkLoadError/i.test(text)) {
      void this.toast.error('A new version of the app is available. Please restart or refresh the app.');
    } else {
      void this.toast.error('Something went wrong. Please try again. If it keeps happening, restart the app.');
    }
  }
}
