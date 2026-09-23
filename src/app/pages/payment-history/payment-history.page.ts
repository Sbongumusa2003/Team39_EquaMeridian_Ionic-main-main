import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceListItemDto } from '../../core/models/invoice.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

type F = 'all' | 'paid' | 'awaiting' | 'confirm';

/**
 * Payment history is built from the user's invoices. Every payment (card *and* EFT) is settled against an
 * invoice, so this shows the complete picture, including EFT payments that have no gateway record, and it
 * doesn't depend on the payment-gateway sync that the /payments/history endpoint performs.
 */
@Component({
  selector: 'app-payment-history', standalone: true,
  templateUrl: './payment-history.page.html', styleUrls: ['./payment-history.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class PaymentHistoryPage implements ViewWillEnter {
  private api = inject(InvoiceService);
  auth = inject(AuthService);
  loading = true; error = '';
  items: InvoiceListItemDto[] = [];
  filter: F = 'all';

  ionViewWillEnter() { this.load(); }

  get isSupplier() { return this.auth.role === 'supplier'; }
  /** The API classifies every invoice once (Unpaid / AwaitingConfirmation / Paid / Closed); web app and Invoices page use the same. */
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
      case 'paid':     return this.isPaid(i);
      case 'awaiting': return this.stageOf(i) === 'Unpaid';
      case 'confirm':  return this.isEft(i);
      default:         return true;
    }
  }
  get shown() { return this.items.filter(i => this.matches(i, this.filter)); }
  count(f: F) { return this.items.filter(i => this.matches(i, f)).length; }
  get filters(): { key: F; label: string }[] {
    return [
      { key: 'all', label: 'All' },
      { key: 'awaiting', label: this.isSupplier ? 'Awaiting payment' : 'Outstanding' },
      { key: 'confirm', label: this.isSupplier ? 'To confirm' : 'Awaiting confirmation' },
      { key: 'paid', label: this.isSupplier ? 'Received' : 'Paid' }
    ];
  }

  private sum(list: InvoiceListItemDto[]) { return list.reduce((a, i) => a + (i.totalAmount || 0), 0); }
  get paidTotal() { return this.sum(this.items.filter(i => this.isPaid(i))); }
  get eftTotal() { return this.sum(this.items.filter(i => this.isEft(i))); }
  /** Money still owed: an EFT whose proof is already submitted is paid from the contractor's side, so it is excluded. */
  get openTotal() { return this.sum(this.items.filter(i => this.stageOf(i) === 'Unpaid')); }
  get eftCount() { return this.items.filter(i => this.isEft(i)).length; }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.invoices || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load your payments.'; this.loading = false; ev?.target.complete(); }
    });
  }
}
