import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonButtons, IonBackButton, IonSpinner, IonTextarea, ToastController } from '@ionic/angular/standalone';
import { ListingService } from '../../core/services/listing.service';
import { QuotationService } from '../../core/services/quotation.service';
import { ListingDto } from '../../core/models/listing.models';

@Component({
  standalone: true, selector: 'app-request-quote',
  templateUrl: './request-quote.page.html', styleUrls: ['./request-quote.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonButtons, IonBackButton, IonSpinner, IonTextarea]
})
export class RequestQuotePage implements OnInit {
  listing: ListingDto | null = null; loading = true; submitting = false; error = '';
  startDate = ''; endDate = ''; quantity = 1; hireType: 'Dry'|'Wet' = 'Dry';
  fulfillmentMethod: 'Supplier Delivery'|'Contractor Pickup' = 'Supplier Delivery';
  deliveryAddress = ''; specialRequirements = ''; preferredContact: 'Email'|'Phone'|'Both' = 'Email';
  minDate = new Date().toISOString().substring(0, 10);
  private route = inject(ActivatedRoute); private router = inject(Router);
  private listings = inject(ListingService); private quotes = inject(QuotationService); private toast = inject(ToastController);
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('listingId') || this.route.snapshot.queryParamMap.get('listingId'));
    if (!id) { this.error = 'Missing listing'; this.loading = false; return; }
    this.listings.contractorGetById(id).subscribe({
      next: l => { this.listing = l; this.loading = false; if (l.wetHireAvailable && !l.dryHireAvailable) this.hireType = 'Wet'; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load listing'; }
    });
  }
  submit() {
    this.error = '';
    if (!this.listing) return;
    if (!this.startDate || !this.endDate) { this.error = 'Select dates.'; return; }
    if (new Date(this.endDate) <= new Date(this.startDate)) { this.error = 'End must be after start.'; return; }
    this.submitting = true;
    this.quotes.contractorCreate({
      listingID: this.listing.listingID, startDate: this.startDate, endDate: this.endDate,
      quantity: this.quantity, hireType: this.hireType, fulfillmentMethod: this.fulfillmentMethod,
      deliveryAddress: this.deliveryAddress || undefined, specialRequirements: this.specialRequirements || undefined,
      preferredContact: this.preferredContact
    }).subscribe({
      next: async (res) => {
        this.submitting = false;
        const t = await this.toast.create({ message: 'Quote requested', duration: 2000, color: 'success' }); await t.present();
        const id = res?.quotation?.quotationID;
        this.router.navigateByUrl(id ? `/tabs/quotations/${id}` : '/tabs/quotations');
      },
      error: e => { this.submitting = false; this.error = e?.error?.message || 'Request failed.'; }
    });
  }
}
