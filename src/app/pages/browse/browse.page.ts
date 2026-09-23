import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSearchbar, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent, IonButton, IonIcon,
  RefresherCustomEvent, InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, closeOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ListingService } from '../../core/services/listing.service';
import { CategoryService, CategoryDto } from '../../core/services/category.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { WishlistActionsService } from '../../core/services/wishlist-actions.service';
import { ListingDto } from '../../core/models/listing.models';
import { ProductCardComponent } from '../../shared/product-card.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { HeaderActionsComponent } from '../../shared/header-actions.component';

@Component({
  standalone: true,
  selector: 'app-browse',
  templateUrl: './browse.page.html',
  styleUrls: ['./browse.page.scss'],
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSearchbar, IonRefresher, IonRefresherContent,
    IonInfiniteScroll, IonInfiniteScrollContent, IonButton, IonIcon,
    ProductCardComponent, EmptyStateComponent, HeaderActionsComponent
  ]
})
export class BrowsePage implements OnInit, OnDestroy {
  @ViewChild('searchbar') searchbar?: IonSearchbar;

  private listingService = inject(ListingService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private wishActions = inject(WishlistActionsService);
  wishlist = inject(WishlistService);

  listings: ListingDto[] = [];
  categories: CategoryDto[] = [];
  search = '';
  categoryId: number | null = null;
  page = 1;
  readonly pageSize = 12;
  totalCount = 0;
  loading = true;
  error = '';
  compareMode = false;
  compareIds = new Set<number>();
  private sub?: Subscription;
  private reqSeq = 0;

  constructor() { addIcons({ swapHorizontalOutline, closeOutline }); }

  ngOnInit() {
    this.categoryService.getAll().subscribe({ next: c => this.categories = c || [], error: () => {} });
    // Home chips / search pill deep-link here with ?category= / ?focus=
    this.sub = this.route.queryParamMap.subscribe(p => {
      const cat = p.get('category');
      this.categoryId = cat ? Number(cat) : null;
      this.load(true);
      if (p.get('focus')) setTimeout(() => this.searchbar?.setFocus(), 350);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  private fetch(page: number) {
    return this.listingService.browseMachinery({
      page, pageSize: this.pageSize,
      search: this.search.trim() || undefined,
      category: this.categoryId ?? undefined
    });
  }

  load(reset = true) {
    const seq = ++this.reqSeq;
    if (reset) { this.page = 1; this.loading = true; this.error = ''; }
    this.fetch(1).subscribe({
      next: r => {
        if (seq !== this.reqSeq) return;      // a newer search superseded this one
        this.listings = r.listings || [];
        this.totalCount = r.totalCount ?? this.listings.length;
        this.loading = false;
      },
      error: e => {
        if (seq !== this.reqSeq) return;
        this.error = e?.error?.message || 'Could not load machinery. Check your connection.';
        this.loading = false;
      }
    });
  }

  selectCategory(id: number | null) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { category: id }, queryParamsHandling: 'merge' });
  }

  onSearch() { this.load(true); }

  refresh(ev: RefresherCustomEvent) {
    this.fetch(1).subscribe({
      next: r => { this.listings = r.listings || []; this.totalCount = r.totalCount ?? this.listings.length; this.page = 1; ev.target.complete(); },
      error: () => ev.target.complete()
    });
  }

  loadMore(ev: InfiniteScrollCustomEvent) {
    if (this.listings.length >= this.totalCount) { ev.target.complete(); return; }
    this.fetch(this.page + 1).subscribe({
      next: r => {
        this.page++;
        this.listings = [...this.listings, ...(r.listings || [])];
        this.totalCount = r.totalCount ?? this.totalCount;
        ev.target.complete();
      },
      error: () => ev.target.complete()
    });
  }

  toggleWish(id: number) { this.wishActions.toggle(id); }

  toggleCompareMode() { this.compareMode = !this.compareMode; if (!this.compareMode) this.compareIds.clear(); }

  toggleCompare(id: number) {
    if (this.compareIds.has(id)) this.compareIds.delete(id);
    else if (this.compareIds.size < 4) this.compareIds.add(id);
  }

  goCompare() {
    if (this.compareIds.size < 2) return;
    this.router.navigate(['/tabs/compare'], { queryParams: { ids: Array.from(this.compareIds).join(',') } });
  }

  clearFilters() { this.search = ''; this.selectCategory(null); }
}
