import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LeaseAgreementDetailDto, LeaseAgreementsPagedResult, SignLeaseAgreementDto
} from '../models/lease-agreement.models';

@Injectable({ providedIn: 'root' })
export class LeaseAgreementService {
  private baseUrl = `${environment.apiUrl}/lease-agreements`;

  constructor(private http: HttpClient) {}

  getAll(params: { page?: number; pageSize?: number }): Observable<LeaseAgreementsPagedResult> {
    let p = new HttpParams();
    p = p.set('page',     (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<LeaseAgreementsPagedResult>(this.baseUrl, { params: p });
  }

  getById(id: number): Observable<LeaseAgreementDetailDto> {
    return this.http.get<LeaseAgreementDetailDto>(`${this.baseUrl}/${id}`);
  }

  sign(id: number, dto: SignLeaseAgreementDto): Observable<{ message: string; agreement: LeaseAgreementDetailDto }> {
    return this.http.post<{ message: string; agreement: LeaseAgreementDetailDto }>(
      `${this.baseUrl}/${id}/sign`, dto
    );
  }
}
