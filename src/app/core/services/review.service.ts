import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewDto, ReviewsPageDto, CreateReviewDto, UpdateReviewDto, AdminReviewsPageDto } from '../models/review.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  create(dto: CreateReviewDto): Observable<{ message: string; review: ReviewDto }> {
    return this.http.post<{ message: string; review: ReviewDto }>(`${this.apiUrl}/reviews`, dto);
  }

  getForListing(listingId: number, params: {
    page?: number; pageSize?: number; sortBy?: string; starFilter?: number;
  } = {}): Observable<ReviewsPageDto> {
    let p = new HttpParams();
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 3).toString());
    p = p.set('sortBy', params.sortBy ?? 'recent');
    if (params.starFilter) p = p.set('starFilter', params.starFilter.toString());
    return this.http.get<ReviewsPageDto>(`${this.apiUrl}/listings/${listingId}/reviews`, { params: p });
  }

  getMine(): Observable<{ reviews: ReviewDto[] }> {
    return this.http.get<{ reviews: ReviewDto[] }>(`${this.apiUrl}/reviews/mine`);
  }

  update(reviewId: number, dto: UpdateReviewDto): Observable<{ message: string; review: ReviewDto }> {
    return this.http.patch<{ message: string; review: ReviewDto }>(`${this.apiUrl}/reviews/${reviewId}`, dto);
  }

  delete(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/reviews/${reviewId}`);
  }

  getAllForAdmin(params: {
    page?: number; pageSize?: number; status?: string; listingId?: number;
    starFilter?: number; search?: string;
  } = {}): Observable<AdminReviewsPageDto> {
    let p = new HttpParams();
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 20).toString());
    if (params.status) p = p.set('status', params.status);
    if (params.listingId) p = p.set('listingId', params.listingId.toString());
    if (params.starFilter) p = p.set('starFilter', params.starFilter.toString());
    if (params.search) p = p.set('search', params.search);
    return this.http.get<AdminReviewsPageDto>(`${this.apiUrl}/admin/reviews`, { params: p });
  }

  adminDelete(reviewId: number, reason: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/reviews/${reviewId}`, { body: { reason } });
  }
}
