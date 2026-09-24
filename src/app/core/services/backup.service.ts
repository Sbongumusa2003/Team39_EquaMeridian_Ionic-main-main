import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackupFileDto, RestoreBackupRequest } from '../models/backup.models';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private apiUrl = `${environment.apiUrl}/admin/backup`;

  constructor(private http: HttpClient) {}

  list(): Observable<BackupFileDto[]> {
    return this.http.get<BackupFileDto[]>(this.apiUrl);
  }

  create(): Observable<BackupFileDto> {
    return this.http.post<BackupFileDto>(this.apiUrl, {});
  }

  restore(dto: RestoreBackupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/restore`, dto);
  }

  delete(fileName: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${encodeURIComponent(fileName)}`
    );
  }

  /** Triggers a browser download of the backup JSON file. */
  download(fileName: string): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const url = `${this.apiUrl}/${encodeURIComponent(fileName)}`;
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => {
        // Fallback: open in new tab (auth may still apply via cookies if any)
        window.open(url, '_blank');
      });
  }
}
