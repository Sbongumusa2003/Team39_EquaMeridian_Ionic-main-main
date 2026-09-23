import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subscription, interval } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { NotificationService } from './core/services/notification.service';

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
    // Light polling keeps the bell + cart badge honest without a websocket.
    this.subs.add(interval(60_000).subscribe(() => { if (this.auth.isLoggedIn) this.notes.refreshUnreadCount(); }));
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
