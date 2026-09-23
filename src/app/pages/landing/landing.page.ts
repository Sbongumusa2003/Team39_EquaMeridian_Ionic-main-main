import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonIcon, IonRefresher, IonRefresherContent, RefresherCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, calendarOutline, documentTextOutline, receiptOutline, heartOutline, shieldCheckmarkOutline,
  ribbonOutline, cardOutline, arrowForwardOutline, construct, businessOutline, chevronForwardOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { CategoryService, CategoryDto } from '../../core/services/category.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistActionsService } from '../../core/services/wishlist-actions.service';
import { ListingDto } from '../../core/models/listing.models';
import { ProductCardComponent } from '../../shared/product-card.component';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  imports: [
    RouterLink, IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonIcon, IonRefresher, IonRefresherContent,
    ProductCardComponent, HeaderActionsComponent
  ]
})
export class LandingPage implements OnInit {
  auth = inject(AuthService);
  wishlist = inject(WishlistService);
  private listings = inject(ListingService);
  private cats = inject(CategoryService);
  private wishActions = inject(WishlistActionsService);

  featured: ListingDto[] = [];
  categories: CategoryDto[] = [];
  loadingFeatured = true;

  steps = [
    { icon: 'search-outline', title: 'Find', body: 'Search verified plant & equipment by category, location and rate.' },
    { icon: 'document-text-outline', title: 'Quote or book', body: 'Book fixed-rate machines instantly, or request a quote.' },
    { icon: 'shield-checkmark-outline', title: 'Sign & pay', body: 'Digital lease, secure PayFast or EFT payment.' },
    { icon: 'calendar-outline', title: 'Deliver & return', body: 'Track delivery, inspect on return, review the hire.' },
  ];

  constructor() {
    addIcons({
      searchOutline, calendarOutline, documentTextOutline, receiptOutline, heartOutline, shieldCheckmarkOutline,
      ribbonOutline, cardOutline, arrowForwardOutline, construct, businessOutline, chevronForwardOutline
    });
  }

  get firstName(): string { return (this.auth.fullName || '').split(' ')[0]; }

  ngOnInit() { this.load(); }

  load(ev?: RefresherCustomEvent) {
    this.cats.getAll().subscribe({ next: c => this.categories = c || [], error: () => {} });
    this.loadingFeatured = true;
    this.listings.browseMachinery({ page: 1, pageSize: 8 }).subscribe({
      next: r => { this.featured = r.listings || []; this.loadingFeatured = false; ev?.target.complete(); },
      error: () => { this.loadingFeatured = false; ev?.target.complete(); }
    });
  }

  toggleWish(id: number) { this.wishActions.toggle(id); }
}
