import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceAreaDto {
  serviceAreaID: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceAreaService {
  private url = `${environment.apiUrl}/service-areas`;
  private cache$?: Observable<ServiceAreaDto[]>;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServiceAreaDto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<ServiceAreaDto[]>(this.url).pipe(shareReplay(1));
    }
    return this.cache$;
  }
}
