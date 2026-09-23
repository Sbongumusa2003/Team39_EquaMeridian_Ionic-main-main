import { ListingDto } from './listing.models';

export interface WishlistItemDto {
  wishlistItemID: number;
  addedDate: string;
  listing: ListingDto;
}
