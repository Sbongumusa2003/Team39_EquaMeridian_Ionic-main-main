import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookingsPageDto, DeliveryDetailDto, UpdateDeliveryAddressDto,
  ConfirmDeliveryDto, RequestReturnDto, ConfirmReturnDto, BookingTrackingDto,
  CancelBookingDto, CancelBookingResponse
} from '../models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/bookings-deliveries`;

  constructor(private http: HttpClient) {}

  getAll(params: {
    page?: number; pageSize?: number; search?: string; status?: string;
    dateFrom?: string; dateTo?: string;
  }): Observable<BookingsPageDto> {
    let p = new HttpParams();
    if (params.search)   p = p.set('search', params.search);
    if (params.status)   p = p.set('status', params.status);
    if (params.dateFrom) p = p.set('dateFrom', params.dateFrom);
    if (params.dateTo)   p = p.set('dateTo', params.dateTo);
    p = p.set('page',     (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<BookingsPageDto>(this.baseUrl, { params: p });
  }

  getDeliveryDetail(bookingId: number): Observable<DeliveryDetailDto> {
    return this.http.get<DeliveryDetailDto>(`${this.baseUrl}/${bookingId}`);
  }

  getTracking(bookingId: number): Observable<BookingTrackingDto> {
    return this.http.get<BookingTrackingDto>(`${this.baseUrl}/${bookingId}/tracking`);
  }

  updateDeliveryAddress(bookingId: number, dto: UpdateDeliveryAddressDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${bookingId}/delivery-address`, dto);
  }

  confirmDelivery(bookingId: number, dto: ConfirmDeliveryDto): Observable<{ delivery: DeliveryDetailDto }> {
    return this.http.post<{ delivery: DeliveryDetailDto }>(`${this.baseUrl}/${bookingId}/confirm-delivery`, dto);
  }

  requestReturn(bookingId: number, dto: RequestReturnDto): Observable<{
    message: string; returnRequestId: number; earlyReturnFeeApplies: boolean;
  }> {
    return this.http.post<any>(`${this.baseUrl}/${bookingId}/request-return`, dto);
  }

  confirmReturn(bookingId: number, dto: ConfirmReturnDto, photos?: File[]): Observable<{
    message: string; depositDeductionId?: number;
  }> {
    const form = new FormData();
    form.append('Condition', dto.condition);
    form.append('InspectionNotes', dto.inspectionNotes);
    if (dto.damageDescription) form.append('DamageDescription', dto.damageDescription);
    if (dto.estimatedRepairCost != null) form.append('EstimatedRepairCost', dto.estimatedRepairCost.toString());
    (photos ?? []).forEach(f => form.append('photos', f, f.name));
    return this.http.post<any>(`${this.baseUrl}/${bookingId}/confirm-return`, form);
  }

  downloadCalendar(bookingId: number): Observable<Blob> {
    const calendarBase = this.baseUrl.replace(/\/bookings-deliveries$/, '/bookings');
    return this.http.get(`${calendarBase}/${bookingId}/calendar.ics`, { responseType: 'blob' });
  }

  cancel(bookingId: number, dto: CancelBookingDto): Observable<CancelBookingResponse> {
    return this.http.post<CancelBookingResponse>(`${this.baseUrl}/${bookingId}/cancel`, dto);
  }

  /** Supplier: machine is prepped and ready for the contractor to collect / be delivered. */
  markReadyForPickup(bookingId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${bookingId}/ready-for-pickup`, {});
  }

  /** Supplier: collection of a requested return has been arranged. */
  markReadyForReturnPickup(bookingId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${bookingId}/ready-for-return-pickup`, {});
  }
}
