import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BlockedTermDto {
  blockedTermID: number;
  term: string;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class ContentRulesService {
  private apiUrl = `${environment.apiUrl}/admin/content-rules/blocked-terms`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BlockedTermDto[]> {
    return this.http.get<BlockedTermDto[]>(this.apiUrl);
  }

  add(term: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, { term });
  }

  remove(blockedTermId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blockedTermId}`);
  }
}
