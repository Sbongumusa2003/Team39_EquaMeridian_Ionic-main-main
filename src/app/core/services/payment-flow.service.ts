import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { PaymentService } from './payment.service';

/**
 * One place that starts a payment, used by Invoice, Booking and Cart screens so they all behave
 * the same: card invoices go to PayFast, invoices above the card limit open the EFT instructions
 * on the invoice screen, and "sign the lease first" errors deep-link to the lease.
 */
@Injectable({ providedIn: 'root' })
export class PaymentFlowService {
  private payments = inject(PaymentService);
  private router = inject(Router);
  private toast = inject(ToastController);

  start(invoiceId: number): Promise<void> {
    return new Promise(resolve => {
      this.payments.initiate(invoiceId).subscribe({
        next: res => {
          const isEft = (res.method || '').toUpperCase() === 'EFT' || !res.processUrl || !res.fields;
          if (isEft) {
            this.router.navigate(['/tabs/invoices', invoiceId], { queryParams: { eft: 1 } });
          } else {
            this.payments.redirectToCheckout(res);
          }
          resolve();
        },
        error: async e => {
          const leaseId = e?.error?.leaseAgreementId;
          const t = await this.toast.create({
            message: e?.error?.message || 'Could not start payment.',
            duration: 3200, color: 'danger', position: 'top'
          });
          await t.present();
          if (leaseId) this.router.navigate(['/tabs/lease-agreements', leaseId]);
          resolve();
        }
      });
    });
  }
}
