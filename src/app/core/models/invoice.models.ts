export interface InvoiceDto {
  invoiceID: number;
  quotationID: number;
  listingID: number;
  listingTitle: string;
  contractorName: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  /** Units hired. */
  quantity?: number;
  rentalStartDate?: string | null;
  rentalEndDate?: string | null;
  /** Calendar days of the hire (minimum 1). */
  rentalDays?: number | null;
  dailyRateZAR?: number | null;
  /** Rental subtotal BEFORE discount and delivery: rate × days × units. */
  subtotal: number;
  discountAmount?: number;
  deliveryFee?: number;
  vatRate: number;
  vatAmount: number;
  /** Total INCLUDING VAT. Excl. VAT = subtotal − discount + delivery. */
  totalAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  supplierPayableAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  hasEftProof?: boolean;
  eftProofFileName?: string | null;
}

export interface InvoiceListItemDto {
  invoiceID: number;
  invoiceNumber: string;
  listingTitle: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paymentStatus: string;
  /** Booking the invoice belongs to (null on legacy invoices). */
  bookingID?: number | null;
  /** Unpaid | AwaitingConfirmation | Paid | Closed - decided once by the API (InvoiceStages). */
  stage?: string;
}

export interface InvoicesPagedResult {
  invoices: InvoiceListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
