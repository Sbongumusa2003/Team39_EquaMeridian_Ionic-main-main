import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonSpinner, IonBadge } from '@ionic/angular/standalone';
import { QuotationService } from '../../core/services/quotation.service';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true, selector: 'app-quotation-compare',
  templateUrl: './quotation-compare.page.html', styleUrls: ['./quotation-compare.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonSpinner, IonBadge, DatePipe]
})
export class QuotationComparePage implements OnInit {
  items: any[] = []; loading = false; error = ''; warning = '';
  private route = inject(ActivatedRoute);
  private api = inject(QuotationService);
  ngOnInit() {
    const ids = (this.route.snapshot.queryParamMap.get('ids') || '')
      .split(',').map(s => Number(s.trim())).filter(n => n > 0);
    if (ids.length < 2) { this.error = 'Select at least 2 quotations to compare.'; return; }
    this.loading = true;
    this.api.contractorCompare(ids).subscribe({
      next: (res) => { this.items = res.quotations || []; this.warning = res.warning || ''; this.loading = false; },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Compare failed'; }
    });
  }
}
