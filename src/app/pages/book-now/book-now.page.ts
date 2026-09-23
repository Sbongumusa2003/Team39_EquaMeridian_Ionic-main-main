import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea, IonButtons, IonBackButton,
  IonFooter, IonIcon, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, cubeOutline } from 'ionicons/icons';
import { ListingService } from '../../core/services/listing.service';
import { CartService } from '../../core/services/cart.service';
import { ListingDto } from '../../core/models/listing.models';
import { ZarPipe } from '../../shared/zar.pipe';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-book-now',
  templateUrl: './book-now.page.html',
  styleUrls: ['./book-now.page.scss'],
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea, IonButtons,
    IonBackButton, IonFooter, IonIcon, IonSpinner, ZarPipe, EmptyStateComponent
  ]
})
export class BookNowPage implements OnInit {
  listing: ListingDto | null = null;
  loading = true;
  submitting = false;
  error = '';

  startDate = '';
  endDate = '';
  quantity = 1;
  fulfillmentMethod: 'Supplier Delivery' | 'Contractor Pickup' = 'Contractor Pickup';
  deliveryAddress = '';
  minDate = new Date().toISOString().substring(0, 10);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listings = inject(ListingService);
  private cart = inject(CartService);
  private toast = inject(ToastController);

  constructor() { addIcons({ carOutline, cubeOutline }); }

  ngOnInit() { this.load(); }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('listingId'));
    if (!id) { this.error = 'Missing listing'; this.loading = false; return; }
    this.loading = true;
    this.listings.contractorGetById(id).subscribe({
      next: l => {
        this.listing = l;
        this.loading = false;
        if (l.deliveryAvailable && !l.pickupAvailable) this.fulfillmentMethod = 'Supplier Delivery';
      },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load listing'; }
    });
  }

  get days(): number {
    if (!this.startDate || !this.endDate) return 0;
    const d = Math.round((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86400000);
    return d > 0 ? d : 0;
  }
  /** Rough figure only — the cart applies discounts, delivery distance and VAT. */
  get estimate(): number {
    if (!this.listing || !this.days) return 0;
    return this.days * this.listing.dailyRateZAR * this.quantity;
  }
  get maxQty(): number { return Math.max(1, this.listing?.unitsAvailable ?? 1); }
  get img(): string {
    const l = this.listing;
    const raw = l?.imageUrls?.[0] || l?.images?.[0]?.url || '';
    return raw ? this.listings.resolveImageUrl(raw) : '';
  }

  setQty(n: number) { this.quantity = Math.min(this.maxQty, Math.max(1, n)); }
  onStartChange() { if (this.endDate && this.endDate <= this.startDate) this.endDate = ''; }

  async submit() {
    this.error = '';
    const l = this.listing;
    if (!l) return;
    if (!this.startDate || !this.endDate) { this.error = 'Choose a start and end date.'; return; }
    if (new Date(this.endDate) <= new Date(this.startDate)) { this.error = 'The end date must be after the start date.'; return; }
    if (this.fulfillmentMethod === 'Supplier Delivery' && this.deliveryAddress.trim().length < 5) {
      this.error = 'Enter the delivery address (at least 5 characters).'; return;
    }
    this.submitting = true;
    this.cart.addItem({
      listingID: l.listingID, startDate: this.startDate, endDate: this.endDate, quantity: this.quantity,
      fulfillmentMethod: this.fulfillmentMethod,
      deliveryAddress: this.fulfillmentMethod === 'Supplier Delivery' ? this.deliveryAddress.trim() : undefined
    }).subscribe({
      next: async () => {
        this.submitting = false;
        const t = await this.toast.create({ message: 'Added to cart', duration: 1800, color: 'success', position: 'top' });
        await t.present();
        this.router.navigateByUrl('/tabs/cart');
      },
      error: e => {
        this.submitting = false;
        this.error = e?.error?.message || e?.error?.title || (typeof e?.error === 'string' ? e.error : '')
          || (e?.status === 401 ? 'Please sign in as a contractor.' : e?.status === 403 ? 'Only contractor accounts can book equipment.' : 'Could not add to cart.');
      }
    });
  }
}
