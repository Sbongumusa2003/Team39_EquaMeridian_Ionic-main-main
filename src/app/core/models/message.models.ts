export interface MessageDto {
  messageID: number;
  threadID: number;
  senderID: number;
  senderName: string;
  recipientID: number;
  recipientName: string;
  body: string;
  attachmentURL?: string | null;
  attachmentFileName?: string | null;
  isRead: boolean;
  dateSent: string;
}

export interface ThreadListItemDto {
  threadID: number;
  otherParticipantID: number;
  otherParticipantName: string;
  messagePreview: string;
  lastActivityDate: string;
  unreadCount: number;
}

export interface ThreadDetailDto {
  threadID: number;
  otherParticipantID: number;
  otherParticipantName: string;
  messages: MessageDto[];
}

export interface ThreadsPagedResult {
  threads: ThreadListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface RecipientSearchResult {
  userID: number;
  fullName: string;
  role: string;
  companyName?: string | null;
}
