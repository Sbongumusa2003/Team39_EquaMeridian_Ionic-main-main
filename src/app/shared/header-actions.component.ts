import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, notificationsOutline } from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { NotificationService } from '../core/services/notification.service';

/** Cart (contractors) + notification bell with live badges — drop into any `slot="end"` toolbar. */
@Component({
  standalone: true,
  selector: 'app-header-actions',
  imports: [AsyncPipe, RouterLink, IonButton, IonIcon, IonBadge],
  template: `
    @if (auth.isLoggedIn) {
      @if (auth.role === 'contractor') {
        <ion-button fill="clear" routerLink="/tabs/cart" aria-label="Cart" class="ha">
          <ion-icon slot="icon-only" name="cart-outline"></ion-icon>
          @if ((cart.itemCount$ | async); as n) { <ion-badge class="b">{{ n }}</ion-badge> }
        </ion-button>
      }
      <ion-button fill="clear" routerLink="/tabs/notifications" aria-label="Notifications" class="ha">
        <ion-icon slot="icon-only" name="notifications-outline"></ion-icon>
        @if ((notes.unreadCount$ | async); as n) { <ion-badge class="b">{{ n > 9 ? '9+' : n }}</ion-badge> }
      </ion-button>
    }`,
  styles: [`
    .ha { --color: var(--eq-ink); position:relative; --padding-start:8px; --padding-end:8px; }
    ion-icon { font-size: 23px; }
    .b { position:absolute; top:2px; right:0; --background:var(--eq-gold); --color:#111; font-size:.62rem; min-width:17px; height:17px;
         display:flex; align-items:center; justify-content:center; border-radius:9px; padding:0 4px; }
  `],
})
export class HeaderActionsComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  notes = inject(NotificationService);
  constructor() { addIcons({ cartOutline, notificationsOutline }); }
}
