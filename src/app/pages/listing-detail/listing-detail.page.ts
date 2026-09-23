import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonFooter, IonButton, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, waterOutline, carOutline, businessOutline, heart, heartOutline, chevronForwardOutline,
  constructOutline, cubeOutline, checkmarkCircleOutline, informationCircleOutline
} from 'ionicons/icons';
import { ListingService } from '../../core/services/listing.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistActionsService } from '../../core/services/wishlist-actions.service';
import { AuthService } from '../../core/services/auth.service';
import { ListingDto } from '../../core/models/listing.models';
import { ZarPipe } from '../../shared/zar.pipe';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

@Component({
  standalone: true,
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.page.html',
  styleUrls: ['./listing-detail.page.scss'],
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonFooter, IonButton, IonIcon,
    ZarPipe, EmptyStateComponent, HeaderActionsComponent
  ]
})
export class ListingDetailPage implements OnInit {
  listing: ListingDto | null = null;
  loading = true;
  error = '';
  currentImage = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private toast = inject(ToastController);
  private wishActions = inject(WishlistActionsService);
  wishlist = inject(WishlistService);
  auth = inject(AuthService);

  constructor() {
    addIcons({
      locationOutline, waterOutline, carOutline, businessOutline, heart, heartOutline, chevronForwardOutline,
      constructOutline, cubeOutline, checkmarkCircleOutline, informationCircleOutline
    });
  }

  ngOnInit() { this.load(); }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Invalid listing'; this.loading = false; return; }
    this.loading = true; this.error = '';
    this.listingService.getById(id).subscribe({
      next: l => { this.listing = l; this.loading = false; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this listing.'; }
    });
  }

  images(): string[] {
    const l = this.listing;
    if (!l) return [];
    const urls = l.imageUrls?.length ? l.imageUrls : (l.images || []).map(i => i.url);
    return urls.map(u => this.listingService.resolveImageUrl(u));
  }

  onGallery(ev: Event) {
    const el = ev.target as HTMLElement;
    this.currentImage = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
  }

  get isQuote(): boolean { return this.listing?.pricingMode === 'QuoteRequired'; }
  get soldOut(): boolean { return !!this.listing && !this.isQuote && this.listing.unitsAvailable <= 0; }
  get isContractorOrGuest(): boolean { return this.auth.role !== 'supplier' && this.auth.role !== 'admin'; }
  get wished(): boolean { return !!this.listing && this.wishlist.isWishlisted(this.listing.listingID); }

  toggleWish() { if (this.listing) this.wishActions.toggle(this.listing.listingID); }

  async primaryAction() {
    if (!this.listing) return;
    if (!this.auth.isLoggedIn) {
      const t = await this.toast.create({ message: 'Sign in to continue', duration: 2200, color: 'warning', position: 'top' });
      await t.present();
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/tabs/browse/${this.listing.listingID}` } });
      return;
    }
    this.router.navigate([this.isQuote ? '/tabs/request-quote' : '/tabs/book-now', this.listing.listingID]);
  }
}
