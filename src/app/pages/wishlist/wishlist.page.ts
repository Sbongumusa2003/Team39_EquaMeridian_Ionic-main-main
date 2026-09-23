import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistActionsService } from '../../core/services/wishlist-actions.service';
import { WishlistItemDto } from '../../core/models/wishlist.models';
import { ProductCardComponent } from '../../shared/product-card.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
    ProductCardComponent, EmptyStateComponent, HeaderActionsComponent
  ]
})
export class WishlistPage implements ViewWillEnter {
  loading = true;
  error = '';
  items: WishlistItemDto[] = [];

  constructor(private api: WishlistService, private actions: WishlistActionsService) {}

  ionViewWillEnter() { this.load(); }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.refreshIds();
    this.api.getAll().subscribe({
      next: res => { this.items = res || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.items = []; this.loading = false; this.error = e?.error?.message || 'Could not load your wishlist.'; ev?.target.complete(); }
    });
  }

  remove(listingId: number) { this.actions.toggle(listingId, () => this.load()); }
  isSaved(id: number) { return this.api.isWishlisted(id); }
}
