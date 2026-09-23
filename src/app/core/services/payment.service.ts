import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InitiatePaymentResponseDto, PaymentStatusDto, PaymentHistoryPagedResult, ReceiptDataDto
} from '../models/payment.models';
import { SupplierPaymentHistoryPagedResult } from '../models/payout.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initiate(invoiceId: number): Observable<InitiatePaymentResponseDto> {
    // client=mobile makes the API send the buyer back to this app's /tabs/payment-success | payment-cancelled pages.
    return this.http.post<InitiatePaymentResponseDto>(`${this.apiUrl}/invoices/${invoiceId}/initiate`, {}, { params: { client: 'mobile' } });
  }

  uploadEftProof(invoiceId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/invoices/${invoiceId}/eft-proof`, fd);
  }

  downloadEftProof(invoiceId: number) {
    return this.http.get(`${this.apiUrl}/invoices/${invoiceId}/eft-proof`, { responseType: 'blob' });
  }

  confirmEftReceived(invoiceId: number) {
    return this.http.post(`${this.apiUrl}/invoices/${invoiceId}/eft-received`, {});
  }

  getStatus(bookingId: number): Observable<PaymentStatusDto> {
    return this.http.get<PaymentStatusDto>(`${this.apiUrl}/bookings/${bookingId}/status`);
  }

  getHistory(params: {
    status?: string; from?: string; to?: string; sort?: string; page?: number; pageSize?: number;
  } = {}): Observable<PaymentHistoryPagedResult> {
    let p = new HttpParams();
    if (params.status) p = p.set('Status', params.status);
    if (params.from)   p = p.set('From', params.from);
    if (params.to)     p = p.set('To', params.to);
    p = p.set('Sort', params.sort ?? 'Newest');
    p = p.set('Page', (params.page ?? 1).toString());
    p = p.set('PageSize', (params.pageSize ?? 20).toString());
    return this.http.get<PaymentHistoryPagedResult>(`${this.apiUrl}/history`, { params: p });
  }

  getReceipt(invoiceId: number): Observable<ReceiptDataDto> {
    return this.http.get<ReceiptDataDto>(`${this.apiUrl}/invoices/${invoiceId}/receipt`);
  }

  getSupplierHistory(params: {
    status?: string; page?: number; pageSize?: number;
  } = {}): Observable<SupplierPaymentHistoryPagedResult> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 20).toString());
    return this.http.get<SupplierPaymentHistoryPagedResult>(`${this.apiUrl}/supplier-history`, { params: p });
  }

  /** POST form to PayFast process URL (card checkout). */
  redirectToCheckout(response: InitiatePaymentResponseDto): void {
    if (!response.processUrl || !response.fields) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = response.processUrl;
    Object.entries(response.fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }
}
