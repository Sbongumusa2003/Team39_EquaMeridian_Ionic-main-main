import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonRefresher, IonRefresherContent, IonIcon, IonButton,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircle, ellipseOutline, swapHorizontalOutline } from 'ionicons/icons';
import { QuotationService } from '../../core/services/quotation.service';
import { AuthService } from '../../core/services/auth.service';
import { QuotationListItemDto } from '../../core/models/quotation.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

type F = 'all' | 'open' | 'closed';

@Component({
  selector: 'app-quotations', standalone: true,
  templateUrl: './quotations.page.html', styleUrls: ['./quotations.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonRefresher, IonRefresherContent,
    IonIcon, IonButton, StatusPillComponent, EmptyStateComponent, ZarPipe, HeaderActionsComponent]
})
export class QuotationsPage implements ViewWillEnter {
  private api = inject(QuotationService);
  private router = inject(Router);
  auth = inject(AuthService);

  loading = true; error = '';
  items: QuotationListItemDto[] = [];
  filter: F = 'all';
  compareIds = new Set<number>();
  readonly filters: { key: F; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'open', label: 'Open' }, { key: 'closed', label: 'Closed' }];

  constructor() { addIcons({ calendarOutline, checkmarkCircle, ellipseOutline, swapHorizontalOutline }); }
  ionViewWillEnter() { this.load(); }

  get isSupplier() { return this.auth.role === 'supplier'; }
  isOpen(q: QuotationListItemDto) { return !/(accept|reject|declin|expire|cancel|convert|book|supersed)/i.test(q.status); }
  get shown() { return this.items.filter(q => this.filter === 'all' || (this.filter === 'open' ? this.isOpen(q) : !this.isOpen(q))); }
  get needsAttention() { return this.items.filter(q => this.isSupplier ? /request|pending|await/i.test(q.status) && !/quoted/i.test(q.status) : /quoted|submitted/i.test(q.status)).length; }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    const call = this.isSupplier ? this.api.supplierGetAll({ page: 1, pageSize: 100 }) : this.api.contractorGetAll({ page: 1, pageSize: 100 });
    call.subscribe({
      next: (r: any) => { this.items = r.quotations || []; this.loading = false; ev?.target.complete(); },
      error: (e: any) => { this.error = e?.error?.message || 'Could not load quotations.'; this.loading = false; ev?.target.complete(); }
    });
  }

  toggleCompare(id: number, ev: Event) {
    ev.preventDefault(); ev.stopPropagation();
    if (this.compareIds.has(id)) this.compareIds.delete(id);
    else if (this.compareIds.size < 4) this.compareIds.add(id);
  }
  goCompare() { if (this.compareIds.size >= 2) this.router.navigate(['/tabs/quotation-compare'], { queryParams: { ids: Array.from(this.compareIds).join(',') } }); }
}
