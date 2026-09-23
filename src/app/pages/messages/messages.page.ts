import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent,
  RefresherCustomEvent, ViewWillEnter
} from '@ionic/angular/standalone';
import { MessageService } from '../../core/services/message.service';
import { ThreadListItemDto } from '../../core/models/message.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-messages', standalone: true,
  templateUrl: './messages.page.html', styleUrls: ['./messages.page.scss'],
  imports: [DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher,
    IonRefresherContent, EmptyStateComponent]
})
export class MessagesPage implements ViewWillEnter {
  loading = true; error = '';
  threads: ThreadListItemDto[] = [];
  constructor(private api: MessageService) {}
  ionViewWillEnter() { this.load(); }
  initial(n: string) { return (n || '?').trim().charAt(0).toUpperCase(); }
  load(ev?: RefresherCustomEvent) {
    if (!ev) this.loading = true;
    this.error = '';
    this.api.getThreads({ page: 1, pageSize: 100 }).subscribe({
      next: r => { this.threads = r.threads || []; this.loading = false; ev?.target.complete(); },
      error: e => { this.error = e?.error?.message || 'Could not load messages.'; this.loading = false; ev?.target.complete(); }
    });
  }
}
