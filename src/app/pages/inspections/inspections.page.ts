import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonIcon,
  IonButton, IonSelect, IonSelectOption, IonInput, IonTextarea, IonModal, ToastController,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline, closeOutline } from 'ionicons/icons';
import { InspectionService } from '../../core/services/inspection.service';
import { InspectionListItemDto, InspectionOutcomeDto, MachineryOptionDto } from '../../core/models/inspection.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-inspections', standalone: true,
  templateUrl: './inspections.page.html', styleUrls: ['./inspections.page.scss'],
  imports: [DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, IonIcon, IonButton, IonSelect, IonSelectOption, IonInput, IonTextarea, IonModal,
    StatusPillComponent, EmptyStateComponent]
})
export class InspectionsPage implements ViewWillEnter {
  private api = inject(InspectionService);
  private toast = inject(ToastController);

  loading = true; error = '';
  items: InspectionListItemDto[] = [];
  machinery: MachineryOptionDto[] = [];
  minDate = new Date().toISOString().substring(0, 10);

  requestOpen = false; requesting = false;
  reqListing: number | null = null; reqDate = ''; reqError = '';

  selected: InspectionOutcomeDto | null = null; outcomeOpen = false;
  outcome = ''; notes = ''; confirming = false; outcomeError = '';

  constructor() { addIcons({ addOutline, calendarOutline, closeOutline }); }
  ionViewWillEnter() { this.load(); }
  isFail(o?: string) { return /fail/i.test(o || ''); }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2400, color, position: 'top' });
    await t.present();
  }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.contractorGetAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.inspections || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load inspections.'; this.loading = false; ev?.target.complete(); }
    });
  }

  openRequest() {
    this.reqListing = null; this.reqDate = ''; this.reqError = ''; this.requestOpen = true;
    this.api.contractorGetAvailableMachinery().subscribe({ next: m => this.machinery = m || [], error: () => this.machinery = [] });
  }

  submitRequest() {
    if (!this.reqListing || !this.reqDate) { this.reqError = 'Choose a machine and a date.'; return; }
    this.requesting = true; this.reqError = '';
    this.api.contractorRequest({ listingID: this.reqListing, scheduledDate: this.reqDate }).subscribe({
      next: () => { this.requesting = false; this.requestOpen = false; void this.say('Inspection requested', 'success'); this.load(); },
      error: e => { this.requesting = false; this.reqError = e?.error?.message || 'Could not request the inspection.'; }
    });
  }

  open(i: InspectionListItemDto) {
    this.outcome = ''; this.notes = ''; this.outcomeError = '';
    this.api.contractorGetForOutcome(i.inspectionID).subscribe({
      next: full => { this.selected = full; this.outcomeOpen = true; },
      error: e => void this.say(e?.error?.message || 'Could not open this inspection.', 'danger')
    });
  }

  get canConfirm() { return !!this.selected && !/complete/i.test(this.selected.status); }

  confirm() {
    if (!this.selected) return;
    if (!this.outcome) { this.outcomeError = 'Select Pass or Fail.'; return; }
    this.confirming = true; this.outcomeError = '';
    this.api.contractorConfirmOutcome(this.selected.inspectionID, { outcome: this.outcome, notes: this.notes.trim() || undefined }).subscribe({
      next: () => { this.confirming = false; this.outcomeOpen = false; void this.say('Outcome recorded', 'success'); this.load(); },
      error: e => { this.confirming = false; this.outcomeError = e?.error?.message || 'Could not save the outcome.'; }
    });
  }
}
