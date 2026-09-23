import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimerConfigurationDto, UpdateTimerConfigurationRequest } from '../models/timer-config.models';

@Injectable({ providedIn: 'root' })
export class TimerConfigService {
  private apiUrl = `${environment.apiUrl}/admin/timer-configuration`;

  constructor(private http: HttpClient) {}

  get(): Observable<TimerConfigurationDto> {
    return this.http.get<TimerConfigurationDto>(this.apiUrl);
  }

  update(dto: UpdateTimerConfigurationRequest): Observable<TimerConfigurationDto> {
    return this.http.put<TimerConfigurationDto>(this.apiUrl, dto);
  }

  runNow(): Observable<{ expiredCount: number }> {
    return this.http.post<{ expiredCount: number }>(`${this.apiUrl}/run-now`, {});
  }
}
