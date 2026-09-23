import { Component, OnInit } from '@angular/core';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonButtons, IonBackButton, IonSpinner } from '@ionic/angular/standalone';
import { HelpService } from '../../core/services/help.service';

@Component({
  selector: 'app-help',
  standalone: true,
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonButtons, IonBackButton, IonSpinner],
})
export class HelpPage implements OnInit {
  loading = true; faqs: any[] = [];
  constructor(private api: HelpService) {}
  ngOnInit() {
    const call = (this.api as any).getFaqs?.() || (this.api as any).getHelp?.() || (this.api as any).getAll?.();
    if (!call) {
      this.faqs = [
        { q: 'How do I book machinery?', a: 'Browse listings, request a quote or add to cart, then complete the booking flow.' },
        { q: 'How do payouts work?', a: 'Suppliers receive payouts after completed hires, subject to platform fees and clearance.' },
        { q: 'How do I raise a dispute?', a: 'Open the booking and use Raise dispute, or go to Account → Disputes.' },
      ];
      this.loading = false;
      return;
    }
    call.subscribe({
      next: (res: any) => {
        this.faqs = res.items || res.faqs || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
