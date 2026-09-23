import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryDto {
  categoryID: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${environment.apiUrl}/categories`;
  private cache$?: Observable<CategoryDto[]>;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategoryDto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<CategoryDto[]>(this.url).pipe(shareReplay(1));
    }
    return this.cache$;
  }
}