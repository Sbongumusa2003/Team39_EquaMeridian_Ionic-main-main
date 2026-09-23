import { Pipe, PipeTransform } from '@angular/core';

/** South African rand: `R 1 250` / `R 1 250.50`. Null-safe (renders an em dash). */
@Pipe({ name: 'zar', standalone: true })
export class ZarPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digits = 2): string {
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value);
    if (!isFinite(n)) return '—';
    const [int, dec] = Math.abs(n).toFixed(digits).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return `${n < 0 ? '-' : ''}R\u00A0${grouped}${dec ? '.' + dec : ''}`;
  }
}
