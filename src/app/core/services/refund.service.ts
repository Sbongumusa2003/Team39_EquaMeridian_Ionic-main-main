import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RefundsPagedResult, RefundDto } from '../models/refund.models';

@Injectable({ providedIn: 'root' })
export class RefundService {
  private apiUrl = `${environment.apiUrl}/admin/refunds`;
  private contractorUrl = `${environment.apiUrl}/contractor/refunds`;

  constructor(private http: HttpClient) {}

  getAll(params: { search?: string; status?: string; page?: number; pageSize?: number }): Observable<RefundsPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<RefundsPagedResult>(this.apiUrl, { params: p });
  }

  getById(id: number): Observable<RefundDto> {
    return this.http.get<RefundDto>(`${this.apiUrl}/${id}`);
  }

  process(id: number, payload: { newStatus: string; administratorNotes?: string; failureReason?: string }): Observable<RefundDto> {
    return this.http.patch<RefundDto>(`${this.apiUrl}/${id}/status`, payload);
  }

  /** Contractor self-service: request a refund on a paid invoice. */
  requestRefund(invoiceId: number, reason: string): Observable<RefundDto> {
    return this.http.post<RefundDto>(this.contractorUrl, { invoiceID: invoiceId, reason });
  }

  /** Contractor self-service: list my own refund requests. */
  getMyRefunds(): Observable<RefundDto[]> {
    return this.http.get<RefundDto[]>(this.contractorUrl);
  }
}
