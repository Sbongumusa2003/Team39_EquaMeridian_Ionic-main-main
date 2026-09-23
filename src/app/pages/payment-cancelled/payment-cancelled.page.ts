import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  standalone: true, selector: 'app-payment-cancelled',
  template: `
  <ion-header><ion-toolbar><ion-title>Payment cancelled</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <div class="center">
      <ion-icon name="close-circle-outline" color="medium" style="font-size:64px"></ion-icon>
      <h2>Payment not completed</h2>
      <p>No charge was made. You can retry from Cart or your invoice.</p>
      @if (invoiceId) {
        <ion-button expand="block" class="btn-gold" [routerLink]="['/tabs/invoices', invoiceId]">Back to invoice</ion-button>
        <ion-button expand="block" fill="outline" routerLink="/tabs/cart">Back to cart</ion-button>
      } @else {
        <ion-button expand="block" class="btn-gold" routerLink="/tabs/cart">Back to cart</ion-button>
      }
      <ion-button expand="block" fill="clear" routerLink="/tabs/bookings">Bookings</ion-button>
    </div>
  </ion-content>`,
  styles: [`.center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding-top:48px;}.btn-gold{--background:var(--gold,#c5a059);--color:#111;font-weight:700;max-width:320px;width:100%;}`],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon]
})
export class PaymentCancelledPage implements OnInit {
  invoiceId: number | null = null;
  private route = inject(ActivatedRoute);
  constructor() { addIcons({ closeCircleOutline }); }
  ngOnInit() {
    const raw = this.route.snapshot.queryParamMap.get('invoiceId');
    this.invoiceId = raw ? Number(raw) : null;
  }
}
