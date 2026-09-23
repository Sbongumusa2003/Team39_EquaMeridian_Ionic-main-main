import { Component, Input } from '@angular/core';

export type PillTone = 'ok' | 'warn' | 'bad' | 'info' | 'mute';

/** Maps any status text used by the API to a consistent colour tone. */
export function toneFor(status: string | null | undefined): PillTone {
  const s = (status ?? '').toLowerCase();
  if (!s) return 'mute';
  // Same colour for the same status as the web app (see status-badge.component.scss).
  if (/eftsubmitted|eft submitted|pending_(supplier|contractor)/.test(s)) return 'warn';   // needs attention
  if (/(inactive|deactivat|draft|closed|archiv|withdrawn|void|supersed|expired|ended|disabled)/.test(s)) return 'mute';
  if (/(cancel|fail|reject|declin|overdue|suspend|disput|damag|denied|flagged|unavailable|locked|deleted)/.test(s)) return 'bad';
  if (/(paid|complete|active|approved|accept|confirmed|signed|resolved|delivered|released|verified|good|available|processed|published|open for)/.test(s)) return 'ok';
  if (/(pending|await|escalat|request|review|ready|partial|processing|out for|fair|open|unsigned)/.test(s)) return 'warn';
  if (/(progress|transit|scheduled|quot|submitted|refund)/.test(s)) return 'info';
  return 'mute';
}

/** API statuses are often CamelCase ("EftSubmitted"); show them the way people read them. */
export function pretty(status: string | null | undefined): string {
  const s = (status ?? '').trim();
  if (!s) return '';
  if (/^eftsubmitted$/i.test(s)) return 'EFT proof submitted';
  if (/^pending_supplier$/i.test(s)) return 'Awaiting supplier signature';
  if (/^pending_contractor$/i.test(s)) return 'Awaiting contractor signature';
  return s.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\bEft\b/g, 'EFT');
}

@Component({
  standalone: true,
  selector: 'app-status-pill',
  template: `<span class="pill" [class]="tone">{{ text || '—' }}</span>`,
})
export class StatusPillComponent {
  @Input() status: string | null | undefined = '';
  @Input() label = '';
  @Input() set force(t: PillTone | '') { this._force = t; }
  private _force: PillTone | '' = '';
  get text(): string { return this.label || pretty(this.status); }
  get tone(): PillTone { return this._force || toneFor(this.status); }
}
