import { Injectable } from '@angular/core';

/** Saves/opens a Blob returned by the API (PDFs, calendar files, proof-of-payment images). */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  open(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
