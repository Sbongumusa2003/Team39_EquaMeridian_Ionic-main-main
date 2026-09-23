export interface QuotationListItemDto {
  quotationID: number;
  listingID: number;
  listingTitle: string;
  contractorName: string;
  status: string;
  requestedDate: string;
  quoteValidUntil?: string;
  supplierName?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  quantity?: number;
  estimatedTotal?: number;
}

export interface QuotationReviewDto extends QuotationListItemDto {
  hireType: 'Dry' | 'Wet';
  fulfillmentMethod: 'Supplier Delivery' | 'Contractor Pickup';
  deliveryAddress: string;
  specialRequirements?: string;
  dailyRateZAR?: number;
  weeklyRateZAR?: number;
  deliveryFee?: number;
  notesToCustomer?: string;
}

export interface QuotationStatusEventDto {
  status: string;
  date: string;
}

export interface QuotationDetailDto extends QuotationReviewDto {
  preferredContact: string;
  statusHistory: QuotationStatusEventDto[];
  canAccept: boolean;
  canReject: boolean;
}

export interface QuotationCompareDto {
  quotationID: number;
  listingID: number;
  listingTitle: string;
  category: string;
  supplierCompany: string;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDurationDays: number;
  quantity: number;
  dailyRateZAR?: number;
  estimatedTotal: number;
  makeBrand?: string;
  model?: string;
  year?: number;
  operatingWeight?: string;
  enginePower?: string;
  location?: string;
  status: string;
  specialRequirements?: string;
  canAccept: boolean;
}

export interface CreateQuotationRequestDto {
  listingID: number;
  startDate: string;
  endDate: string;
  quantity: number;
  hireType: 'Dry' | 'Wet';
  fulfillmentMethod: 'Supplier Delivery' | 'Contractor Pickup';
  deliveryAddress?: string;
  specialRequirements?: string;
  preferredContact: 'Email' | 'Phone' | 'Both';
}

export interface SubmitQuotationDto {
  dailyRateZAR: number;
  weeklyRateZAR?: number;
  deliveryFee: number;
  quoteValidUntil: string;
  notesToCustomer?: string;
}

export interface RejectQuotationDto {
  reason?: string;
}

export interface QuotationPagedResult<T> {
  quotations: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
