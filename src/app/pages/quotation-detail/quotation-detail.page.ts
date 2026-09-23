import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonSpinner, IonFooter,
  AlertController, ToastController, ViewWillEnter
} from '@ionic/angular/standalone';
import { QuotationService } from '../../core/services/quotation.service';
import { QuotationDetailDto } from '../../core/models/quotation.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

@Component({
  standalone: true, selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.page.html', styleUrls: ['./quotation-detail.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonSpinner, IonFooter,
    StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class QuotationDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(QuotationService);
  private alert = inject(AlertController);
  private toast = inject(ToastController);

  id = Number(this.route.snapshot.paramMap.get('id'));
  q: QuotationDetailDto | null = null;
  loading = true; error = ''; processing = false;

  ionViewWillEnter() { this.load(); }

  load() {
    if (!this.q) this.loading = true;
    this.api.contractorGetById(this.id).subscribe({
      next: q => { this.q = q; this.loading = false; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this quotation.'; }
    });
  }

  get days(): number { return this.q?.rentalStartDate && this.q?.rentalEndDate ? Math.max(1, Math.round((+new Date(this.q.rentalEndDate) - +new Date(this.q.rentalStartDate)) / 86400000)) : 0; }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }

  async accept() {
    if (!this.q) return;
    const a = await this.alert.create({
      header: 'Accept this quotation?',
      message: 'A booking, lease agreement and invoice will be created for you.',
      buttons: [{ text: 'Not yet', role: 'cancel' }, { text: 'Accept', handler: () => {
        this.processing = true;
        this.api.contractorAccept(this.id).subscribe({
          next: () => { this.processing = false; void this.say('Quotation accepted — sign your lease to continue.', 'success'); this.router.navigateByUrl('/tabs/bookings'); },
          error: e => { this.processing = false; void this.say(e?.error?.message || 'Could not accept the quotation.', 'danger'); }
        });
      } }]
    });
    await a.present();
  }

  async reject() {
    const a = await this.alert.create({
      header: 'Decline this quotation?',
      inputs: [{ name: 'reason', type: 'textarea', placeholder: 'Reason (optional)' }],
      buttons: [{ text: 'Keep', role: 'cancel' }, { text: 'Decline', role: 'destructive', handler: d => {
        this.processing = true;
        this.api.contractorReject(this.id, { reason: d?.reason || undefined }).subscribe({
          next: () => { this.processing = false; void this.say('Quotation declined'); this.load(); },
          error: e => { this.processing = false; void this.say(e?.error?.message || 'Could not decline.', 'danger'); }
        });
      } }]
    });
    await a.present();
  }
}
