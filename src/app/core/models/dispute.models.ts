export interface DisputeListItemDto {
  disputeID: number;
  contractorName: string;
  supplierName: string;
  listingID?: number;
  listingTitle?: string;
  reasonCategory: string;
  status: string;
  raisedDate: string;
}

export interface DisputeDetailDto extends DisputeListItemDto {
  contractorContact: string;
  supplierContact: string;
  bookingID?: number;
  bookingReference: string;
  bookingAmount: number;
  complaintDescription: string;
  desiredResolution?: string;
  evidenceUrls: string[];
  resolutionType?: string;
  resolutionNotes?: string;
  resolvedDate?: string;
}

export interface ResolveDisputeDto {
  resolutionOutcome: string;
  resolutionNotes: string;
  refundAmount?: number;
}

export interface RaiseDisputeDto {
  disputeCategory: string;
  description: string;
  desiredResolution: string;
}
export const DISPUTE_CATEGORIES: string[] = [
  'Non-delivery/late delivery',
  'Payment or invoicing issue',
  'Damage assessment disagreement',
  'Other'
];

export interface DisputesPagedResult {
  disputes: DisputeListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
