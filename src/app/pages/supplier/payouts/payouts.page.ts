import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonButton, AlertController, ToastController, RefresherCustomEvent, ViewWillEnter } from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';
import { PayoutService } from '../../../core/services/payout.service';
import { EligibleInvoiceDto, PayoutDto } from '../../../core/models/payout.models';
import { StatusPillComponent } from '../../../shared/status-pill.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { ZarPipe } from '../../../shared/zar.pipe';

@Component({
  selector: 'app-supplier-payouts', standalone: true,
  templateUrl: './payouts.page.html', styleUrls: ['./payouts.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonButton, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class SupplierPayoutsPage implements ViewWillEnter {
  private api = inject(PayoutService);
  private alert = inject(AlertController);
  private toast = inject(ToastController);
  loading = true; error = '';
  tab: 'eligible' | 'history' = 'eligible';
  eligible: EligibleInvoiceDto[] = [];
  history: PayoutDto[] = [];
  requesting = 0;

  ionViewWillEnter() { this.load(); }
  get eligibleTotal() { return this.eligible.reduce((a, i) => a + i.payoutAmount, 0); }
  get paidTotal() { return this.history.filter(p => /paid|complete|process/i.test(p.status)).reduce((a, p) => a + p.payoutAmount, 0); }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    forkJoin({ e: this.api.getEligibleInvoices(), h: this.api.getMyPayouts() }).subscribe({
      next: ({ e, h }) => { this.eligible = e || []; this.history = (h || []).sort((a, b) => +new Date(b.requestedDate) - +new Date(a.requestedDate)); this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load payouts.'; this.loading = false; ev?.target.complete(); }
    });
  }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }

  async request(i: EligibleInvoiceDto) {
    const a = await this.alert.create({
      header: 'Request payout',
      message: `${i.invoiceNumber} · you receive R ${i.payoutAmount.toFixed(2)} after commission.`,
      inputs: [{ name: 'notes', type: 'textarea', placeholder: 'Note to the administrator (optional)' }],
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Request payout', handler: d => {
        this.requesting = i.invoiceID;
        this.api.requestPayout(i.invoiceID, d?.notes?.trim() || undefined).subscribe({
          next: () => { this.requesting = 0; void this.say('Payout requested', 'success'); this.tab = 'history'; this.load(); },
          error: e => { this.requesting = 0; void this.say(e?.error?.message || 'Could not request the payout.', 'danger'); }
        });
      } }]
    });
    await a.present();
  }
}
