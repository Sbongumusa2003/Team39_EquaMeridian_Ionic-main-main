export interface InitiatePaymentResponseDto {
  processUrl?: string | null;
  fields?: Record<string, string>;
  /** "PayFast" | "EFT" when amount exceeds gateway max */
  method?: string;
  message?: string;
  amount?: number;
  reference?: string;
  gatewayMaxAmount?: number;
  bank?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchCode?: string;
    accountType?: string;
  };
  bankConfigured?: boolean;
}

export interface PaymentStatusDto {
  paymentID: number;
  bookingID: number;
  amountDue: number;
  amountPaid: number;
  status: string;
  gatewayReference?: string | null;
  lastSyncedDate?: string | null;
  liveStatusUnavailable: boolean;
}

export interface PaymentHistoryItemDto {
  paymentID: number;
  date: string;
  bookingID: number;
  bookingReference: string;
  amount: number;
  status: string;
}

export interface PaymentHistoryPagedResult {
  payments: PaymentHistoryItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ReceiptDataDto {
  paymentID: number;
  amount: number;
  vatAmount: number;
  transactionDate: string;
  bookingID: number;
  supplierName: string;
  contractorName: string;
  invoiceNumber: string;
  paymentStatus: string;
}
