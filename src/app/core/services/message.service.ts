import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ThreadsPagedResult, ThreadDetailDto, MessageDto, RecipientSearchResult } from '../models/message.models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getThreads(params: { search?: string; page?: number; pageSize?: number } = {}): Observable<ThreadsPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 20).toString());
    return this.http.get<ThreadsPagedResult>(`${this.apiUrl}/threads`, { params: p });
  }

  /** Looks up other users by name for the "New Message" recipient picker. */
  searchRecipients(search: string): Observable<RecipientSearchResult[]> {
    const p = new HttpParams().set('search', search);
    return this.http.get<RecipientSearchResult[]>(`${this.apiUrl}/recipients`, { params: p });
  }

  getThreadDetail(threadId: number): Observable<ThreadDetailDto> {
    return this.http.get<ThreadDetailDto>(`${this.apiUrl}/threads/${threadId}`);
  }

  /** Starts a new conversation (or continues one with the same recipient). */
  send(recipientId: number, body: string, attachment?: File): Observable<MessageDto> {
    const form = new FormData();
    form.append('RecipientID', recipientId.toString());
    form.append('Body', body);
    if (attachment) form.append('attachment', attachment, attachment.name);
    return this.http.post<MessageDto>(this.apiUrl, form);
  }

  reply(threadId: number, body: string, attachment?: File): Observable<MessageDto> {
    const form = new FormData();
    form.append('Body', body);
    if (attachment) form.append('attachment', attachment, attachment.name);
    return this.http.post<MessageDto>(`${this.apiUrl}/threads/${threadId}/reply`, form);
  }
}
