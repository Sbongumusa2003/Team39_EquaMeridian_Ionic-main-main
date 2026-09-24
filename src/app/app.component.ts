import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subscription, interval } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { NotificationService } from './core/services/notification.service';
import { AppToastService } from './core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private push = inject(PushNotificationService);
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private notes = inject(NotificationService);
  private toast = inject(AppToastService);
  private subs = new Subscription();

  ngOnInit() {
    this.subs.add(this.auth.currentUser$.subscribe(user => {
      if (user) {
        void this.push.init();
        this.refreshBadges();
      } else {
        void this.push.detach();
        this.cart.reset();
        this.wishlist.clear();
      }
    }));

    // Poll every 30s so suppliers/contractors see in-app updates promptly.
    this.subs.add(interval(30_000).subscribe(() => {
      if (this.auth.isLoggedIn) this.notes.refreshUnreadCount();
    }));

    // Toast each newly arrived in-app notification (bookings, quotes, listings, etc.).
    this.subs.add(this.notes.newNotifications$.subscribe(items => {
      for (const n of items) {
        const msg = n.title ? `${n.title}${n.body ? ': ' + n.body : ''}` : (n.body || 'New update');
        void this.toast.success(msg.length > 140 ? msg.slice(0, 137) + '…' : msg);
      }
    }));
  }

  private refreshBadges() {
    this.notes.refreshUnreadCount();
    // Unread count is only populated by getMine(); prime it once so the bell shows immediately.
    this.notes.getMine({ page: 1, pageSize: 1 }).subscribe({ error: () => {} });
    if (this.auth.role === 'contractor') {
      this.cart.refreshCount();
      this.wishlist.refreshIds();
    }
  }

  ngOnDestroy() { this.subs.unsubscribe(); }
}
