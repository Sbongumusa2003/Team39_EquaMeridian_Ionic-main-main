import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FeeConfigurationDto,
  UpdateFeeConfigurationDto,
  DiscountTierDto,
  UpsertDiscountTierDto
} from '../models/fee.models';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private apiUrl = `${environment.apiUrl}/admin/platform-fees`;
  private tiersUrl = `${environment.apiUrl}/admin/discount-tiers`;

  constructor(private http: HttpClient) {}

  get(): Observable<FeeConfigurationDto> {
    return this.http.get<FeeConfigurationDto>(this.apiUrl);
  }

  update(dto: UpdateFeeConfigurationDto): Observable<FeeConfigurationDto> {
    return this.http.put<FeeConfigurationDto>(this.apiUrl, dto);
  }

  getDiscountTiers(): Observable<DiscountTierDto[]> {
    return this.http.get<DiscountTierDto[]>(this.tiersUrl);
  }

  createDiscountTier(dto: UpsertDiscountTierDto): Observable<DiscountTierDto> {
    return this.http.post<DiscountTierDto>(this.tiersUrl, dto);
  }

  updateDiscountTier(id: number, dto: UpsertDiscountTierDto): Observable<DiscountTierDto> {
    return this.http.put<DiscountTierDto>(`${this.tiersUrl}/${id}`, dto);
  }

  deleteDiscountTier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tiersUrl}/${id}`);
  }
}
