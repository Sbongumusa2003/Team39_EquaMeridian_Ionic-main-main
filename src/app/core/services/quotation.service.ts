import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  QuotationListItemDto,
  QuotationReviewDto,
  QuotationDetailDto,
  QuotationCompareDto,
  QuotationPagedResult,
  CreateQuotationRequestDto,
  SubmitQuotationDto,
  RejectQuotationDto
} from '../models/quotation.models';
import { SUPPRESS_403_REDIRECT } from '../http-context-tokens';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private contractorUrl = `${environment.apiUrl}/contractor/quotations`;
  private supplierUrl    = `${environment.apiUrl}/supplier/quotations`;

  constructor(private http: HttpClient) {}

  contractorCreate(dto: CreateQuotationRequestDto): Observable<{ quotation: QuotationListItemDto }> {
    return this.http.post<{ quotation: QuotationListItemDto }>(this.contractorUrl, dto, {
      context: new HttpContext().set(SUPPRESS_403_REDIRECT, true)
    });
  }

  contractorGetAll(params: {
    listingId?: number; status?: string; search?: string;
    from?: string; to?: string; page?: number; pageSize?: number;
  }): Observable<QuotationPagedResult<QuotationListItemDto>> {
    let p = new HttpParams();
    if (params.listingId) p = p.set('listingId', params.listingId.toString());
    if (params.status)    p = p.set('status', params.status);
    if (params.search)    p = p.set('search', params.search);
    if (params.from)      p = p.set('from', params.from);
    if (params.to)        p = p.set('to', params.to);
    p = p.set('page',     (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<QuotationPagedResult<QuotationListItemDto>>(this.contractorUrl, { params: p });
  }

  contractorGetById(id: number): Observable<QuotationDetailDto> {
    return this.http.get<QuotationDetailDto>(`${this.contractorUrl}/${id}`);
  }

  contractorCompare(ids: number[]): Observable<{ quotations: QuotationCompareDto[]; warning: string | null }> {
    const p = new HttpParams().set('ids', ids.join(','));
    return this.http.get<{ quotations: QuotationCompareDto[]; warning: string | null }>(
      `${this.contractorUrl}/compare`, { params: p }
    );
  }

  contractorAccept(id: number): Observable<{
    quotation: QuotationListItemDto; bookingId: number;
    invoiceId?: number; leaseAgreementId: number;
  }> {
    return this.http.post<any>(`${this.contractorUrl}/${id}/accept`, {});
  }

  contractorReject(id: number, dto: RejectQuotationDto): Observable<{ quotation: QuotationListItemDto }> {
    return this.http.post<{ quotation: QuotationListItemDto }>(`${this.contractorUrl}/${id}/reject`, dto);
  }

  supplierGetAll(params: {
    listingId?: number; status?: string; page?: number; pageSize?: number;
  }): Observable<QuotationPagedResult<QuotationListItemDto>> {
    let p = new HttpParams();
    if (params.listingId) p = p.set('listingId', params.listingId.toString());
    if (params.status)    p = p.set('status', params.status);
    p = p.set('page',     (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 10).toString());
    return this.http.get<QuotationPagedResult<QuotationListItemDto>>(this.supplierUrl, { params: p });
  }

  supplierGetForReview(id: number): Observable<QuotationReviewDto> {
    return this.http.get<QuotationReviewDto>(`${this.supplierUrl}/${id}/review`);
  }

  supplierSubmit(id: number, dto: SubmitQuotationDto): Observable<{ quotation: QuotationReviewDto }> {
    return this.http.post<{ quotation: QuotationReviewDto }>(`${this.supplierUrl}/${id}/submit`, dto);
  }
}
