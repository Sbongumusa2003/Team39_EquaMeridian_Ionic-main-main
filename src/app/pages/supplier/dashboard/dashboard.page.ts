import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, RefresherCustomEvent, ViewWillEnter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cubeOutline, documentTextOutline, walletOutline, clipboardOutline, chatbubblesOutline, calendarOutline, addOutline,
  chevronForwardOutline, flashOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ListingService } from '../../../core/services/listing.service';
import { QuotationService } from '../../../core/services/quotation.service';
import { BookingService } from '../../../core/services/booking.service';
import { PayoutService } from '../../../core/services/payout.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { BookingListItemDto } from '../../../core/models/booking.models';
import { HeaderActionsComponent } from '../../../shared/header-actions.component';
import { ZarPipe } from '../../../shared/zar.pipe';
import { nextActionFor } from '../../bookings/bookings.page';

@Component({
  selector: 'app-supplier-dashboard', standalone: true,
  templateUrl: './dashboard.page.html', styleUrls: ['./dashboard.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent, HeaderActionsComponent, ZarPipe]
})
export class SupplierDashboardPage implements ViewWillEnter {
  auth = inject(AuthService);
  private listings = inject(ListingService);
  private quotes = inject(QuotationService);
  private bookings = inject(BookingService);
  private payouts = inject(PayoutService);
  private invoices = inject(InvoiceService);
  eftCount = 0;

  activeListings: number | null = null;
  quotesWaiting: number | null = null;
  bookingsActive: number | null = null;
  bookingsAction: number | null = null;
  payoutTotal: number | null = null;
  payoutCount = 0;
  attention: { b: BookingListItemDto; text: string }[] = [];

  constructor() { addIcons({ cubeOutline, documentTextOutline, walletOutline, clipboardOutline, chatbubblesOutline, calendarOutline, addOutline, chevronForwardOutline, flashOutline }); }

  get firstName() { return (this.auth.fullName || '').split(' ')[0]; }
  ionViewWillEnter() { this.load(); }

  load(ev?: RefresherCustomEvent) {
    this.listings.supplierGetOwn({ status: 'Active', page: 1, pageSize: 1 }).subscribe({ next: r => this.activeListings = r?.totalCount ?? 0, error: () => this.activeListings = null });
    this.quotes.supplierGetAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => this.quotesWaiting = (r.quotations || []).filter(q => /request|pending|await/i.test(q.status) && !/quoted/i.test(q.status)).length,
      error: () => this.quotesWaiting = null
    });
    this.bookings.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => {
        this.bookingsActive = r.summaryCards?.activeBookings ?? 0;
        this.attention = (r.bookings || []).filter(b => b.needsAction).map(b => ({ b, text: nextActionFor(b, 'supplier') })).slice(0, 4);
        this.bookingsAction = r.summaryCards?.awaitingYourAction ?? this.attention.length;
        ev?.target.complete();
      },
      error: () => { this.bookingsActive = null; ev?.target.complete(); }
    });
    this.invoices.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => this.eftCount = (r.invoices || []).filter(i => i.stage ? i.stage === 'AwaitingConfirmation' : /eftsubmitted/i.test(i.paymentStatus)).length,
      error: () => this.eftCount = 0
    });
    this.payouts.getEligibleInvoices().subscribe({
      next: list => { this.payoutCount = list.length; this.payoutTotal = list.reduce((a, i) => a + i.payoutAmount, 0); },
      error: () => this.payoutTotal = null
    });
  }
}
