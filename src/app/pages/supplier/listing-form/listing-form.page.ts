import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonToggle, IonCheckbox, IonIcon, IonFooter, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, closeCircle } from 'ionicons/icons';
import { ListingService } from '../../../core/services/listing.service';
import { CategoryService, CategoryDto } from '../../../core/services/category.service';
import { CreateListingDto, ListingImageDto, UpdateListingDto } from '../../../core/models/listing.models';
import { EmptyStateComponent } from '../../../shared/empty-state.component';

@Component({
  standalone: true,
  selector: 'app-listing-form',
  templateUrl: './listing-form.page.html',
  styleUrls: ['./listing-form.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonToggle, IonCheckbox, IonIcon, IonFooter, IonSpinner, EmptyStateComponent]
})
export class ListingFormPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listings = inject(ListingService);
  private cats = inject(CategoryService);
  private toast = inject(ToastController);
  private alert = inject(AlertController);

  id: number | null = Number(this.route.snapshot.paramMap.get('id')) || null;
  get isEdit() { return this.id !== null; }
  loading = this.isEdit; saving = false; error = ''; loadError = '';
  categories: CategoryDto[] = [];
  readonly maxYear = new Date().getFullYear() + 1;

  listingTitle = ''; categoryID: number | null = null; description = '';
  makeBrand = ''; model = ''; year: number | null = null; operatingWeight = ''; enginePower = ''; location = '';
  pricingMode: 'Fixed' | 'QuoteRequired' = 'Fixed';
  dailyRate: number | null = null; weeklyRate: number | null = null; unitsOwned = 1;
  dry = true; wet = false; wetDaily: number | null = null; wetWeekly: number | null = null;
  pickup = true; delivery = false; deliveryFee: number | null = null;
  agree = false;
  images: ListingImageDto[] = [];
  newFiles: File[] = []; previews: string[] = [];

  constructor() {
    addIcons({ cameraOutline, closeCircle });
    this.cats.getAll().subscribe({ next: c => this.categories = c || [], error: () => {} });
    if (this.id) this.loadListing(this.id);
  }

  private num(v: unknown): number | null { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }

  private loadListing(id: number) {
    this.listings.supplierGetById(id).subscribe({
      next: l => {
        this.listingTitle = l.listingTitle; this.categoryID = l.categoryID; this.description = l.description || '';
        this.makeBrand = l.makeBrand || ''; this.model = l.model || ''; this.year = l.year ?? null;
        this.operatingWeight = l.operatingWeight || ''; this.enginePower = l.enginePower || ''; this.location = l.location || '';
        this.pricingMode = l.pricingMode === 'QuoteRequired' ? 'QuoteRequired' : 'Fixed';
        this.dailyRate = l.dailyRateZAR; this.weeklyRate = l.weeklyRateZAR ?? null; this.unitsOwned = l.unitsOwned || 1;
        this.dry = l.dryHireAvailable; this.wet = l.wetHireAvailable;
        this.wetDaily = l.wetDailyRateZAR ?? null; this.wetWeekly = l.wetWeeklyRateZAR ?? null;
        this.pickup = l.pickupAvailable; this.delivery = l.deliveryAvailable; this.deliveryFee = l.deliveryFeeZAR ?? null;
        this.images = l.images || [];
        this.loading = false;
      },
      error: e => { this.loading = false; this.loadError = e?.error?.message || 'Could not load this listing.'; }
    });
  }

  imgUrl(u: string) { return this.listings.resolveImageUrl(u); }

  onFiles(ev: Event) {
    const picked = Array.from((ev.target as HTMLInputElement).files || []);
    for (const f of picked) {
      if (this.images.length + this.newFiles.length >= 8) break;
      this.newFiles.push(f); this.previews.push(URL.createObjectURL(f));
    }
    (ev.target as HTMLInputElement).value = '';
  }
  removeNew(i: number) { URL.revokeObjectURL(this.previews[i]); this.newFiles.splice(i, 1); this.previews.splice(i, 1); }

  async removeExisting(img: ListingImageDto) {
    if (!this.id) return;
    const a = await this.alert.create({
      header: 'Remove this photo?',
      buttons: [{ text: 'Keep', role: 'cancel' }, { text: 'Remove', role: 'destructive', handler: () => {
        this.listings.deleteImage(this.id!, img.imageID).subscribe({
          next: () => this.images = this.images.filter(i => i.imageID !== img.imageID),
          error: e => void this.say(e?.error?.message || 'Could not remove the photo.', 'danger')
        });
      } }]
    });
    await a.present();
  }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2800, color, position: 'top' });
    await t.present();
  }

  private validate(): string {
    if (this.listingTitle.trim().length < 3) return 'Enter a listing title (at least 3 characters).';
    if (!this.categoryID) return 'Choose a category.';
    if (this.description.trim().length < 10) return 'Add a description (at least 10 characters).';
    if (this.description.trim().length > 2000) return 'The description cannot be longer than 2000 characters.';
    if (this.year !== null && (!Number.isInteger(Number(this.year)) || this.year < 1950 || this.year > this.maxYear)) return `Year must be a whole number between 1950 and ${this.maxYear}.`;
    const MAX = 10_000_000;
    // A money field the user typed into must be a real, non-negative number (empty is fine for the optional ones).
    const bad = (v: unknown, min: number) => { const raw = v === null || v === undefined || v === '' ? null : Number(v); return raw !== null && (isNaN(raw) || raw < min || raw > MAX); };
    const daily = this.num(this.dailyRate);
    if (!daily || daily <= 0) return 'Enter a daily rate greater than zero.';
    if (daily > MAX) return 'The daily rate cannot be more than R 10,000,000.';
    if (bad(this.weeklyRate, 0.01)) return 'The weekly rate must be more than R 0 and at most R 10,000,000.';
    if (this.wet && bad(this.wetWeekly, 0.01)) return 'The wet-hire weekly rate must be more than R 0 and at most R 10,000,000.';
    if (this.wet && bad(this.wetDaily, 0.01)) return 'The wet-hire daily rate must be more than R 0 and at most R 10,000,000.';
    if (this.delivery && bad(this.deliveryFee, 0)) return 'The delivery fee cannot be negative and must be at most R 10,000,000.';
    if (!this.dry && !this.wet) return 'Offer dry hire, wet hire, or both.';
    if (this.wet && !(this.num(this.wetDaily) && this.num(this.wetDaily)! > 0)) return 'Enter the wet-hire daily rate.';
    if (!this.pickup && !this.delivery) return 'Offer pickup, delivery, or both.';
    if (!(Number.isInteger(Number(this.unitsOwned)) && this.unitsOwned >= 1 && this.unitsOwned <= 10000)) return 'Units must be a whole number between 1 and 10,000.';
    if (!this.isEdit && !this.agree) return 'Accept the Master Lease Agreement to list this machine.';
    const totalPhotos = this.images.length + this.newFiles.length;
    if (totalPhotos < 1) return 'Add at least 1 photo (up to 5) before submitting for review.';
    if (totalPhotos > 5) return 'A maximum of 5 photos is allowed per listing.';
    return '';
  }

  async save() {
    this.error = this.validate();
    if (this.error) return;
    this.saving = true;
    const body: UpdateListingDto = {
      listingTitle: this.listingTitle.trim(), categoryID: this.categoryID!, description: this.description.trim(),
      makeBrand: this.makeBrand.trim() || undefined, model: this.model.trim() || undefined, year: this.year ?? undefined,
      operatingWeight: this.operatingWeight.trim() || undefined, enginePower: this.enginePower.trim() || undefined,
      location: this.location.trim() || undefined,
      dailyRateZAR: this.num(this.dailyRate)!, weeklyRateZAR: this.num(this.weeklyRate),
      dryHireAvailable: this.dry, wetHireAvailable: this.wet,
      wetDailyRateZAR: this.wet ? this.num(this.wetDaily) : null, wetWeeklyRateZAR: this.wet ? this.num(this.wetWeekly) : null,
      pickupAvailable: this.pickup, deliveryAvailable: this.delivery,
      deliveryFeeZAR: this.delivery ? this.num(this.deliveryFee) : null,
      pricingMode: this.pricingMode, unitsOwned: this.unitsOwned
    };

    const done = async (listingId: number, message: string) => {
      if (this.newFiles.length) {
        await new Promise<void>(res => this.listings.uploadImages(listingId, this.newFiles).subscribe({
          next: () => res(), error: () => { void this.say('Saved, but some photos failed to upload. Edit the listing to retry.', 'warning'); res(); }
        }));
      }
      this.saving = false;
      void this.say(message, 'success');
      this.router.navigateByUrl('/tabs/listings');
    };
    const fail = (e: any) => { this.saving = false; this.error = e?.error?.message || e?.error?.title || 'Could not save the listing.'; };

    if (this.isEdit) {
      this.listings.supplierUpdate(this.id!, body).subscribe({ next: () => void done(this.id!, 'Listing updated'), error: fail });
    } else {
      const create: CreateListingDto = { ...body, agreeToMasterLeaseAgreement: this.agree };
      this.listings.supplierCreate(create).subscribe({
        next: r => void done(r.listingId, r.status === 'Active' ? 'Listing published' : 'Listing submitted for review'), error: fail
      });
    }
  }
}
