import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonRefresher, IonRefresherContent,
  IonIcon, RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationDto } from '../../core/models/notification.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { routeForEntity } from '../../shared/entity-route';

@Component({
  selector: 'app-notifications', standalone: true,
  templateUrl: './notifications.page.html', styleUrls: ['./notifications.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonRefresher,
    IonRefresherContent, IonIcon, EmptyStateComponent]
})
export class NotificationsPage implements ViewWillEnter {
  private api = inject(NotificationService);
  private router = inject(Router);
  private auth = inject(AuthService);
  loading = true; error = '';
  items: NotificationDto[] = [];
  unread = 0;

  constructor() { addIcons({ chevronForwardOutline }); }
  ionViewWillEnter() { this.load(); }

  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getMine({ page: 1, pageSize: 50 }).subscribe({
      next: r => { this.items = r.notifications || []; this.unread = r.unreadCount || 0; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load notifications.'; this.loading = false; ev?.target.complete(); }
    });
  }

  markAll() { this.api.markAllRead().subscribe({ next: () => this.load() }); }

  open(n: NotificationDto) {
    if (!n.isRead) { this.api.markRead(n.notificationID).subscribe({ next: () => { n.isRead = true; this.unread = Math.max(0, this.unread - 1); this.api.refreshUnreadCount(); }, error: () => {} }); }
    const r = routeForEntity(n.relatedEntityType, n.relatedEntityID, this.auth.role);
    if (r) this.router.navigate(r);
  }
  hasTarget(n: NotificationDto) { return !!routeForEntity(n.relatedEntityType, n.relatedEntityID, this.auth.role); }
}
