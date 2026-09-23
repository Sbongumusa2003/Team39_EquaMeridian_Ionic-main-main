import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserDto, UpdateAccountStatusDto, PagedResult } from '../models/user.models';

export interface AuditLogEntry {
  auditID: number;
  transactionType: string;
  description: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAll(params: {
    search?: string; role?: string; status?: string;
    page?: number; pageSize?: number;
  }): Observable<PagedResult<UserDto>> {
    let p = new HttpParams();
    if (params.search)   p = p.set('search',   params.search);
    if (params.role)     p = p.set('role',     params.role);
    if (params.status)   p = p.set('status',   params.status);
    if (params.page)     p = p.set('page',     params.page.toString());
    if (params.pageSize) p = p.set('pageSize', params.pageSize.toString());
    return this.http.get<PagedResult<UserDto>>(this.apiUrl, { params: p });
  }

  updateStatus(userId: number, dto: UpdateAccountStatusDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/status`, dto);
  }

  createInternalUser(dto: { fullName: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  changeRole(userId: number, role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/role`, { role });
  }

  getAuditLog(userId: number): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/${userId}/audit-log`).pipe(
      catchError(() => of([]))
    );
  }
}