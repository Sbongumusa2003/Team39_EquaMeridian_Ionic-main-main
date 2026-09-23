import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon, ViewWillEnter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline } from 'ionicons/icons';
import { DisputeService } from '../../core/services/dispute.service';
import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { DisputeDetailDto } from '../../core/models/dispute.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ZarPipe } from '../../shared/zar.pipe';

@Component({
  selector: 'app-dispute-detail', standalone: true,
  templateUrl: './dispute-detail.page.html', styleUrls: ['./dispute-detail.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon, StatusPillComponent, EmptyStateComponent, ZarPipe]
})
export class DisputeDetailPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private api = inject(DisputeService);
  private files = inject(ListingService);
  auth = inject(AuthService);
  id = Number(this.route.snapshot.paramMap.get('id'));
  loading = true; error = '';
  d: DisputeDetailDto | null = null;
  constructor() { addIcons({ imageOutline }); }
  ionViewWillEnter() { this.load(); }
  load() {
    if (!this.d) this.loading = true;
    this.api.getMineById(this.id).subscribe({
      next: d => { this.d = d; this.loading = false; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this dispute.'; }
    });
  }
  url(u: string) { return this.files.resolveImageUrl(u); }
  get resolved() { return !!this.d?.resolutionType || /resolved|closed/i.test(this.d?.status || ''); }
}
