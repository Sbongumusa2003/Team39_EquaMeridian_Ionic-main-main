export interface BookingListItemDto {
  bookingID: number;
  /** Pending | Active | Completed | Cancelled - decided once by the API (same rules as the tabs and cards). */
  stage?: string;
  /** What this user should do next ('' when there is nothing / just waiting). Decided by the API. */
  nextAction?: string;
  /** True when the next step is up to this user. */
  needsAction?: boolean;
  machinery: string;
  supplierName: string;
  contractorName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  deliveryAddress: string;
  status: string;
  canViewAddress: boolean;
  canConfirmDelivery: boolean;
  canUpdateAddress: boolean;
  canRequestReturn: boolean;
  canConfirmReturn: boolean;
  canMarkReadyForPickup?: boolean;
  canMarkReadyForReturnPickup?: boolean;
  canRaiseDispute: boolean;
  canLeaveReview: boolean;
  canEditReview: boolean;
  canDeleteReview: boolean;
  reviewID?: number;
}

export interface BookingSummaryCardsDto {
  activeBookings: number;
  awaitingYourAction: number;
  completedBookings: number;
  totalLeasedToDate: number;
  allBookings?: number;
  pendingBookings?: number;
  pendingDeliveryBookings?: number;
  returnRequestedBookings?: number;
  cancelledBookings?: number;
}

export interface BookingsPageDto {
  bookings: BookingListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  summaryCards: BookingSummaryCardsDto;
  message?: string;
}

export interface DeliveryDetailDto {
  bookingID: number;
  machinery: string;
  supplierName: string;
  contractorName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  deliveryAddress: string;
  /** Raw stored status - used to decide which buttons to show. */
  bookingStatus: string;
  /** The status to SHOW: identical to the bookings list. Decided by the API. */
  displayStatus?: string;
  stage?: string;
  /** While the lease is being signed: Pending_Supplier (supplier signs first) or Pending_Contractor. */
  leaseStatus?: string | null;
  deliveryStatus: string;
  deliveryMethod: string;
  deliveryDate?: string;
  supplierID?: number;
  contractorID?: number;
  hasDelivery?: boolean;
  fulfillmentMethod?: string;
  canRaiseDispute: boolean;
}

export interface UpdateDeliveryAddressDto {
  deliveryAddress: string;
}

export interface ConfirmDeliveryDto {
  deliveryMethod?: string;
  checklistData?: string;
  outcome?: string;
  notes?: string;
  damageDescription?: string;
  photoUrls?: string;
}

export interface RequestReturnDto {
  returnReason: string;
  preferredPickupDate: string;
  pickupTimeWindow: string;
  pickupLocation: string;
  notes?: string;
}

export interface ConfirmReturnDto {
  condition: string;
  inspectionNotes: string;
  damageDescription?: string;
  estimatedRepairCost?: number;
}

/** One step in the pickup/delivery/return progress tracker. */
export interface TrackingStageDto {
  stage: string;
  label: string;
  timestamp?: string | null;
  notes?: string | null;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface BookingTrackingDto {
  bookingID: number;
  machinery: string;
  currentStatus: string;
  isCancelled: boolean;
  stages: TrackingStageDto[];
}

export interface CancelBookingDto {
  reason: string;
}

export interface CancelBookingResponse {
  message: string;
  cancellationFeeApplies: boolean;
  refundRequestCreated: boolean;
}
