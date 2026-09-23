import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type DataExportReason =
  | 'RegulatoryAudit'
  | 'FinancialReconciliation'
  | 'DisputeInvestigation'
  | 'Other';

@Injectable({ providedIn: 'root' })
export class DataExportService {
  private apiUrl = `${environment.apiUrl}/admin/data-export`;

  constructor(private http: HttpClient) {}

  exportListings(
    format: 'json' | 'xml',
    reason: DataExportReason,
    reasonDetails?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format)
      .set('reason', reason);
    if (reasonDetails?.trim()) {
      params = params.set('reasonDetails', reasonDetails.trim());
    }
    return this.http.get(`${this.apiUrl}/listings`, {
      params,
      responseType: 'blob'
    });
  }

  exportBookings(
    format: 'json' | 'xml',
    reason: DataExportReason,
    reasonDetails?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format)
      .set('reason', reason);
    if (reasonDetails?.trim()) {
      params = params.set('reasonDetails', reasonDetails.trim());
    }
    return this.http.get(`${this.apiUrl}/bookings`, {
      params,
      responseType: 'blob'
    });
  }
}
