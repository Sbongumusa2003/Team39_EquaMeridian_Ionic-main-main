import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonSearchbar, IonRefresher, IonRefresherContent,
  IonIcon, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, calendarOutline, flashOutline } from 'ionicons/icons';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingListItemDto, BookingSummaryCardsDto } from '../../core/models/booking.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

type Filter = 'all' | 'action' | 'pending' | 'active' | 'done' | 'cancelled';

/**
 * What to do next on a booking. The API decides this once (BookingRepository.ApplyNextAction) so the web app,
 * this app, the "Action needed" tab and the "Need action" card can never disagree.
 */
export function nextActionFor(b: BookingListItemDto, _role?: string | null): string {
  return b.nextAction ?? '';
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  imports: [
    DatePipe, FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonSearchbar,
    IonRefresher, IonRefresherContent, IonIcon, StatusPillComponent, EmptyStateComponent, HeaderActionsComponent
  ]
})
export class BookingsPage implements ViewWillEnter {
  private api = inject(BookingService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  loading = true;
  error = '';
  search = '';
  filter: Filter = 'all';
  items: BookingListItemDto[] = [];
  summary: BookingSummaryCardsDto | null = null;
  emptyMessage = '';

  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'action', label: 'Action needed' }, { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' }, { key: 'done', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }
  ];

  constructor() { addIcons({ chevronForwardOutline, calendarOutline, flashOutline }); }

  ionViewWillEnter() {
    // Dashboard tiles link here with ?filter=active (or action, pending, done, cancelled) so the list matches the number tapped.
    const wanted = this.route.snapshot.queryParamMap.get('filter') as Filter | null;
    if (wanted && this.filters.some(f => f.key === wanted)) this.filter = wanted;
    this.load();
  }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getAll({ page: 1, pageSize: 100, search: this.search.trim() || undefined }).subscribe({
      next: res => {
        this.items = res.bookings || [];
        this.summary = res.summaryCards || null;
        this.emptyMessage = res.message || '';
        this.loading = false; ev?.target.complete();
      },
      error: e => { this.error = e?.error?.message || 'Could not load bookings.'; this.loading = false; ev?.target.complete(); }
    });
  }

  next(b: BookingListItemDto): string { return nextActionFor(b, this.auth.role); }
  needsAction(b: BookingListItemDto): boolean { return !!b.needsAction; }

  /** Same rules as the API's BookingStages, so a tab's count always equals the number of cards it lists. */
  private matches(b: BookingListItemDto, f: Filter): boolean {
    switch (f) {
      case 'action': return this.needsAction(b);
      case 'pending': return b.stage === 'Pending';
      case 'active': return b.stage === 'Active';
      case 'done': return b.status === 'Completed';
      case 'cancelled': return b.status === 'Cancelled';
      default: return true;
    }
  }
  get shown(): BookingListItemDto[] { return this.items.filter(b => this.matches(b, this.filter)); }
  count(f: Filter): number { return this.items.filter(b => this.matches(b, f)).length; }
  counterparty(b: BookingListItemDto): string { return this.auth.role === 'supplier' ? b.contractorName : b.supplierName; }
}
