export interface UserDto {
  userID: number;
  fullName: string;
  email: string;
  role: string;
  accountStatus: string;
  companyName?: string;
  createdDate: string;
  lastLoginDate?: string;
}

export interface UpdateAccountStatusDto {
  newStatus: string;
  confirmOverride?: boolean;
}

export interface PagedResult<T> {
  users?: T[];
  listings?: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}