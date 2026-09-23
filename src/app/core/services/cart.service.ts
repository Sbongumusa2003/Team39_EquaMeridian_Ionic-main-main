import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddCartItemDto, UpdateCartItemDto, CartDto, CheckoutResult
} from '../models/cart.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/contractor/cart`;

  // Powers the Cart badge in the sidebar — kept in sync whenever the cart is fetched or mutated,
  // so every page that touches the cart (Browse, Listing Detail, Book Now, Cart itself) updates
  // the badge without each of them needing to know about each other.
  private itemCountSubject = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(promoCode?: string): Observable<CartDto> {
    const options = promoCode ? { params: { promoCode } } : {};
    return this.http.get<CartDto>(this.apiUrl, options).pipe(
      tap(cart => this.itemCountSubject.next(cart.itemCount))
    );
  }

  addItem(dto: AddCartItemDto): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.apiUrl}/items`, dto).pipe(
      tap(cart => this.itemCountSubject.next(cart.itemCount))
    );
  }

  updateItem(cartItemId: number, dto: UpdateCartItemDto): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.apiUrl}/items/${cartItemId}`, dto).pipe(
      tap(cart => this.itemCountSubject.next(cart.itemCount))
    );
  }

  removeItem(cartItemId: number): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(cart => this.itemCountSubject.next(cart.itemCount))
    );
  }

  checkout(promoCode?: string): Observable<CheckoutResult> {
    const body = promoCode ? { promoCode } : {};
    return this.http.post<CheckoutResult>(`${this.apiUrl}/checkout`, body).pipe(
      tap(() => this.itemCountSubject.next(0))
    );
  }

  /** Forget the badge when the user signs out. */
  reset(): void { this.itemCountSubject.next(0); }

  /** Refreshes the badge count without needing the full cart contents (e.g. after login). */
  refreshCount(): void {
    this.getCart().subscribe({ error: () => {} });
  }
}
