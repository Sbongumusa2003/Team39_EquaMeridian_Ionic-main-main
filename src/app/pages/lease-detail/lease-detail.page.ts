import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonCheckbox, IonInput, IonIcon,
  IonSpinner, ToastController, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, ellipseOutline, chevronDownOutline } from 'ionicons/icons';
import { LeaseAgreementService } from '../../core/services/lease-agreement.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaseAgreementDetailDto } from '../../core/models/lease-agreement.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

@Component({
  standalone: true,
  selector: 'app-lease-detail',
  templateUrl: './lease-detail.page.html',
  styleUrls: ['./lease-detail.page.scss'],
  imports: [DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton,
    IonCheckbox, IonInput, IonIcon, IonSpinner, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class LeaseDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(LeaseAgreementService);
  private invoices = inject(InvoiceService);
  private toast = inject(ToastController);
  auth = inject(AuthService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  loading = true; error = '';
  a: LeaseAgreementDetailDto | null = null;
  signing = false; agree = false; agreeBinding = false; fullName = '';
  justSigned = false;

  constructor() { addIcons({ checkmarkCircle, ellipseOutline, chevronDownOutline }); }
  ionViewWillEnter() { this.load(); }

  load() {
    if (!this.a) this.loading = true;
    this.api.getById(this.id).subscribe({
      next: a => { this.a = a; this.loading = false; if (!this.fullName) this.fullName = this.auth.fullName; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this agreement.'; }
    });
  }

  get terms(): { title: string; body?: string }[] {
    const a = this.a; if (!a) return [];
    return [
      { title: 'Standard terms', body: a.standardTerms },
      { title: 'Special conditions', body: a.specialConditions },
      { title: 'Cancellation policy', body: a.cancellationPolicy },
      { title: 'Liability & insurance', body: a.liabilityAndInsuranceTerms },
      { title: 'Damage & maintenance', body: a.damageAndMaintenanceProvisions },
    ].filter(t => !!t.body);
  }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }

  sign() {
    if (!this.a) return;
    if (!this.agree || !this.agreeBinding || this.fullName.trim().length < 2) { void this.say('Tick both boxes and type your full name.', 'warning'); return; }
    this.signing = true;
    this.api.sign(this.id, {
      acknowledgeTermsRead: this.agree, acknowledgeLegallyBinding: this.agreeBinding,
      fullName: this.fullName.trim(), signingDate: new Date().toISOString().substring(0, 10)
    }).subscribe({
      next: r => { this.signing = false; this.a = r.agreement || this.a; this.justSigned = true; void this.say(r.message || 'Agreement signed', 'success'); },
      error: e => { this.signing = false; void this.say(e?.error?.message || 'Could not sign the agreement.', 'danger'); }
    });
  }

  /** After signing, jump straight to the unpaid invoice for this hire. */
  continueToPayment() {
    const title = this.a?.listingTitle;
    this.invoices.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => {
        const match = (r.invoices || []).filter(i => i.listingTitle === title && !/paid/i.test(i.paymentStatus))
          .sort((x, y) => +new Date(y.invoiceDate) - +new Date(x.invoiceDate))[0];
        this.router.navigate(match ? ['/tabs/invoices', match.invoiceID] : ['/tabs/invoices']);
      },
      error: () => this.router.navigate(['/tabs/invoices'])
    });
  }
}
