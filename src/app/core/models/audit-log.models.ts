export interface AuditLogListItemDto {
  auditID: number;
  eventType: string;
  description?: string;
  userID?: number;
  userName?: string;
  userEmail?: string;
  eventDate: string;
  eventTime: string;
  status: string;
}

export interface AuditLogDetailDto extends AuditLogListItemDto {
  previousValues?: string;
  newValues?: string;
  ipAddress?: string;
  listingID?: number;
  adminID?: number;
}

export interface AuditLogUserOptionDto {
  userID: number;
  fullName: string;
}

export interface AuditLogsPagedResult {
  logs: AuditLogListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
