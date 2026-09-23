import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InspectionsPagedResult, InspectionListItemDto, InspectionOutcomeDto,
  MachineryOptionDto, RequestInspectionDto, ConfirmOutcomeDto
} from '../models/inspection.models';

@Injectable({ providedIn: 'root' })
export class InspectionService {
  private adminUrl = `${environment.apiUrl}/admin/inspections`;
  private supplierUrl = `${environment.apiUrl}/supplier/inspections`;
  private contractorUrl = `${environment.apiUrl}/contractor/inspections`;

  constructor(private http: HttpClient) {}

  // Admin
  adminGetAll(params: { status?: string; page?: number; pageSize?: number }): Observable<InspectionsPagedResult> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<InspectionsPagedResult>(this.adminUrl, { params: p });
  }

  adminGetById(id: number): Observable<InspectionListItemDto> {
    return this.http.get<InspectionListItemDto>(`${this.adminUrl}/${id}`);
  }

  adminGetAvailableMachinery(): Observable<MachineryOptionDto[]> {
    return this.http.get<MachineryOptionDto[]>(`${this.adminUrl}/machinery`);
  }

  adminRequest(dto: RequestInspectionDto): Observable<{ inspection: InspectionListItemDto }> {
    return this.http.post<{ inspection: InspectionListItemDto }>(this.adminUrl, dto);
  }

  // Req: outcome confirmation is an Admin/Contractor action only. An admin may confirm the
  // outcome of ANY inspection (see AdminOnly-scoped endpoint below).
  adminGetForOutcome(id: number): Observable<InspectionOutcomeDto> {
    return this.http.get<InspectionOutcomeDto>(`${this.adminUrl}/${id}/outcome`);
  }

  adminConfirmOutcome(id: number, dto: ConfirmOutcomeDto): Observable<{ inspection: InspectionOutcomeDto }> {
    return this.http.post<{ inspection: InspectionOutcomeDto }>(`${this.adminUrl}/${id}/confirm`, dto);
  }

  // Suppliers can only VIEW the inspections scheduled against their own listings and the outcome
  // once confirmed — they never confirm an outcome themselves (the API has no such endpoint).
  supplierGetAll(params: { status?: string; page?: number; pageSize?: number }): Observable<InspectionsPagedResult> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<InspectionsPagedResult>(this.supplierUrl, { params: p });
  }

  supplierGetForOutcome(id: number): Observable<InspectionOutcomeDto> {
    return this.http.get<InspectionOutcomeDto>(`${this.supplierUrl}/${id}/outcome`);
  }

  contractorGetAll(params: { status?: string; page?: number; pageSize?: number }): Observable<InspectionsPagedResult> {
    let p = new HttpParams();
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<InspectionsPagedResult>(this.contractorUrl, { params: p });
  }

  contractorGetAvailableMachinery(): Observable<MachineryOptionDto[]> {
    return this.http.get<MachineryOptionDto[]>(`${this.contractorUrl}/machinery`);
  }

  contractorRequest(dto: RequestInspectionDto): Observable<{ inspection: InspectionListItemDto }> {
    return this.http.post<{ inspection: InspectionListItemDto }>(this.contractorUrl, dto);
  }

  // Req: a contractor may only confirm the outcome of an inspection THEY requested — the API
  // scopes both endpoints below to the authenticated contractor's own requests server-side.
  contractorGetForOutcome(id: number): Observable<InspectionOutcomeDto> {
    return this.http.get<InspectionOutcomeDto>(`${this.contractorUrl}/${id}/outcome`);
  }

  contractorConfirmOutcome(id: number, dto: ConfirmOutcomeDto): Observable<{ inspection: InspectionOutcomeDto }> {
    return this.http.post<{ inspection: InspectionOutcomeDto }>(`${this.contractorUrl}/${id}/confirm`, dto);
  }
}
