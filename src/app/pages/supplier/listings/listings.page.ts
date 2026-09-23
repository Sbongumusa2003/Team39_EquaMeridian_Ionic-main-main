import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonRefresher, IonRefresherContent, IonIcon, IonFab, IonFabButton,
  AlertController, ToastController, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, pauseCircleOutline, trashOutline, cubeOutline } from 'ionicons/icons';
import { ListingService } from '../../../core/services/listing.service';
import { ListingDto } from '../../../core/models/listing.models';
import { StatusPillComponent } from '../../../shared/status-pill.component';
import { EmptyStateComponent } from '../../../shared/empty-state.component';
import { ZarPipe } from '../../../shared/zar.pipe';
import { HeaderActionsComponent } from '../../../shared/header-actions.component';

interface Row { listing: ListingDto; actions: { canEdit: boolean; canDeactivate: boolean; canDelete: boolean; contactAdmin: boolean }; }

@Component({
  selector: 'app-supplier-listings', standalone: true,
  templateUrl: './listings.page.html', styleUrls: ['./listings.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonRefresher, IonRefresherContent, IonIcon,
    IonFab, IonFabButton, StatusPillComponent, EmptyStateComponent, ZarPipe, HeaderActionsComponent]
})
export class SupplierListingsPage implements ViewWillEnter {
  private api = inject(ListingService);
  private alert = inject(AlertController);
  private toast = inject(ToastController);
  loading = true; error = '';
  rows: Row[] = [];
  filter = 'All';
  readonly filters = ['All', 'Active', 'Pending', 'Draft', 'Rejected', 'Inactive'];

  constructor() { addIcons({ addOutline, createOutline, pauseCircleOutline, trashOutline, cubeOutline }); }
  ionViewWillEnter() { this.load(); }

  get shown() { return this.rows.filter(r => this.filter === 'All' || r.listing.availabilityStatus === this.filter); }
  count(f: string) { return f === 'All' ? this.rows.length : this.rows.filter(r => r.listing.availabilityStatus === f).length; }
  img(l: ListingDto) { const u = l.imageUrls?.[0] || l.images?.[0]?.url; return u ? this.api.resolveImageUrl(u) : ''; }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.supplierGetOwn({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.rows = (r?.listings || []) as Row[]; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load your listings.'; this.loading = false; ev?.target.complete(); }
    });
  }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2400, color, position: 'top' });
    await t.present();
  }

  async deactivate(r: Row) {
    const a = await this.alert.create({
      header: 'Deactivate listing?', message: `"${r.listing.listingTitle}" will stop appearing in search. You can edit and re-list it later.`,
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Deactivate', handler: () => {
        this.api.supplierDeactivate(r.listing.listingID).subscribe({
          next: () => { void this.say('Listing deactivated'); this.load(); },
          error: e => void this.say(e?.error?.message || 'Could not deactivate.', 'danger')
        });
      } }]
    });
    await a.present();
  }

  async remove(r: Row) {
    const a = await this.alert.create({
      header: 'Delete listing?', message: `Permanently delete "${r.listing.listingTitle}"? This can't be undone.`,
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Delete', role: 'destructive', handler: () => {
        this.api.supplierDelete(r.listing.listingID).subscribe({
          next: () => { void this.say('Listing deleted'); this.load(); },
          error: e => void this.say(e?.error?.message || 'This listing has bookings and can\'t be deleted.', 'danger')
        });
      } }]
    });
    await a.present();
  }
}
