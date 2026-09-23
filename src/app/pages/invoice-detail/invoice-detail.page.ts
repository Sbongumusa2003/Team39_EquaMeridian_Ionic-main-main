import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
  IonRefresher, IonRefresherContent, AlertController, ToastController, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, imageOutline, cloudUploadOutline, copyOutline, timeOutline } from 'ionicons/icons';
import { InvoiceService } from '../../core/services/invoice.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { FileDownloadService } from '../../core/services/file-download.service';
import { InvoiceDto } from '../../core/models/invoice.models';
import { InitiatePaymentResponseDto } from '../../core/models/payment.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

@Component({
  standalone: true,
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.page.html',
  styleUrls: ['./invoice-detail.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner,
    IonRefresher, IonRefresherContent, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class InvoiceDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private api = inject(InvoiceService);
  private payments = inject(PaymentService);
  private files = inject(FileDownloadService);
  private toast = inject(ToastController);
  private alert = inject(AlertController);
  auth = inject(AuthService);

  invoiceId = Number(this.route.snapshot.paramMap.get('id'));
  loading = true; error = '';
  inv: InvoiceDto | null = null;
  paying = false; uploading = false; confirming = false;
  eftInfo: InitiatePaymentResponseDto | null = null;
  private autoEft = this.route.snapshot.queryParamMap.get('eft') === '1';

  constructor() { addIcons({ downloadOutline, imageOutline, cloudUploadOutline, copyOutline, timeOutline }); }

  ionViewWillEnter() { this.reload(); }

  // ── Price breakdown (mirrors the invoice PDF) ─────────────────────────────
  get discount(): number { return this.inv?.discountAmount ?? 0; }
  get delivery(): number { return this.inv?.deliveryFee ?? 0; }
  /** Amount VAT is charged on. Derived from the total so it can never disagree with it. */
  get exclVat(): number { return (this.inv?.totalAmount ?? 0) - (this.inv?.vatAmount ?? 0); }
  /** Anything the API didn't itemise. Shown explicitly so the lines always add up to the total. */
  get otherAdjustments(): number {
    const i = this.inv;
    if (!i) return 0;
    const diff = this.exclVat - (i.subtotal - this.discount + this.delivery);
    return Math.abs(diff) >= 0.01 ? Math.round(diff * 100) / 100 : 0;
  }
  /** "R 3 000 × 20 days × 2 units" – only when it really equals the subtotal (weekly rates etc. may not). */
  get hireCalc(): string {
    const i = this.inv;
    if (!i?.rentalDays) return '';
    const units = i.quantity && i.quantity > 1 ? ` × ${i.quantity} unit${i.quantity === 1 ? '' : 's'}` : '';
    const days = `${i.rentalDays} day${i.rentalDays === 1 ? '' : 's'}`;
    const rate = i.dailyRateZAR ?? 0;
    const matches = rate > 0 && Math.abs(rate * i.rentalDays * (i.quantity ?? 1) - i.subtotal) < 1;
    return matches ? `${new ZarPipe().transform(rate, 0)} × ${days}${units}` : `${days}${units}`;
  }

  get status(): string { return this.inv?.paymentStatus || this.inv?.status || ''; }
  get isPaid(): boolean { return /^paid$/i.test(this.status); }
  get isContractor() { return this.auth.role === 'contractor'; }
  get isSupplier() { return this.auth.role === 'supplier'; }
  get eftSubmitted() { return /eftsubmitted/i.test(this.status); }
  get canPay() { return this.isContractor && /^pending$/i.test(this.status); }   // Paid, EFT proof sent, Cancelled and Refunded invoices cannot be paid
  get canConfirmEft() { return this.isSupplier && this.eftSubmitted; }
  get showProof() { return this.eftSubmitted || (this.isPaid && !!this.eftInfo); }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }

  reload(ev?: RefresherCustomEvent) {
    if (!this.inv) this.loading = true;
    this.api.getById(this.invoiceId).subscribe({
      next: i => {
        this.inv = i; this.loading = false; ev?.target.complete();
        if (this.autoEft && this.canPay) { this.autoEft = false; this.pay(); }
      },
      error: e => { this.loading = false; ev?.target.complete(); this.error = e?.error?.message || 'Could not load this invoice.'; }
    });
  }

  pay() {
    if (!this.inv) return;
    this.paying = true;
    this.payments.initiate(this.invoiceId).subscribe({
      next: res => {
        this.paying = false;
        if ((res.method || '').toUpperCase() === 'EFT' || !res.processUrl || !res.fields) { this.eftInfo = res; return; }
        this.payments.redirectToCheckout(res);
      },
      error: e => { this.paying = false; void this.say(e?.error?.message || 'Could not start payment.', 'danger'); }
    });
  }

  copy(text?: string | null) {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => this.say('Copied', 'success'), () => {});
  }

  onProof(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.payments.uploadEftProof(this.invoiceId, file).subscribe({
      next: () => { this.uploading = false; void this.say('Proof uploaded — the supplier will confirm receipt.', 'success'); this.eftInfo = null; this.reload(); },
      error: e => { this.uploading = false; void this.say(e?.error?.message || 'Upload failed.', 'danger'); }
    });
  }

  viewProof() {
    this.payments.downloadEftProof(this.invoiceId).subscribe({
      next: (b: Blob) => this.files.open(b),
      error: () => void this.say('No proof of payment available yet.', 'warning')
    });
  }

  async confirmEft() {
    const a = await this.alert.create({
      header: 'Confirm funds received?',
      message: 'Only confirm once the money is in your bank account. This marks the invoice as paid.',
      buttons: [{ text: 'Not yet', role: 'cancel' }, { text: 'Yes, received', handler: () => {
        this.confirming = true;
        this.payments.confirmEftReceived(this.invoiceId).subscribe({
          next: () => { this.confirming = false; void this.say('Invoice marked as paid', 'success'); this.reload(); },
          error: e => { this.confirming = false; void this.say(e?.error?.message || 'Could not confirm.', 'danger'); }
        });
      } }]
    });
    await a.present();
  }

  download() {
    if (!this.inv) return;
    this.api.downloadPdf(this.invoiceId).subscribe({
      next: b => this.files.save(b, `${this.inv!.invoiceNumber}.pdf`),
      error: () => void this.say('Could not download the invoice.', 'danger')
    });
  }
}
