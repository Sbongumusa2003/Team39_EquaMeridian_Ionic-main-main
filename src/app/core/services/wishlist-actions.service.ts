import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from './auth.service';
import { WishlistService } from './wishlist.service';

/** Shared heart-button behaviour (guest → sign in, supplier → explain, contractor → toggle). */
@Injectable({ providedIn: 'root' })
export class WishlistActionsService {
  private auth = inject(AuthService);
  private wishlist = inject(WishlistService);
  private router = inject(Router);
  private toast = inject(ToastController);

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 1800, color, position: 'top' });
    await t.present();
  }

  toggle(listingId: number, after?: () => void): void {
    if (!this.auth.isLoggedIn) {
      void this.say('Sign in to save machines to your wishlist', 'warning');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.auth.role !== 'contractor') {
      void this.say('Wishlists are available on contractor accounts');
      return;
    }
    const wasOn = this.wishlist.isWishlisted(listingId);
    this.wishlist.toggle(listingId).subscribe({
      next: () => { void this.say(wasOn ? 'Removed from wishlist' : 'Saved to wishlist', 'success'); after?.(); },
      error: e => void this.say(e?.error?.message || 'Could not update wishlist', 'danger')
    });
  }
}
