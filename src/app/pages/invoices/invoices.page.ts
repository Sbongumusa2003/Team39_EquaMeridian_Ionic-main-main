import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
  IonIcon, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, receiptOutline } from 'ionicons/icons';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceListItemDto } from '../../core/models/invoice.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

type F = 'all' | 'confirm' | 'unpaid' | 'paid';

@Component({
  standalone: true, selector: 'app-invoices',
  templateUrl: './invoices.page.html', styleUrls: ['./invoices.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class InvoicesPage implements ViewWillEnter {
  private api = inject(InvoiceService);
  auth = inject(AuthService);
  loading = true; error = '';
  items: InvoiceListItemDto[] = [];
  private route = inject(ActivatedRoute);
  filter: F = (this.route.snapshot.queryParamMap.get('filter') as F) || 'all';
  constructor() { addIcons({ chevronForwardOutline, receiptOutline }); }
  ionViewWillEnter() { this.load(); }

  get isSupplier() { return this.auth.role === 'supplier'; }
  /** The API classifies every invoice once (Unpaid / AwaitingConfirmation / Paid / Closed); the web app uses the same. */
  stageOf(i: InvoiceListItemDto): string {
    if (i.stage) return i.stage;
    const s = (i.paymentStatus || '').toLowerCase();
    if (s === 'paid') return 'Paid';
    if (s === 'eftsubmitted') return 'AwaitingConfirmation';
    if (s === 'cancelled' || s === 'refunded') return 'Closed';
    return 'Unpaid';
  }
  isPaid(i: InvoiceListItemDto) { return this.stageOf(i) === 'Paid'; }
  isEft(i: InvoiceListItemDto) { return this.stageOf(i) === 'AwaitingConfirmation'; }
  private matches(i: InvoiceListItemDto, f: F) {
    switch (f) {
      case 'confirm': return this.isEft(i);
      case 'paid':    return this.isPaid(i);
      case 'unpaid':  return this.stageOf(i) === 'Unpaid';
      default:        return true;
    }
  }
  get shown() { return this.items.filter(i => this.matches(i, this.filter)); }
  count(f: F) { return this.items.filter(i => this.matches(i, f)).length; }
  get toConfirm() { return this.count('confirm'); }
  get filters(): { key: F; label: string }[] {
    const base: { key: F; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'unpaid', label: 'Unpaid' }, { key: 'paid', label: 'Paid' }];
    // Same tabs as the web app: EFT payments waiting to be confirmed are "To confirm" for the supplier and
    // "Awaiting confirmation" for the contractor (before, they were mixed into Unpaid).
    const confirm: { key: F; label: string } = { key: 'confirm', label: this.isSupplier ? 'To confirm' : 'Awaiting confirmation' };
    return [base[0], base[1], confirm, base[2]];
  }
  /** What the contractor still has to pay: unpaid invoices only (equals the total of the Unpaid tab). */
  get outstanding(): number { return this.items.filter(i => this.stageOf(i) === 'Unpaid').reduce((a, i) => a + i.totalAmount, 0); }
  overdue(i: InvoiceListItemDto) { return this.stageOf(i) === 'Unpaid' && new Date(i.dueDate) < new Date(); }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.invoices || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load invoices.'; this.loading = false; ev?.target.complete(); }
    });
  }
}
