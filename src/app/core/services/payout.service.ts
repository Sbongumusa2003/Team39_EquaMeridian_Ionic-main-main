import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EligibleInvoiceDto, PayoutDto, PayoutsPagedResult } from '../models/payout.models';

@Injectable({ providedIn: 'root' })
export class PayoutService {
  private adminUrl = `${environment.apiUrl}/admin/payouts`;
  private supplierUrl = `${environment.apiUrl}/supplier/payouts`;

  constructor(private http: HttpClient) {}

  getEligibleInvoices(): Observable<EligibleInvoiceDto[]> {
    return this.http.get<EligibleInvoiceDto[]>(`${this.supplierUrl}/eligible-invoices`);
  }

  getMyPayouts(): Observable<PayoutDto[]> {
    return this.http.get<PayoutDto[]>(this.supplierUrl);
  }

  requestPayout(invoiceId: number, supplierNotes?: string): Observable<PayoutDto> {
    return this.http.post<PayoutDto>(this.supplierUrl, { invoiceID: invoiceId, supplierNotes });
  }

  getAll(params: { search?: string; status?: string; page?: number; pageSize?: number }): Observable<PayoutsPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<PayoutsPagedResult>(this.adminUrl, { params: p });
  }

  getById(id: number): Observable<PayoutDto> {
    return this.http.get<PayoutDto>(`${this.adminUrl}/${id}`);
  }

  process(id: number, payload: { newStatus: string; administratorNotes?: string; declineReason?: string }): Observable<PayoutDto> {
    return this.http.patch<PayoutDto>(`${this.adminUrl}/${id}/status`, payload);
  }
}
