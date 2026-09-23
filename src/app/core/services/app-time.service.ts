import { Injectable } from '@angular/core';

/**
 * South Africa Standard Time (UTC+2, no DST).
 * Backend stores and returns timestamps in SAST via AppTime.Now.
 * Use this helper when formatting dates in the UI so labels stay consistent.
 */
@Injectable({ providedIn: 'root' })
export class AppTimeService {
  readonly timeZone = 'Africa/Johannesburg';
  readonly label = 'SAST';

  /** Format an ISO/date string or Date in SAST. */
  format(
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }
  ): string {
    if (value == null || value === '') return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-ZA', { ...options, timeZone: this.timeZone }).format(d);
  }

  formatDate(value: string | Date | null | undefined): string {
    return this.format(value, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  formatDateTime(value: string | Date | null | undefined): string {
    const formatted = this.format(value);
    return formatted ? `${formatted} ${this.label}` : '';
  }

  now(): Date {
    // Browser local may differ; for display prefer format() with timeZone.
    return new Date();
  }
}
