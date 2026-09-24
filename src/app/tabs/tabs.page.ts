import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, searchOutline, personOutline, calendarOutline, cartOutline,
  storefrontOutline, cubeOutline, documentTextOutline, notificationsOutline
} from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [AsyncPipe, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage {
  auth = inject(AuthService);
  cart = inject(CartService);
  notes = inject(NotificationService);
  role$ = this.auth.currentUser$;
  unread$ = this.notes.unreadCount$;

  constructor() {
    addIcons({
      homeOutline, searchOutline, personOutline, calendarOutline, cartOutline,
      storefrontOutline, cubeOutline, documentTextOutline, notificationsOutline
    });
  }
}
