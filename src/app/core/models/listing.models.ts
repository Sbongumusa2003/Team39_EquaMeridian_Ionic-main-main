export interface ListingDto {
  listingID: number;
  listingTitle: string;
  categoryID: number;
  availabilityStatus: string;
  description: string;
  makeBrand?: string;
  model?: string;
  year?: number;
  operatingWeight?: string;
  enginePower?: string;
  location?: string;
  dailyRateZAR: number;
  weeklyRateZAR?: number;
  createdDate: string;
  duplicateFlag: boolean;
  supplierID: number;
  supplierName: string;
  imageUrls: string[];
  images?: ListingImageDto[];

  /** "Fixed" = published rate, bookable straight away via Cart. "QuoteRequired" = Request a Quote only. */
  pricingMode: string;
  dryHireAvailable: boolean;
  wetHireAvailable: boolean;
  wetDailyRateZAR?: number;
  wetWeeklyRateZAR?: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFeeZAR?: number;
  unitsOwned: number;
  unitsAvailable: number;
}

export interface ListingImageDto {
  imageID: number;
  url: string;
}

export interface CreateListingDto {
  listingTitle: string;
  categoryID: number;
  description: string;
  makeBrand?: string;
  model?: string;
  year?: number;
  operatingWeight?: string;
  enginePower?: string;
  location?: string;
  dailyRateZAR: number;
  weeklyRateZAR?: number | null;
  dryHireAvailable: boolean;
  wetHireAvailable: boolean;
  wetDailyRateZAR?: number | null;
  wetWeeklyRateZAR?: number | null;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFeeZAR?: number | null;
  pricingMode: 'Fixed' | 'QuoteRequired';
  unitsOwned: number;
  agreeToMasterLeaseAgreement: boolean;
}

export interface UpdateListingDto {
  listingTitle: string;
  categoryID: number;
  description: string;
  makeBrand?: string;
  model?: string;
  year?: number;
  operatingWeight?: string;
  enginePower?: string;
  location?: string;
  dailyRateZAR: number;
  weeklyRateZAR?: number | null;
  dryHireAvailable: boolean;
  wetHireAvailable: boolean;
  wetDailyRateZAR?: number | null;
  wetWeeklyRateZAR?: number | null;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFeeZAR?: number | null;
  pricingMode: 'Fixed' | 'QuoteRequired';
  unitsOwned: number;
}

export interface UpdateListingStatusDto {
  newStatus: string;
  suspensionReason?: string;
}

export interface PagedResult<T> {
  users?: T[];
  listings?: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}