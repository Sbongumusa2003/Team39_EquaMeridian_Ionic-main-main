import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, star, locationOutline, ribbonOutline, cubeOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { ListingDto } from '../../core/models/listing.models';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistActionsService } from '../../core/services/wishlist-actions.service';
import { ProductCardComponent } from '../../shared/product-card.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

interface StorefrontDto {
  supplierID: number; supplierName: string; companyName?: string | null; locationSummary?: string | null;
  averageRating: number; reviewCount: number; activeListings: number; verified: boolean; listings: ListingDto[];
}

@Component({
  standalone: true, selector: 'app-storefront',
  templateUrl: './storefront.page.html', styleUrls: ['./storefront.page.scss'],
  imports: [DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon, ProductCardComponent, EmptyStateComponent]
})
export class StorefrontPage implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private wishActions = inject(WishlistActionsService);
  wishlist = inject(WishlistService);
  store: StorefrontDto | null = null;
  loading = true; error = '';
  constructor() { addIcons({ starOutline, star, locationOutline, ribbonOutline, cubeOutline }); }
  ngOnInit() { this.load(); }
  load() {
    const id = Number(this.route.snapshot.paramMap.get('supplierId'));
    if (!id) { this.error = 'Supplier not found'; this.loading = false; return; }
    this.loading = true;
    this.http.get<StorefrontDto>(`${environment.apiUrl}/suppliers/${id}`, { params: { page: 1, pageSize: 24 } }).subscribe({
      next: s => { this.store = s; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Could not load this supplier.'; }
    });
  }
  toggleWish(id: number) { this.wishActions.toggle(id); }
}
