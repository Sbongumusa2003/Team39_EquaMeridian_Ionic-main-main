import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceDto, InvoicesPagedResult } from '../models/invoice.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private baseUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getAll(params: { page?: number; pageSize?: number }): Observable<InvoicesPagedResult> {
    let p = new HttpParams();
    p = p.set('page',     (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<InvoicesPagedResult>(this.baseUrl, { params: p });
  }

  getById(id: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.baseUrl}/${id}`);
  }

  adminGenerate(quotationId: number): Observable<{ message: string; invoice: InvoiceDto }> {
    return this.http.post<{ message: string; invoice: InvoiceDto }>(
      `${this.baseUrl}/quotations/${quotationId}/generate`, {}
    );
  }

  /** Invoice as a PDF (contractor: "Download Invoice"). */
  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
