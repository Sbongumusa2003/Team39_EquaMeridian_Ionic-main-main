import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogsPagedResult, AuditLogDetailDto, AuditLogUserOptionDto } from '../models/audit-log.models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/admin/audit-log`;

  constructor(private http: HttpClient) {}

  getAll(params: {
    search?: string; eventType?: string; userId?: number;
    from?: string; to?: string; page?: number; pageSize?: number;
  }): Observable<AuditLogsPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.eventType) p = p.set('eventType', params.eventType);
    if (params.userId) p = p.set('userId', params.userId.toString());
    if (params.from) p = p.set('from', params.from);
    if (params.to) p = p.set('to', params.to);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 25).toString());
    return this.http.get<AuditLogsPagedResult>(this.apiUrl, { params: p });
  }

  getEventTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/event-types`);
  }

  getUsers(): Observable<AuditLogUserOptionDto[]> {
    return this.http.get<AuditLogUserOptionDto[]>(`${this.apiUrl}/users`);
  }

  getById(id: number): Observable<AuditLogDetailDto> {
    return this.http.get<AuditLogDetailDto>(`${this.apiUrl}/${id}`);
  }

  private buildExportParams(params: {
    search?: string; eventType?: string; userId?: number; from?: string; to?: string;
  }): HttpParams {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.eventType) p = p.set('eventType', params.eventType);
    if (params.userId) p = p.set('userId', params.userId.toString());
    if (params.from) p = p.set('from', params.from);
    if (params.to) p = p.set('to', params.to);
    return p;
  }

  exportCsv(params: { search?: string; eventType?: string; userId?: number; from?: string; to?: string }): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, { params: this.buildExportParams(params), responseType: 'blob' });
  }

  exportPdf(params: { search?: string; eventType?: string; userId?: number; from?: string; to?: string }): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, { params: this.buildExportParams(params), responseType: 'blob' });
  }
}
