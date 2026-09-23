import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, ToastController } from '@ionic/angular/standalone';
import { DocumentService, DocumentTypeDto } from '../../core/services/document.service';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true, selector: 'app-documents',
  templateUrl: './documents.page.html', styleUrls: ['./documents.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, StatusPillComponent, DatePipe]
})
export class DocumentsPage implements OnInit {
  loading = true; docs: any[] = []; types: DocumentTypeDto[] = []; uploadTypeId: number | null = null; uploading = false; error = '';
  private api = inject(DocumentService); private toast = inject(ToastController);
  ngOnInit() { this.load(); this.api.getDocumentTypes().subscribe({ next: t => this.types = t || [] }); }
  load(ev?: any) {
    this.loading = !ev;
    this.api.getMyDocuments().subscribe({
      next: d => { this.docs = d || []; this.loading = false; ev?.target?.complete(); },
      error: e => { this.error = e?.error?.message || 'Failed'; this.loading = false; ev?.target?.complete(); }
    });
  }
  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file || !this.uploadTypeId) {
      this.toast.create({ message: 'Select a document type first', duration: 2000, color: 'warning' }).then(t => t.present());
      return;
    }
    this.uploading = true;
    this.api.uploadDocument(this.uploadTypeId, file).subscribe({
      next: async () => { this.uploading = false; const t = await this.toast.create({ message: 'Uploaded', duration: 1500, color: 'success' }); t.present(); this.load(); },
      error: async e => { this.uploading = false; const t = await this.toast.create({ message: e?.error?.message || 'Upload failed', duration: 2000, color: 'danger' }); t.present(); }
    });
  }
}
