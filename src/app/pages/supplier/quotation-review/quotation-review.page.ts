import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput, IonTextarea, IonSpinner,
  IonFooter, ToastController, ViewWillEnter
} from '@ionic/angular/standalone';
import { QuotationService } from '../../../core/services/quotation.service';
import { QuotationReviewDto } from '../../../core/models/quotation.models';
import { StatusPillComponent } from '../../../shared/status-pill.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { ZarPipe } from '../../../shared/zar.pipe';

@Component({
  standalone: true, selector: 'app-supplier-quotation-review',
  templateUrl: './quotation-review.page.html', styleUrls: ['./quotation-review.page.scss'],
  imports: [DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput,
    IonTextarea, IonSpinner, IonFooter, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class SupplierQuotationReviewPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(QuotationService);
  private toast = inject(ToastController);

  id = Number(this.route.snapshot.paramMap.get('id'));
  q: QuotationReviewDto | null = null;
  loading = true; saving = false; error = '';
  dailyRateZAR: number | null = null; weeklyRateZAR: number | null = null; deliveryFee: number | null = 0;
  quoteValidUntil = ''; notesToCustomer = '';
  readonly minDate = new Date().toISOString().substring(0, 10);

  ionViewWillEnter() { this.load(); }

  /** A quote can be priced only while the request is still open. */
  get canQuote() { return !!this.q && !/(quoted|accept|reject|declin|expire|cancel|convert|book)/i.test(this.q.status); }
  get days() { const q = this.q; return q?.rentalStartDate && q.rentalEndDate ? Math.max(1, Math.round((+new Date(q.rentalEndDate) - +new Date(q.rentalStartDate)) / 86400000)) : 0; }
  get estimate() { return this.dailyRateZAR && this.q ? this.dailyRateZAR * this.days * (this.q.quantity ?? 1) + (this.deliveryFee || 0) : 0; }

  load() {
    if (!this.q) this.loading = true;
    this.api.supplierGetForReview(this.id).subscribe({
      next: q => {
        this.q = q; this.loading = false;
        if (q.dailyRateZAR && this.dailyRateZAR === null) { this.dailyRateZAR = q.dailyRateZAR; this.weeklyRateZAR = q.weeklyRateZAR ?? null; this.deliveryFee = q.deliveryFee ?? 0; }
      },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this request.'; }
    });
  }

  submit() {
    if (!this.q) return;
    const MAX = 10_000_000;
    if (!this.dailyRateZAR || isNaN(Number(this.dailyRateZAR)) || this.dailyRateZAR <= 0) { this.error = 'Enter a daily rate greater than zero.'; return; }
    if (this.dailyRateZAR > MAX) { this.error = 'The daily rate cannot be more than R 10,000,000.'; return; }
    if (this.weeklyRateZAR != null && (this.weeklyRateZAR as any) !== '' && (isNaN(Number(this.weeklyRateZAR)) || Number(this.weeklyRateZAR) < 0 || Number(this.weeklyRateZAR) > MAX)) { this.error = 'The weekly rate cannot be negative and must be at most R 10,000,000.'; return; }
    if (this.deliveryFee != null && (this.deliveryFee as any) !== '' && (isNaN(Number(this.deliveryFee)) || Number(this.deliveryFee) < 0 || Number(this.deliveryFee) > MAX)) { this.error = 'The delivery fee cannot be negative and must be at most R 10,000,000.'; return; }
    if (!this.quoteValidUntil) { this.error = 'Choose how long this quote is valid for.'; return; }
    this.error = ''; this.saving = true;
    this.api.supplierSubmit(this.id, {
      dailyRateZAR: this.dailyRateZAR, weeklyRateZAR: this.weeklyRateZAR || undefined,
      deliveryFee: this.deliveryFee || 0, quoteValidUntil: this.quoteValidUntil,
      notesToCustomer: this.notesToCustomer.trim() || undefined
    }).subscribe({
      next: async () => {
        this.saving = false;
        const t = await this.toast.create({ message: 'Quote sent to the contractor', duration: 2400, color: 'success', position: 'top' });
        await t.present();
        this.router.navigateByUrl('/tabs/quotations');
      },
      error: e => { this.saving = false; this.error = e?.error?.message || 'Could not send the quote.'; }
    });
  }
}
