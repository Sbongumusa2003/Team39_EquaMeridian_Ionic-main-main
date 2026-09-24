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
}
