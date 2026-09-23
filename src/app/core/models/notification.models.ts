export interface NotificationDto {
  notificationID: number;
  type: string;
  title: string;
  body: string;
  relatedEntityType?: string | null;
  relatedEntityID?: number | null;
  isRead: boolean;
  createdDate: string;
}

export interface NotificationListResponse {
  notifications: NotificationDto[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  targetRole?: string | null;
}

export interface AnnouncementResultDto {
  recipientCount: number;
  title: string;
  sentDate: string;
}
