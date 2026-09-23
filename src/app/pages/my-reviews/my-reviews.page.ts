import { Component, OnInit } from '@angular/core';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonButton } from '@ionic/angular/standalone';
import { ReviewService } from '../../core/services/review.service';

@Component({
  standalone: true, selector: 'app-my-reviews',
  templateUrl: './my-reviews.page.html', styleUrls: ['./my-reviews.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonRefresher, IonRefresherContent, IonButton]
})
export class MyReviewsPage implements OnInit {
  loading = true; items: any[] = []; error = '';
  constructor(private api: ReviewService) {}
  stars(n: number) { return '★'.repeat(Math.max(0, Math.round(n))) + '☆'.repeat(Math.max(0, 5 - Math.round(n))); }
  ngOnInit() { this.load(); }
  load(ev?: any) {
    this.loading = !ev;
    this.api.getMine().subscribe({
      next: (res) => { this.items = res.reviews || []; this.loading = false; ev?.target?.complete(); },
      error: (e) => { this.error = e?.error?.message || 'Failed'; this.loading = false; ev?.target?.complete(); }
    });
  }
}
