import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ListingService } from '../../core/services/listing.service';
import { AuthService } from '../../core/services/auth.service';
import { ListingDto } from '../../core/models/listing.models';
import { ZarPipe } from '../../shared/zar.pipe';

@Component({
  standalone: true, selector: 'app-compare',
  templateUrl: './compare.page.html', styleUrls: ['./compare.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, ZarPipe]
})
export class ComparePage implements OnInit {
  listings: ListingDto[] = [];
  loading = false; error = '';
  specs = [
    { key: 'dailyRateZAR', label: 'Daily rate (ZAR)' },
    { key: 'operatingWeight', label: 'Operating weight' },
    { key: 'enginePower', label: 'Engine power' },
    { key: 'location', label: 'Location' },
    { key: 'year', label: 'Year' },
    { key: 'makeBrand', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'unitsAvailable', label: 'Units available' },
    { key: 'pricingMode', label: 'Pricing mode' },
  ];
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingsApi = inject(ListingService);
  public auth = inject(AuthService);

  ngOnInit() {
    const ids = (this.route.snapshot.queryParamMap.get('ids') || '')
      .split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n) && n > 0);
    if (ids.length < 2) {
      this.error = 'Select at least 2 listings on Browse to compare.';
      return;
    }
    this.loading = true;
    forkJoin(ids.slice(0, 4).map(id => this.listingsApi.contractorGetById(id))).subscribe({
      next: (res) => { this.listings = res; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Could not load listings for comparison.'; }
    });
  }

  get lowestId(): number | null {
    if (this.listings.length < 2) return null;
    return this.listings.reduce((a, b) => (b.dailyRateZAR < a.dailyRateZAR ? b : a)).listingID;
  }
  img(l: ListingDto): string {
    const raw = l.imageUrls?.[0] || l.images?.[0]?.url || '';
    return raw ? this.listingsApi.resolveImageUrl(raw) : '';
  }
  val(l: ListingDto, key: string): string {
    const v = (l as any)[key];
    return v == null || v === '' ? '—' : String(v);
  }

  book(l: ListingDto) {
    const path = l.pricingMode === 'QuoteRequired'
      ? `/tabs/request-quote/${l.listingID}`
      : `/tabs/book-now/${l.listingID}`;
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: path } });
      return;
    }
    this.router.navigateByUrl(path);
  }
}
