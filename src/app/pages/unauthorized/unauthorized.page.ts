import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  standalone: true, selector: 'app-unauthorized',
  template: `
  <ion-header><ion-toolbar><ion-title>Access denied</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <div class="center">
      <h2>You don’t have access to this area</h2>
      <p>Sign in with an account that has the required role, or go back home.</p>
      <ion-button routerLink="/tabs/home" class="btn-gold">Home</ion-button>
      <ion-button fill="clear" routerLink="/auth/login">Sign in</ion-button>
    </div>
  </ion-content>`,
  styles: [`.center{text-align:center;padding-top:48px;}.btn-gold{--background:var(--gold,#c5a059);--color:#111;font-weight:700;}`],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton]
})
export class UnauthorizedPage {}
