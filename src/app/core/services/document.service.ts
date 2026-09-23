import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentDto {
  docID: number;
  docTypeID: number;
  docName: string;
  filePath: string;
  verificationStatus: string;
  uploadedDate: string;
  rejectionReason?: string | null;
}

export interface DocumentTypeDto {
  docTypeID: number;
  typeName: string;
  isRequired: boolean;
  appliesToRole?: string | null;
}

export interface DocumentReviewListItemDto {
  docID: number;
  docName: string;
  docTypeID: number;
  docTypeName: string;
  isRequired: boolean;
  uploadedByUserID: number;
  uploadedByName: string;
  verificationStatus: string;
  uploadedDate: string;
  rejectionReason?: string | null;
}

export interface DocumentReviewDetailDto extends DocumentReviewListItemDto {
  filePath: string;
}

export interface RequiredDocumentStatusDto {
  docTypeID: number;
  typeName: string;
  isRequired: boolean;
  status: string;
  docID?: number | null;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private url = `${environment.apiUrl}/users/me/documents`;
  private adminUrl = `${environment.apiUrl}/admin/documents`;

  constructor(private http: HttpClient) {}

  getDocumentTypes(role?: string): Observable<DocumentTypeDto[]> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return this.http.get<DocumentTypeDto[]>(`${this.url}/types${query}`);
  }

  getMyDocuments(): Observable<DocumentDto[]> {
    return this.http.get<DocumentDto[]>(this.url);
  }

  uploadDocument(docTypeId: number, file: File): Observable<any> {
    const form = new FormData();
    form.append('docTypeId', docTypeId.toString());
    form.append('file', file);
    return this.http.post(this.url, form);
  }

  replaceDocument(docId: number, file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.put(`${this.url}/${docId}`, form);
  }

  adminGetAll(params: { status?: string; userId?: number; page?: number; pageSize?: number }): Observable<{
    documents: DocumentReviewListItemDto[]; totalCount: number; page: number; pageSize: number;
  }> {
    let query = `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 10}`;
    if (params.status) query += `&status=${encodeURIComponent(params.status)}`;
    if (params.userId) query += `&userId=${params.userId}`;
    return this.http.get<any>(`${this.adminUrl}${query}`);
  }

  adminGetById(docId: number): Observable<DocumentReviewDetailDto> {
    return this.http.get<DocumentReviewDetailDto>(`${this.adminUrl}/${docId}`);
  }

  adminGetChecklist(userId: number): Observable<{ checklist: RequiredDocumentStatusDto[]; allRequiredApproved: boolean }> {
    return this.http.get<{ checklist: RequiredDocumentStatusDto[]; allRequiredApproved: boolean }>(
      `${this.adminUrl}/checklist/${userId}`);
  }

  adminReview(docId: number, decision: 'Accepted' | 'Rejected', reason?: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/${docId}/review`, { decision, reason });
  }
}