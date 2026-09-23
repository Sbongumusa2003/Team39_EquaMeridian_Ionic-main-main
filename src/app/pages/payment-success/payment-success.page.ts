import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-payment-success',
  template: `
  <ion-header><ion-toolbar><ion-title>Payment</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <div class="center">
      <ion-icon name="checkmark-circle-outline" color="success" style="font-size:64px"></ion-icon>
      <h2>Payment submitted</h2>
      <p>If you paid by card, confirmation can take a few seconds while PayFast notifies our servers.</p>
      @if (invoiceId) {
        <ion-button expand="block" class="btn-gold" [routerLink]="['/tabs/invoices', invoiceId]">View invoice</ion-button>
      }
      <ion-button expand="block" fill="outline" routerLink="/tabs/bookings">My bookings</ion-button>
      <ion-button expand="block" fill="clear" routerLink="/tabs/payment-history">Payment history</ion-button>
    </div>
  </ion-content>
  `,
  styles: [`.center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding-top:48px;}
  .btn-gold{--background:var(--ion-color-primary,#c5a059);--color:#111;font-weight:700;max-width:320px;width:100%;}`],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon]
})
export class PaymentSuccessPage implements OnInit {
  invoiceId: number | null = null;
  private route = inject(ActivatedRoute);
  constructor() { addIcons({ checkmarkCircleOutline }); }
  ngOnInit() {
    const raw = this.route.snapshot.queryParamMap.get('invoiceId');
    this.invoiceId = raw ? Number(raw) : null;
  }
}
