import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DisputesPagedResult, DisputeDetailDto, ResolveDisputeDto, RaiseDisputeDto
} from '../models/dispute.models';

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private adminUrl = `${environment.apiUrl}/admin/disputes`;
  private bookingsUrl = `${environment.apiUrl}/bookings-deliveries`;
  private mineUrl = `${environment.apiUrl}/my-disputes`;

  constructor(private http: HttpClient) {}

  adminGetAll(params: { search?: string; status?: string; page?: number; pageSize?: number }): Observable<DisputesPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<DisputesPagedResult>(this.adminUrl, { params: p });
  }

  adminGetById(id: number): Observable<DisputeDetailDto> {
    return this.http.get<DisputeDetailDto>(`${this.adminUrl}/${id}`);
  }

  adminResolve(id: number, dto: ResolveDisputeDto): Observable<{ dispute: DisputeDetailDto; refundId?: number }> {
    return this.http.post<{ dispute: DisputeDetailDto; refundId?: number }>(`${this.adminUrl}/${id}/resolve`, dto);
  }

  raise(bookingId: number, dto: RaiseDisputeDto, evidence?: File[]): Observable<{ message: string; dispute: DisputeDetailDto }> {
    const form = new FormData();
    form.append('DisputeCategory', dto.disputeCategory);
    form.append('Description', dto.description);
    form.append('DesiredResolution', dto.desiredResolution);
    (evidence ?? []).forEach(f => form.append('evidence', f, f.name));
    return this.http.post<{ message: string; dispute: DisputeDetailDto }>(
      `${this.bookingsUrl}/${bookingId}/disputes`, form
    );
  }

  // Contractor/Supplier — "My Disputes". Scoped server-side to the caller's own bookings.
  getMine(params: { page?: number; pageSize?: number }): Observable<DisputesPagedResult> {
    let p = new HttpParams();
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<DisputesPagedResult>(this.mineUrl, { params: p });
  }

  getMineById(id: number): Observable<DisputeDetailDto> {
    return this.http.get<DisputeDetailDto>(`${this.mineUrl}/${id}`);
  }
}
