import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { DisputeService } from '../../core/services/dispute.service';
import { AuthService } from '../../core/services/auth.service';
import { DisputeListItemDto } from '../../core/models/dispute.models';
import { StatusPillComponent } from '../../shared/status-pill.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-disputes', standalone: true,
  templateUrl: './disputes.page.html', styleUrls: ['./disputes.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, StatusPillComponent, EmptyStateComponent]
})
export class DisputesPage implements ViewWillEnter {
  private api = inject(DisputeService);
  auth = inject(AuthService);
  loading = true; error = '';
  items: DisputeListItemDto[] = [];
  ionViewWillEnter() { this.load(); }
  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getMine({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.items = r.disputes || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load disputes.'; this.loading = false; ev?.target.complete(); }
    });
  }
}
