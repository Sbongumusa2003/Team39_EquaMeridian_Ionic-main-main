export interface AddCartItemDto {
  listingID: number;
  startDate: string;
  endDate: string;
  quantity: number;
  /** "Supplier Delivery" or "Contractor Pickup" */
  fulfillmentMethod: string;
  /** Required when fulfillmentMethod is Supplier Delivery; ignored on pickup — the server fills in
   *  the listing's own pickup address instead. */
  deliveryAddress?: string;
}

export interface UpdateCartItemDto {
  startDate: string;
  endDate: string;
  quantity: number;
  fulfillmentMethod: string;
  deliveryAddress?: string;
}

export interface CartItemDto {
  cartItemID: number;
  listingID: number;
  listingTitle: string;
  imageUrl?: string;
  unitsAvailable: number;
  quantity: number;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDurationDays: number;
  fulfillmentMethod: string;
  deliveryAddress: string;
  dailyRateZAR: number;
  rentalSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  deliveryFee: number;
  deliveryDistanceKm: number;
  priceExclVat: number;
  vatRate: number;
  priceInclVat: number;
  isAvailable: boolean;
}

export interface CartSupplierGroupDto {
  supplierID: number;
  supplierCompany: string;
  items: CartItemDto[];
  groupRentalSubtotal: number;
  groupDiscountAmount: number;
  groupDeliveryFee: number;
  groupPriceExclVat: number;
  groupVatAmount: number;
  groupTotal: number;
}

export interface CartDto {
  supplierGroups: CartSupplierGroupDto[];
  grandTotal: number;
  itemCount: number;
  hasUnavailableItems: boolean;
  appliedPromoCode?: string;
  promoValid?: boolean;
  promoMessage?: string;
  promoCampaignName?: string;
  promoDiscountPercent?: number;
}

export interface CheckoutRequestDto {
  promoCode?: string;
}

export interface CheckoutResultBookingDto {
  bookingID: number;
  listingID: number;
  listingTitle: string;
  invoiceID: number;
  invoiceNumber: string;
  leaseAgreementID: number;
  totalAmount: number;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  bookings: CheckoutResultBookingDto[];
}
