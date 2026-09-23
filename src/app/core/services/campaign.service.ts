import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CampaignsPagedResult, CampaignDto, CreateCampaignDto, UpdateCampaignDto } from '../models/campaign.models';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/admin/campaigns`;

  constructor(private http: HttpClient) {}

  getAll(params: { search?: string; type?: string; status?: string; page?: number; pageSize?: number }): Observable<CampaignsPagedResult> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.type) p = p.set('type', params.type);
    if (params.status) p = p.set('status', params.status);
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<CampaignsPagedResult>(this.apiUrl, { params: p });
  }

  getById(id: number): Observable<CampaignDto> {
    return this.http.get<CampaignDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCampaignDto): Observable<CampaignDto> {
    return this.http.post<CampaignDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateCampaignDto): Observable<CampaignDto> {
    return this.http.put<CampaignDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadBanner(file: File): Observable<{ url: string; fileName: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string; fileName: string }>(`${this.apiUrl}/upload-banner`, form);
  }

  /** Currently live campaigns (discounts/promotions) — used to surface offers to contractors. */
  getActive(): Observable<{ campaigns: CampaignDto[] }> {
    return this.http.get<{ campaigns: CampaignDto[] }>(`${environment.apiUrl}/campaigns/active`);
  }
}
