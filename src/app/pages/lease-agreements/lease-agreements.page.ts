import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonIcon,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, calendarOutline } from 'ionicons/icons';
import { LeaseAgreementService } from '../../core/services/lease-agreement.service';
import { LeaseAgreementListItemDto } from '../../core/models/lease-agreement.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  standalone: true, selector: 'app-lease-agreements',
  templateUrl: './lease-agreements.page.html', styleUrls: ['./lease-agreements.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, IonIcon, StatusPillComponent, EmptyStateComponent]
})
export class LeaseAgreementsPage implements ViewWillEnter {
  private api = inject(LeaseAgreementService);
  loading = true; error = '';
  items: LeaseAgreementListItemDto[] = [];
  constructor() { addIcons({ createOutline, calendarOutline }); }
  ionViewWillEnter() { this.load(); }
  get toSign() { return this.items.filter(i => i.canSign).length; }
  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.agreements || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load lease agreements.'; this.loading = false; ev?.target.complete(); }
    });
  }
}
