export interface CampaignDto {
  campaignID: number;
  name: string;
  type: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  status: string;
  bannerImageURL?: string;
  discountValue?: number;
  discountCode?: string;
  featuredListingID?: number;
  featuredListingTitle?: string;
  createdDate: string;
}

export interface CreateCampaignDto {
  name: string;
  type: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  saveAsDraft: boolean;
  bannerImageURL?: string;
  discountValue?: number;
  discountCode?: string;
  featuredListingID?: number;
}

export interface UpdateCampaignDto {
  name: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  status: string;
  bannerImageURL?: string;
  discountValue?: number;
  discountCode?: string;
  featuredListingID?: number;
}

export const CampaignTypes = ['Banner', 'Discount Code', 'Featured Listing'];
export const CampaignStatuses = ['Draft', 'Scheduled', 'Active', 'Paused', 'Ended'];
export const CampaignAudiences = ['All', 'Contractor', 'Supplier'];

export interface CampaignsPagedResult {
  campaigns: CampaignDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
