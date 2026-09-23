import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, searchOutline, personOutline, calendarOutline, cartOutline,
  storefrontOutline, cubeOutline, documentTextOutline
} from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

@Component({
  standalone: true,
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [AsyncPipe, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage {
  auth = inject(AuthService);
  cart = inject(CartService);
  role$ = this.auth.currentUser$;

  constructor() {
    addIcons({ homeOutline, searchOutline, personOutline, calendarOutline, cartOutline, storefrontOutline, cubeOutline, documentTextOutline });
  }
}
