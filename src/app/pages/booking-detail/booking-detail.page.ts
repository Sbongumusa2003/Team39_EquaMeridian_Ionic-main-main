import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonIcon, IonInput,
  IonTextarea, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, AlertController, ToastController,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  documentTextOutline, receiptOutline, downloadOutline, calendarOutline, star, starOutline, flashOutline,
  locationOutline, personOutline, businessOutline, alertCircleOutline, cameraOutline, closeOutline
} from 'ionicons/icons';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { LeaseAgreementService } from '../../core/services/lease-agreement.service';
import { FileDownloadService } from '../../core/services/file-download.service';
import { BookingListItemDto, BookingTrackingDto, DeliveryDetailDto } from '../../core/models/booking.models';
import { PaymentStatusDto } from '../../core/models/payment.models';
import { InvoiceListItemDto } from '../../core/models/invoice.models';
import { LeaseAgreementListItemDto } from '../../core/models/lease-agreement.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

type Panel = 'delivery' | 'address' | 'return' | 'confirmReturn' | 'review' | null;
// Matches the API: a booking can only be cancelled before the supplier marks it ready / out for delivery.
const CANCELLABLE = ['Awaiting Lease Signature', 'Awaiting Payment', 'Awaiting Delivery'];

@Component({
  standalone: true,
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
  imports: [
    DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton,
    IonIcon, IonInput, IonTextarea, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent,
    StatusPillComponent, EmptyStateComponent, ZarPipe
  ]
})
export class BookingDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookings = inject(BookingService);
  private reviews = inject(ReviewService);
  private payments = inject(PaymentService);
  private payFlow = inject(PaymentFlowService);
  private invoices = inject(InvoiceService);
  private leases = inject(LeaseAgreementService);
  private files = inject(FileDownloadService);
  private toast = inject(ToastController);
  private alert = inject(AlertController);
  auth = inject(AuthService);

  bookingId = Number(this.route.snapshot.paramMap.get('id'));
  loading = true;
  acting = false;
  error = '';
  detail: DeliveryDetailDto | null = null;
  tracking: BookingTrackingDto | null = null;
  flags: BookingListItemDto | null = (history.state?.booking as BookingListItemDto) || null;
  payment: PaymentStatusDto | null = null;
  lease: LeaseAgreementListItemDto | null = null;
  invoice: InvoiceListItemDto | null = null;
  panel: Panel = null;

  // forms
  deliveryOutcome = 'Accepted'; deliveryNotes = '';
  newAddress = '';
  // Same options as the Angular web app (the API validates the reason).
  readonly returnReasons = ['Lease period ending', 'Early return', 'Equipment fault'];
  readonly pickupWindows = ['8am - 10am', '10am - 12pm', '12pm - 2pm', '2pm - 4pm', '4pm - 6pm'];
  returnReason = ''; preferredPickupDate = ''; pickupTimeWindow = ''; pickupLocation = ''; returnNotes = '';
  returnCondition = 'Good'; inspectionNotes = ''; damageDescription = ''; estimatedRepairCost: number | null = null;
  returnPhotos: File[] = [];
  reviewRating = 5; reviewTitle = ''; reviewText = '';
  readonly minDate = new Date().toISOString().substring(0, 10);

  constructor() {
    addIcons({
      documentTextOutline, receiptOutline, downloadOutline, calendarOutline, star, starOutline, flashOutline,
      locationOutline, personOutline, businessOutline, alertCircleOutline, cameraOutline, closeOutline
    });
  }

  ionViewWillEnter() { this.load(); }

  // ───────── derived state ─────────
  get isContractor() { return this.auth.role === 'contractor'; }
  get isSupplier() { return this.auth.role === 'supplier'; }

  /** Mirrors the API's display-status rules so the page still works when opened without list state. */
  get status(): string {
    if (this.detail?.displayStatus) return this.detail.displayStatus;   // fresh from the API
    if (this.flags?.status) return this.flags.status;
    const raw = this.detail?.bookingStatus || '';
    if (raw === 'AwaitingSignature') return 'Awaiting Lease Signature';
    if (raw === 'AwaitingPayment') return 'Awaiting Payment';
    if (['Cancelled', 'Completed', 'Return Requested', 'Ready For Return Pickup', 'Ready For Pickup'].includes(raw)) {
      if (raw === 'Ready For Pickup' && this.detail?.deliveryStatus === 'Delivered') return 'In Progress';
      return raw;
    }
    return this.detail?.deliveryStatus === 'Delivered' ? 'In Progress' : 'Awaiting Delivery';
  }
  /** Delivery status shown to the user: pick-up → Collected; supplier delivery → Delivered To You. */
  get deliveryStatusLabel(): string {
    const s = this.detail?.deliveryStatus || '';
    if (!s) return '—';
    if (s === 'Delivered') return this.isPickup ? 'Collected' : 'Delivered To You';
    return s;
  }
  /** Aligns with API IsPickupFulfillment: method, fulfillment label, or address containing pickup/collect. */
  get isPickup(): boolean {
    const raw = `${this.detail?.fulfillmentMethod || ''} ${this.detail?.deliveryMethod || ''} ${this.detail?.deliveryAddress || ''}`.toLowerCase();
    return /pickup|pick-up|collect|contractor pickup/.test(raw);
  }

  /**
   * Pickup path: only after supplier marks Ready For Pickup.
   * Supplier delivery: allowed from Confirmed (Awaiting Delivery) or Ready For Pickup.
   * Prefer API list flags when loaded; otherwise apply the same rules locally.
   */
  get canConfirmDelivery() {
    if (this.flags) return this.flags.canConfirmDelivery;
    if (!this.isContractor) return false;
    if (this.status === 'Ready For Pickup') return true;
    if (this.status === 'Awaiting Delivery') return !this.isPickup;
    return false;
  }
  get canUpdateAddress() { return this.flags ? this.flags.canUpdateAddress : this.isContractor && ['Awaiting Delivery', 'Ready For Pickup'].includes(this.status) && !this.isPickup; }
  /** Return requests are for delivery bookings only; on pick-up the contractor brings the machine back themselves. */
  get canRequestReturn() { return (this.flags ? this.flags.canRequestReturn : this.isContractor && this.status === 'In Progress') && !this.isPickup; }
  /** Pick-up booking, machine collected: nothing to request, the supplier confirms the return. */
  get pickupInProgress() { return this.isPickup && this.status === 'In Progress'; }
  /** Supplier: show Mark Ready when booking is Confirmed (display Awaiting Delivery), all fulfillment methods. */
  get canMarkReady() { return this.flags ? !!this.flags.canMarkReadyForPickup : this.isSupplier && this.status === 'Awaiting Delivery'; }
  get canMarkReturnReady() { return this.flags ? !!this.flags.canMarkReadyForReturnPickup : this.isSupplier && this.status === 'Return Requested'; }
  get canConfirmReturn() {
    const viaRequest = this.flags ? this.flags.canConfirmReturn : this.isSupplier && ['Return Requested', 'Ready For Return Pickup'].includes(this.status);
    return viaRequest || (this.isSupplier && this.pickupInProgress);
  }
  get canLeaveReview() { return !!this.flags?.canLeaveReview; }
  get canRaiseDispute() { return this.flags ? this.flags.canRaiseDispute : !!this.detail?.canRaiseDispute; }
  get canCancel() { return CANCELLABLE.includes(this.status); }

  /** The single most important thing the signed-in user should do next. */
  get headline(): { title: string; body: string; cta?: string; go?: () => void } | null {
    const s = this.status;
    if (s === 'Awaiting Lease Signature') {
      // The SUPPLIER signs first, then the CONTRACTOR (the API tells us whose turn it is).
      const ls = this.detail?.leaseStatus;
      const myTurn = this.isContractor ? ls === 'Pending_Contractor' : ls === 'Pending_Supplier';
      if (myTurn) return { title: 'Sign the lease agreement', body: this.isContractor ? 'Review and sign the lease so the booking can move on to payment.' : 'You sign first; then the contractor signs and pays.', cta: 'Sign lease', go: () => this.openLease() };
      return { title: this.isContractor ? 'Waiting for the supplier to sign the lease' : 'Waiting for the contractor to sign the lease', body: 'No action needed from you right now.' };
    }
    const eft = !!this.invoice && /eftsubmitted/i.test(this.invoice.paymentStatus);
    if (this.isSupplier && s === 'Awaiting Payment' && eft) return { title: 'Confirm the EFT payment', body: 'The contractor uploaded proof of payment. Check your bank account, then confirm receipt.', cta: 'Review & confirm', go: () => this.openInvoice() };
    if (this.isContractor && s === 'Awaiting Payment' && eft) return { title: 'EFT proof submitted', body: 'Waiting for the supplier to confirm the funds. You will be notified.' };
    if (this.isContractor && s === 'Awaiting Payment') return { title: 'Pay your invoice', body: 'Your booking is confirmed as soon as payment is received.', cta: 'Pay now', go: () => this.pay() };
    if (this.canMarkReady) return { title: this.isPickup ? 'Prepare the machine for collection' : 'Send the machine out for delivery', body: 'Mark the machine ready when it is prepared for pickup or delivery.', cta: this.isPickup ? 'Mark ready for collection' : 'Mark ready for delivery', go: () => this.markReady() };
    // Contractor pickup while still Confirmed: cannot confirm until supplier marks Ready.
    if (this.isContractor && this.isPickup && s === 'Awaiting Delivery') {
      return { title: 'Waiting for the supplier to get the machine ready', body: 'The supplier must mark this booking as Ready for Pickup before you can confirm collection.' };
    }
    // Supplier delivery from Confirmed: optional Ready step; contractor may confirm now.
    if (this.canConfirmDelivery && s === 'Awaiting Delivery') {
      return { title: 'Waiting for the supplier to deliver the machine', body: 'Nothing to do yet. If the machine has already arrived, you can confirm it.', cta: 'Confirm receipt', go: () => this.togglePanel('delivery') };
    }
    if (this.canConfirmDelivery) return { title: this.isPickup ? 'Collected the machine?' : 'Has the machine arrived?', body: 'Confirm the condition so the hire period can start.', cta: 'Confirm receipt', go: () => this.togglePanel('delivery') };
    if (this.canMarkReturnReady) return { title: 'Return requested', body: 'Arrange collection of the machine, then let the contractor know.', cta: 'Mark collection arranged', go: () => this.markReturnReady() };
    if (this.canConfirmReturn) return this.pickupInProgress
      ? { title: 'Machine back at your site?', body: 'The contractor returns pick-up hires themselves. Once it is back, inspect it and record its condition to close out the hire.', cta: 'Confirm return', go: () => this.togglePanel('confirmReturn') }
      : { title: 'Inspect the returned machine', body: 'Record its condition to close out the hire.', cta: 'Confirm return', go: () => this.togglePanel('confirmReturn') };
    if (this.isContractor && this.pickupInProgress) return { title: 'Return the machine to the supplier', body: 'Bring it back to the supplier\'s site (the address it was collected from, or wherever the supplier instructs). The supplier will confirm the return.' };
    if (this.canLeaveReview) return { title: 'How was the hire?', body: 'Your review helps other contractors choose.', cta: 'Leave a review', go: () => this.togglePanel('review') };
    if (this.isSupplier && s === 'Awaiting Payment') return { title: 'Waiting for payment', body: 'No action needed from you yet.' };
    // Any other waiting state: say the same thing the bookings list says (the API decides the wording).
    if (this.flags?.nextAction && !this.flags.needsAction) return { title: this.flags.nextAction, body: 'No action needed from you right now.' };
    return null;
  }

  // ───────── loading ─────────
  load(ev?: RefresherCustomEvent) {
    if (!this.detail) this.loading = true;
    this.error = '';
    this.bookings.getDeliveryDetail(this.bookingId).subscribe({
      next: d => { this.detail = d; if (!this.newAddress) this.newAddress = d.deliveryAddress || ''; this.loading = false; ev?.target.complete(); this.loadRelated(d); },
      error: e => { this.loading = false; ev?.target.complete(); this.error = e?.error?.message || 'Could not load this booking.'; }
    });
    this.bookings.getTracking(this.bookingId).subscribe({ next: t => this.tracking = t, error: () => {} });
    // Authoritative action flags (also works when the page is opened from a notification / after refresh).
    this.bookings.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => { const f = (r.bookings || []).find(b => b.bookingID === this.bookingId); if (f) this.flags = f; },
      error: () => {}
    });
  }

  private sameDay(a: string, b: string) { return (a || '').substring(0, 10) === (b || '').substring(0, 10); }

  private loadRelated(d: DeliveryDetailDto) {
    this.leases.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => {
        const list = r.agreements || [];
        // Exact match on the booking first; the title/date match is only a fallback for older API builds.
        this.lease = list.find(l => l.bookingID === d.bookingID)
          || list.find(l => l.listingTitle === d.machinery && this.sameDay(l.rentalStartDate, d.rentalStartDate) && this.sameDay(l.rentalEndDate, d.rentalEndDate))
          || (list.some(l => l.bookingID != null) ? null : list.find(l => l.listingTitle === d.machinery)) || null;
      }, error: () => {}
    });
    this.invoices.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: r => {
        const all = r.invoices || [];
        // Exact match on the booking; fall back to the machine title only when the API does not send booking ids.
        const list = (all.some(i => i.bookingID != null)
          ? all.filter(i => i.bookingID === d.bookingID)
          : all.filter(i => i.listingTitle === d.machinery))
          .sort((a, b) => +new Date(b.invoiceDate) - +new Date(a.invoiceDate));
        this.invoice = list.find(i => !/paid/i.test(i.paymentStatus)) || list[0] || null;
      }, error: () => {}
    });
    if (this.isContractor) this.payments.getStatus(this.bookingId).subscribe({ next: p => this.payment = p, error: () => this.payment = null });
  }

  // ───────── helpers ─────────
  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }
  private fail = (e: any) => { this.acting = false; void this.say(e?.error?.message || 'Something went wrong. Please try again.', 'danger'); };
  private ok(message: string) { this.acting = false; this.panel = null; void this.say(message, 'success'); this.load(); }

  togglePanel(p: Panel) { this.panel = this.panel === p ? null : p; this.error = ''; }

  // ───────── navigation & documents ─────────
  openLease() { this.router.navigate(this.lease ? ['/tabs/lease-agreements', this.lease.leaseAgreementID] : ['/tabs/lease-agreements']); }
  openInvoice() { this.router.navigate(this.invoice ? ['/tabs/invoices', this.invoice.invoiceID] : ['/tabs/invoices']); }
  pay() { if (this.invoice) void this.payFlow.start(this.invoice.invoiceID); else this.router.navigate(['/tabs/invoices']); }
  goDispute() { this.router.navigate(['/tabs/raise-dispute', this.bookingId]); }

  downloadInvoice() {
    if (!this.invoice) return;
    this.invoices.downloadPdf(this.invoice.invoiceID).subscribe({
      next: b => this.files.save(b, `${this.invoice!.invoiceNumber}.pdf`),
      error: () => void this.say('Could not download the invoice.', 'danger')
    });
  }
  addToCalendar() {
    this.bookings.downloadCalendar(this.bookingId).subscribe({
      next: b => this.files.save(b, `booking-${this.bookingId}.ics`),
      error: () => void this.say('Could not create the calendar file.', 'danger')
    });
  }

  // ───────── supplier one-tap actions ─────────
  async markReady() {
    const a = await this.alert.create({
      header: this.isPickup ? 'Ready for collection?' : 'Ready for delivery?',
      message: 'The contractor will be notified straight away.',
      buttons: [{ text: 'Not yet', role: 'cancel' }, { text: 'Yes, notify', handler: () => {
        this.acting = true;
        this.bookings.markReadyForPickup(this.bookingId).subscribe({ next: r => this.ok(r?.message || 'Contractor notified'), error: this.fail });
      } }]
    });
    await a.present();
  }
  async markReturnReady() {
    const a = await this.alert.create({
      header: 'Collection arranged?', message: 'The contractor will be told that pickup is arranged.',
      buttons: [{ text: 'Not yet', role: 'cancel' }, { text: 'Yes, notify', handler: () => {
        this.acting = true;
        this.bookings.markReadyForReturnPickup(this.bookingId).subscribe({ next: r => this.ok(r?.message || 'Contractor notified'), error: this.fail });
      } }]
    });
    await a.present();
  }

  // ───────── forms ─────────
  confirmDelivery() {
    this.acting = true;
    this.bookings.confirmDelivery(this.bookingId, { outcome: this.deliveryOutcome, notes: this.deliveryNotes || undefined })
      .subscribe({ next: () => this.ok('Receipt confirmed'), error: this.fail });
  }
  saveAddress() {
    if (this.newAddress.trim().length < 5) { this.error = 'Enter the full address (at least 5 characters).'; return; }
    this.acting = true;
    this.bookings.updateDeliveryAddress(this.bookingId, { deliveryAddress: this.newAddress.trim() })
      .subscribe({ next: () => this.ok('Delivery address updated'), error: this.fail });
  }
  submitReturnRequest() {
    if (!this.returnReason || !this.preferredPickupDate || !this.pickupTimeWindow || !this.pickupLocation.trim()) { this.error = 'Reason, preferred date, time window and pickup location are required.'; return; }
    this.acting = true;
    this.bookings.requestReturn(this.bookingId, {
      returnReason: this.returnReason.trim(), preferredPickupDate: this.preferredPickupDate,
      pickupTimeWindow: this.pickupTimeWindow, pickupLocation: this.pickupLocation.trim(), notes: this.returnNotes || undefined
    }).subscribe({ next: r => this.ok(r?.message || 'Return requested'), error: this.fail });
  }
  onPhotos(ev: Event) { this.returnPhotos = Array.from((ev.target as HTMLInputElement).files || []).slice(0, 6); }
  removePhoto(i: number) { this.returnPhotos = this.returnPhotos.filter((_, idx) => idx !== i); }
  submitConfirmReturn() {
    if (!this.inspectionNotes.trim()) { this.error = 'Add your inspection notes.'; return; }
    if (this.estimatedRepairCost != null && (isNaN(Number(this.estimatedRepairCost)) || Number(this.estimatedRepairCost) < 0)) { this.error = 'The estimated repair cost cannot be negative.'; return; }
    if (this.returnCondition === 'Damaged') {
      if (!this.damageDescription.trim()) { this.error = 'Describe the damage.'; return; }
      if (!(this.estimatedRepairCost && this.estimatedRepairCost > 0)) { this.error = 'Enter the estimated repair cost.'; return; }
      if (!this.returnPhotos.length) { this.error = 'Add at least one photo of the damage.'; return; }
    }
    this.acting = true;
    this.bookings.confirmReturn(this.bookingId, {
      condition: this.returnCondition, inspectionNotes: this.inspectionNotes.trim(),
      damageDescription: this.damageDescription.trim() || undefined, estimatedRepairCost: this.estimatedRepairCost ?? undefined
    }, this.returnPhotos).subscribe({ next: r => this.ok(r?.message || 'Return confirmed'), error: this.fail });
  }
  submitReview() {
    if (!this.reviewTitle.trim() || !this.reviewText.trim()) { this.error = 'Add a title and a short review.'; return; }
    this.acting = true;
    this.reviews.create({
      bookingID: this.bookingId, overallRating: this.reviewRating, title: this.reviewTitle.trim(),
      reviewText: this.reviewText.trim(), confirmedGenuine: true
    }).subscribe({
      next: () => { if (this.flags) this.flags = { ...this.flags, canLeaveReview: false }; this.ok('Thanks for your review'); },
      error: this.fail
    });
  }

  async cancelBooking() {
    const a = await this.alert.create({
      header: 'Cancel this booking?',
      message: 'A cancellation fee may apply under the lease agreement.',
      inputs: [{ name: 'reason', type: 'textarea', placeholder: 'Reason for cancelling' }],
      buttons: [
        { text: 'Keep booking', role: 'cancel' },
        { text: 'Cancel booking', role: 'destructive', handler: d => {
          if (!d?.reason?.trim()) return false;
          this.acting = true;
          this.bookings.cancel(this.bookingId, { reason: d.reason.trim() }).subscribe({ next: r => this.ok(r?.message || 'Booking cancelled'), error: this.fail });
          return true;
        } }
      ]
    });
    await a.present();
  }
}
