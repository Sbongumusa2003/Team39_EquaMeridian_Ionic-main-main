export interface PayoutDto {
  payoutID: number;
  invoiceID: number;
  invoiceNumber: string;
  bookingID?: number | null;
  listingTitle: string;
  supplierName: string;

  grossAmount: number;
  commissionAmount: number;
  vatAmount: number;
  payoutAmount: number;

  status: string;
  supplierNotes?: string;
  administratorNotes?: string;
  declineReason?: string;
  processedByAdminName?: string;

  requestedDate: string;
  processedDate?: string;
}

export interface PayoutsPagedResult {
  payouts: PayoutDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EligibleInvoiceDto {
  invoiceID: number;
  invoiceNumber: string;
  bookingID?: number | null;
  listingTitle: string;
  invoiceDate: string;
  grossAmount: number;
  commissionAmount: number;
  vatAmount: number;
  payoutAmount: number;
}

export interface SupplierPaymentHistoryItemDto {
  payoutID: number;
  date: string;
  bookingID?: number | null;
  bookingReference: string;
  invoiceNumber: string;
  amount: number;
  status: string;
}

export interface SupplierPaymentHistoryPagedResult {
  payments: SupplierPaymentHistoryItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
