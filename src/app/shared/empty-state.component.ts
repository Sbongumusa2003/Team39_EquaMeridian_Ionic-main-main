import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline, heartOutline, calendarOutline, documentTextOutline, receiptOutline, cubeOutline,
  searchOutline, alertCircleOutline, notificationsOutline, chatbubblesOutline, walletOutline,
  clipboardOutline, starOutline, cardOutline, folderOpenOutline, cloudOfflineOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-empty-state',
  imports: [RouterLink, IonButton, IonIcon],
  template: `
    <div class="es">
      <div class="ring"><ion-icon [name]="icon"></ion-icon></div>
      <h3>{{ title }}</h3>
      @if (message) { <p>{{ message }}</p> }
      @if (actionLabel && actionLink) {
        <ion-button class="btn-gold" [routerLink]="actionLink">{{ actionLabel }}</ion-button>
      } @else if (actionLabel) {
        <ion-button class="btn-gold" (click)="action.emit()">{{ actionLabel }}</ion-button>
      }
    </div>`,
  styles: [`
    .es { display:flex; flex-direction:column; align-items:center; text-align:center; padding:48px 28px; gap:6px; }
    .ring { width:76px; height:76px; border-radius:50%; background:var(--eq-gold-soft); color:var(--eq-gold-dark);
            display:flex; align-items:center; justify-content:center; font-size:34px; margin-bottom:8px; }
    h3 { margin:0; font-size:1.1rem; font-weight:800; }
    p { margin:0 0 10px; color:var(--eq-muted); font-size:0.9rem; max-width:300px; line-height:1.45; }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'folder-open-outline';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionLink: string | any[] | null = null;
  @Output() action = new EventEmitter<void>();
  constructor() {
    addIcons({
      cartOutline, heartOutline, calendarOutline, documentTextOutline, receiptOutline, cubeOutline,
      searchOutline, alertCircleOutline, notificationsOutline, chatbubblesOutline, walletOutline,
      clipboardOutline, starOutline, cardOutline, folderOpenOutline, cloudOfflineOutline
    });
  }
}
