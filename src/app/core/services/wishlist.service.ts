import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WishlistItemDto } from '../models/wishlist.models';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private url = `${environment.apiUrl}/contractor/wishlist`;

  // Cached set of wishlisted listing IDs, shared across every component that renders a heart
  // icon (browse grid, listing detail, compare) so we don't re-fetch per row. Callers read the
  // current value synchronously via `isWishlisted()` and refresh it once per page load.
  private idsSubject = new BehaviorSubject<Set<number>>(new Set());
  readonly ids$: Observable<Set<number>> = this.idsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Re-pulls the lightweight ID list from the server. Call once on pages that show hearts,
   *  only when the visitor is logged in as a contractor — guests have nothing to fetch. */
  refreshIds(): void {
    this.http.get<number[]>(`${this.url}/ids`).subscribe({
      next: ids => this.idsSubject.next(new Set(ids)),
      // Not fatal — hearts just render unfilled until the next successful refresh.
      error: () => {}
    });
  }

  /** Clears the cached state, e.g. on logout, so a different contractor's hearts don't leak in. */
  clear(): void {
    this.idsSubject.next(new Set());
  }

  isWishlisted(listingId: number): boolean {
    return this.idsSubject.value.has(listingId);
  }

  getAll(): Observable<WishlistItemDto[]> {
    return this.http.get<WishlistItemDto[]>(this.url);
  }

  add(listingId: number): Observable<WishlistItemDto> {
    return this.http.post<WishlistItemDto>(this.url, { listingID: listingId }).pipe(
      tap(() => {
        const next = new Set(this.idsSubject.value);
        next.add(listingId);
        this.idsSubject.next(next);
      })
    );
  }

  removeByListing(listingId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/by-listing/${listingId}`).pipe(
      tap(() => {
        const next = new Set(this.idsSubject.value);
        next.delete(listingId);
        this.idsSubject.next(next);
      })
    );
  }

  /** Adds if not already wishlisted, removes if it is — the single call heart-icon click handlers need. */
  toggle(listingId: number): Observable<unknown> {
    return this.isWishlisted(listingId) ? this.removeByListing(listingId) : this.add(listingId);
  }
}
