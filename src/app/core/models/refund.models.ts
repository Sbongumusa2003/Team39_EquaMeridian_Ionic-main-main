export interface RefundDto {
  refundID: number;
  disputeID?: number;
  invoiceID?: number;
  partyName: string;
  amount: number;
  status: string;
  reason?: string;
  administratorNotes?: string;
  paymentGatewayReference?: string;
  failureReason?: string;
  createdDate: string;
  dateUpdated?: string;
  processedDate?: string;
}

export interface RefundsPagedResult {
  refunds: RefundDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
