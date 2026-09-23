import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, locationOutline, constructOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { ListingDto } from '../core/models/listing.models';
import { ListingService } from '../core/services/listing.service';
import { ZarPipe } from './zar.pipe';

/** Store-style product tile used by Home, Browse, Wishlist and Storefront. */
@Component({
  standalone: true,
  selector: 'app-product-card',
  imports: [RouterLink, IonIcon, ZarPipe],
  template: `
  <a class="pc" [routerLink]="['/tabs/browse', listing.listingID]">
    <div class="img">
      @if (src && !broken) {
        <img [src]="src" alt="" loading="lazy" (error)="broken = true" />
      } @else {
        <div class="ph"><ion-icon name="construct-outline"></ion-icon></div>
      }
      @if (tag) { <span class="tag" [class.bad]="soldOut">{{ tag }}</span> }
      @if (showWish) {
        <button type="button" class="heart" [class.on]="wished" (click)="onWish($event)" aria-label="Save to wishlist">
          <ion-icon [name]="wished ? 'heart' : 'heart-outline'"></ion-icon>
        </button>
      }
    </div>
    <div class="body">
      @if (listing.makeBrand) { <div class="brand">{{ listing.makeBrand }}{{ listing.model ? ' · ' + listing.model : '' }}</div> }
      <h3>{{ listing.listingTitle }}</h3>
      @if (listing.location) {
        <div class="loc"><ion-icon name="location-outline"></ion-icon>{{ listing.location }}</div>
      }
      <div class="price-row">
        <span class="price">{{ listing.dailyRateZAR | zar:0 }}<small>/day</small></span>
      </div>
      <div class="sup">{{ listing.supplierName }}</div>
      @if (showCompare) {
        <button type="button" class="cmp" [class.on]="compared" (click)="onCompare($event)">
          <ion-icon [name]="compared ? 'checkmark-circle' : 'ellipse-outline'"></ion-icon> Compare
        </button>
      }
    </div>
  </a>`,
  styles: [`
    :host { display:block; min-width:0; }
    .pc { display:block; background:#fff; border:1px solid var(--eq-line); border-radius:16px; overflow:hidden; text-decoration:none; color:inherit; height:100%; }
    .img { position:relative; aspect-ratio: 4 / 3; background:#efece5; }
    .img img { width:100%; height:100%; object-fit:cover; display:block; }
    .ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:34px; color:#b9b2a2; }
    .tag { position:absolute; left:8px; top:8px; background:rgba(10,10,10,.86); color:#fff; font-size:.66rem; font-weight:700; padding:3px 8px; border-radius:999px; }
    .tag.bad { background:var(--eq-bad); }
    .heart { position:absolute; right:8px; top:8px; width:32px; height:32px; border-radius:50%; border:0; background:rgba(255,255,255,.94);
             display:flex; align-items:center; justify-content:center; font-size:18px; color:#444; box-shadow:0 2px 8px rgba(0,0,0,.15); cursor:pointer; }
    .heart.on { color:#d9342b; }
    .body { padding:10px 12px 12px; }
    .brand { font-size:.68rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--eq-gold-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    h3 { margin:2px 0 4px; font-size:.9rem; font-weight:700; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2.5em; }
    .loc { font-size:.74rem; color:var(--eq-muted); display:flex; align-items:center; gap:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .price-row { margin-top:6px; font-size:1rem; }
    .sup { font-size:.72rem; color:var(--eq-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cmp { margin-top:8px; width:100%; border:1px solid var(--eq-line); background:#fff; border-radius:10px; padding:6px; font-weight:600; font-size:.74rem; font-family:inherit;
           color:var(--eq-ink-2); display:flex; align-items:center; justify-content:center; gap:5px; cursor:pointer; }
    .cmp.on { background:var(--eq-ink); color:#fff; border-color:var(--eq-ink); }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) listing!: ListingDto;
  @Input() wished = false;
  @Input() showWish = true;
  @Input() showCompare = false;
  @Input() compared = false;
  @Output() wishToggle = new EventEmitter<number>();
  @Output() compareToggle = new EventEmitter<number>();
  broken = false;
  private svc = inject(ListingService);

  constructor() { addIcons({ heart, heartOutline, locationOutline, constructOutline, checkmarkCircle, ellipseOutline }); }

  get src(): string {
    const l = this.listing as any;
    const raw = l.imageUrls?.[0] || l.images?.[0]?.url || l.primaryImageUrl || l.imageUrl || '';
    return raw ? this.svc.resolveImageUrl(raw) : '';
  }
  get soldOut(): boolean { return this.listing.pricingMode !== 'QuoteRequired' && this.listing.unitsAvailable === 0; }
  get tag(): string {
    if (this.soldOut) return 'Fully booked';
    if (this.listing.pricingMode === 'QuoteRequired') return 'Quote only';
    return '';
  }
  onWish(ev: Event) { ev.preventDefault(); ev.stopPropagation(); this.wishToggle.emit(this.listing.listingID); }
  onCompare(ev: Event) { ev.preventDefault(); ev.stopPropagation(); this.compareToggle.emit(this.listing.listingID); }
}
