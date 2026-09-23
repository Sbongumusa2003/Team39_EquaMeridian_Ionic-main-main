import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner, IonButtons, IonBackButton, IonInput,
  IonFooter, ToastController, AlertController, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, storefrontOutline, checkmarkCircle, alertCircleOutline, calendarOutline, pricetagOutline } from 'ionicons/icons';
import { CartService } from '../../core/services/cart.service';
import { ListingService } from '../../core/services/listing.service';
import { CartDto, CartItemDto, CartSupplierGroupDto, CheckoutResultBookingDto } from '../../core/models/cart.models';
import { ZarPipe } from '../../shared/zar.pipe';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [
    FormsModule, DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner,
    IonButtons, IonBackButton, IonInput, IonFooter, ZarPipe, EmptyStateComponent
  ]
})
export class CartPage implements ViewWillEnter {
  private toast = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private cartSvc = inject(CartService);
  private listings = inject(ListingService);

  loading = true;
  error = '';
  cart: CartDto | null = null;
  groups: CartSupplierGroupDto[] = [];
  promoCode = '';
  promoFeedback = '';
  promoOk = false;
  checkingOut = false;
  /** Set after a successful checkout: shows next steps (sign lease → pay) instead of the cart. */
  placed: CheckoutResultBookingDto[] | null = null;

  constructor() { addIcons({ trashOutline, storefrontOutline, checkmarkCircle, alertCircleOutline, calendarOutline, pricetagOutline }); }

  ionViewWillEnter() { this.placed = null; this.load(); }

  get itemCount(): number { return this.cart?.itemCount ?? 0; }
  get total(): number { return this.cart?.grandTotal ?? 0; }
  get sum() {
    const g = this.groups;
    const add = (f: (x: CartSupplierGroupDto) => number) => g.reduce((a, x) => a + (f(x) || 0), 0);
    return {
      rental: add(x => x.groupRentalSubtotal), discount: add(x => x.groupDiscountAmount),
      delivery: add(x => x.groupDeliveryFee), vat: add(x => x.groupVatAmount)
    };
  }

  img(item: CartItemDto): string { return item.imageUrl ? this.listings.resolveImageUrl(item.imageUrl) : ''; }

  load() {
    this.loading = true; this.error = '';
    const code = this.promoOk && this.promoCode.trim() ? this.promoCode.trim() : undefined;
    this.cartSvc.getCart(code).subscribe({
      next: c => { this.apply(c); this.loading = false; },
      error: e => {
        this.loading = false; this.cart = null; this.groups = [];
        this.error = e?.status === 401 || e?.status === 403
          ? 'Sign in with a contractor account to use the cart.'
          : (e?.error?.message || 'Could not load your cart.');
      }
    });
  }

  private apply(c: CartDto) {
    this.cart = c;
    this.groups = c.supplierGroups || [];
    if (c.promoMessage) { this.promoOk = !!c.promoValid; this.promoFeedback = c.promoMessage; }
  }

  applyPromo() {
    const code = this.promoCode.trim();
    if (!code) { this.promoFeedback = 'Enter a promo code.'; this.promoOk = false; return; }
    this.cartSvc.getCart(code).subscribe({
      next: c => {
        this.apply(c);
        this.promoOk = !!c.promoValid;
        this.promoFeedback = c.promoMessage || (c.promoValid ? 'Promo applied.' : 'That code is invalid or expired.');
      },
      error: () => { this.promoOk = false; this.promoFeedback = 'Could not validate that code.'; }
    });
  }

  async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2400, color, position: 'top' });
    await t.present();
  }

  async remove(item: CartItemDto) {
    const a = await this.alertCtrl.create({
      header: 'Remove from cart?', message: item.listingTitle,
      buttons: [
        { text: 'Keep', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: () => {
          this.cartSvc.removeItem(item.cartItemID).subscribe({
            next: c => this.apply(c),
            error: e => void this.say(e?.error?.message || 'Could not remove item', 'danger')
          });
        } }
      ]
    });
    await a.present();
  }

  checkout() {
    if (!this.itemCount || this.cart?.hasUnavailableItems) return;
    this.checkingOut = true;
    const code = this.promoOk && this.promoCode.trim() ? this.promoCode.trim() : undefined;
    this.cartSvc.checkout(code).subscribe({
      next: res => {
        this.checkingOut = false;
        if (res.success === false) { void this.say(res.error || 'Checkout failed', 'danger'); this.load(); return; }
        this.placed = res.bookings || [];
        this.cart = null; this.groups = [];
      },
      error: e => { this.checkingOut = false; void this.say(e?.error?.message || e?.error?.error || 'Checkout failed', 'danger'); }
    });
  }

  get placedTotal(): number { return (this.placed || []).reduce((a, b) => a + (b.totalAmount || 0), 0); }
}
