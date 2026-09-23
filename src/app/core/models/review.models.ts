export interface ReviewDto {
  reviewID: number;
  bookingID: number;
  machineryID: number;
  listingTitle: string;
  contractorID: number;
  reviewerDisplayName: string;
  overallRating: number;
  aspectRatings: { [key: string]: number };
  title: string;
  reviewText: string;
  isEdited: boolean;
  createdAt: string;
  editedAt?: string;
  canEdit: boolean;
  canDelete: boolean;
  editWindowDaysRemaining: number;
  status?: string;
  supplierDisplayName?: string;
}

export interface AdminReviewsPageDto {
  reviews: ReviewDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RatingSummaryDto {
  averageRating: number;
  reviewCount: number;
  starDistribution: { [key: number]: number };
  aspectAverages: { [key: string]: number };
}

export interface ReviewsPageDto {
  summary: RatingSummaryDto;
  reviews: ReviewDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  message?: string;
}

export const ReviewAspects = {
  MachineryCondition: 'MachineryCondition',
  Reliability: 'Reliability',
  Communication: 'Communication',
  ValueForMoney: 'ValueForMoney'
};

export const ReviewAspectLabels: { [key: string]: string } = {
  MachineryCondition: 'Machinery Condition',
  Reliability: 'Reliability',
  Communication: 'Communication',
  ValueForMoney: 'Value for Money'
};

export interface CreateReviewDto {
  bookingID: number;
  overallRating: number;
  aspectRatings?: { [key: string]: number };
  title: string;
  reviewText: string;
  confirmedGenuine: boolean;
}

export interface UpdateReviewDto {
  overallRating: number;
  aspectRatings?: { [key: string]: number };
  title: string;
  reviewText: string;
}
