import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RevenueControlBreakReportDto,
  DemandTrendReportDto,
  ActiveListingsReportDto,
  MonthlyOverviewReportDto,
  PendingSupplierApprovalsReportDto,
  OpenDisputesReportDto,
  SupplierPerformanceReportDto,
  ReportExportFormat
} from '../models/report.models';
import { SUPPRESS_403_REDIRECT } from '../http-context-tokens';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) {}

  private buildParams(from?: string, to?: string, categoryId?: number): HttpParams {
    let p = new HttpParams();
    if (from) p = p.set('from', from);
    if (to) p = p.set('to', to);
    if (categoryId) p = p.set('categoryId', categoryId.toString());
    return p;
  }

  /** Export params include a cache-buster so the browser never reuses a stale file. */
  private exportParams(from?: string, to?: string, categoryId?: number): HttpParams {
    return this.buildParams(from, to, categoryId).set('_ts', Date.now().toString());
  }

  private exportContext() {
    return new HttpContext().set(SUPPRESS_403_REDIRECT, true);
  }

  private exportOptions(from?: string, to?: string, categoryId?: number) {
    return {
      params: this.exportParams(from, to, categoryId),
      responseType: 'blob' as const,
      context: this.exportContext(),
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      }
    };
  }

  // ---- Revenue Summary ----
  getRevenueSummary(from?: string, to?: string, categoryId?: number): Observable<RevenueControlBreakReportDto> {
    return this.http.get<RevenueControlBreakReportDto>(`${this.apiUrl}/revenue-summary`, {
      params: this.buildParams(from, to, categoryId)
    });
  }

  exportRevenue(format: ReportExportFormat, from?: string, to?: string, categoryId?: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/revenue-summary/export/${format}`, this.exportOptions(from, to, categoryId));
  }

  // ---- Demand Trends ----
  getDemandTrends(from?: string, to?: string): Observable<DemandTrendReportDto> {
    return this.http.get<DemandTrendReportDto>(`${this.apiUrl}/demand-trends`, {
      params: this.buildParams(from, to)
    });
  }

  exportDemandTrends(format: 'csv' | 'pdf' | 'xlsx', from?: string, to?: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/demand-trends/export/${format}`, this.exportOptions(from, to));
  }

  // ---- Active Listings ----
  getActiveListings(): Observable<ActiveListingsReportDto> {
    return this.http.get<ActiveListingsReportDto>(`${this.apiUrl}/active-listings`);
  }

  exportActiveListings(format: 'csv' | 'pdf' | 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/active-listings/export/${format}`, this.exportOptions());
  }

  // ---- Monthly Overview ----
  getMonthlyOverview(from?: string, to?: string): Observable<MonthlyOverviewReportDto> {
    return this.http.get<MonthlyOverviewReportDto>(`${this.apiUrl}/monthly-overview`, {
      params: this.buildParams(from, to)
    });
  }

  exportMonthlyOverview(format: 'pdf' | 'xlsx', from?: string, to?: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/monthly-overview/export/${format}`, this.exportOptions(from, to));
  }

  // ---- Pending Suppliers ----
  getPendingSuppliers(): Observable<PendingSupplierApprovalsReportDto> {
    return this.http.get<PendingSupplierApprovalsReportDto>(`${this.apiUrl}/pending-suppliers`);
  }

  exportPendingSuppliers(format: 'csv' | 'pdf' | 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pending-suppliers/export/${format}`, this.exportOptions());
  }

  // ---- Open Disputes ----
  getOpenDisputes(): Observable<OpenDisputesReportDto> {
    return this.http.get<OpenDisputesReportDto>(`${this.apiUrl}/open-disputes`);
  }

  exportOpenDisputes(format: 'csv' | 'pdf' | 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/open-disputes/export/${format}`, this.exportOptions());
  }

  // ---- Supplier Performance ----
  getSupplierPerformance(from?: string, to?: string): Observable<SupplierPerformanceReportDto> {
    return this.http.get<SupplierPerformanceReportDto>(`${this.apiUrl}/supplier-performance`, {
      params: this.buildParams(from, to)
    });
  }

  exportSupplierPerformance(format: 'csv' | 'pdf' | 'xlsx', from?: string, to?: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/supplier-performance/export/${format}`, this.exportOptions(from, to));
  }
}
