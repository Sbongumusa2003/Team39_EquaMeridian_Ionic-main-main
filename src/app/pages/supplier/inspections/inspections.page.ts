import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonIcon,
  IonModal, ToastController, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, clipboardOutline } from 'ionicons/icons';
import { InspectionService } from '../../../core/services/inspection.service';
import { InspectionListItemDto, InspectionOutcomeDto } from '../../../core/models/inspection.models';
import { StatusPillComponent } from '../../../shared/status-pill.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';

@Component({
  selector: 'app-supplier-inspections', standalone: true,
  templateUrl: './inspections.page.html', styleUrls: ['./inspections.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, IonIcon, IonModal, StatusPillComponent, EmptyStateComponent]
})
export class SupplierInspectionsPage implements ViewWillEnter {
  private api = inject(InspectionService);
  private toast = inject(ToastController);
  loading = true; error = '';
  items: InspectionListItemDto[] = [];
  selected: InspectionOutcomeDto | null = null; open = false;

  constructor() { addIcons({ calendarOutline, clipboardOutline }); }
  ionViewWillEnter() { this.load(); }
  isFail(o?: string) { return /fail/i.test(o || ''); }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.supplierGetAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.inspections || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load inspections.'; this.loading = false; ev?.target.complete(); }
    });
  }

  show(i: InspectionListItemDto) {
    this.api.supplierGetForOutcome(i.inspectionID).subscribe({
      next: full => { this.selected = full; this.open = true; },
      error: async e => { const t = await this.toast.create({ message: e?.error?.message || 'Could not open this inspection.', duration: 2400, color: 'danger', position: 'top' }); await t.present(); }
    });
  }
}
