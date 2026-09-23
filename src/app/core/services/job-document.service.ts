import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobDocumentDto, JobDocumentsPageDto } from '../models/job-document.models';

@Injectable({ providedIn: 'root' })
export class JobDocumentService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getForAgreement(leaseAgreementId: number, params: { documentType?: string; search?: string } = {}):
    Observable<{ page: JobDocumentsPageDto; message?: string }> {
    let p = new HttpParams();
    if (params.documentType) p = p.set('documentType', params.documentType);
    if (params.search) p = p.set('search', params.search);
    return this.http.get<{ page: JobDocumentsPageDto; message?: string }>(
      `${this.apiUrl}/lease-agreements/${leaseAgreementId}/documents`, { params: p }
    );
  }

  upload(leaseAgreementId: number, documentType: string, file: File): Observable<{ message: string; document: JobDocumentDto }> {
    const form = new FormData();
    form.append('documentType', documentType);
    form.append('file', file, file.name);
    return this.http.post<{ message: string; document: JobDocumentDto }>(
      `${this.apiUrl}/lease-agreements/${leaseAgreementId}/documents`, form
    );
  }
  
  view(jobDocumentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/job-documents/${jobDocumentId}`, { responseType: 'blob' });
  }

  download(jobDocumentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/job-documents/${jobDocumentId}/download`, { responseType: 'blob' });
  }
}
