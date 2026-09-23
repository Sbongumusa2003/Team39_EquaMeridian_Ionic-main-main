import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonTextarea, IonSelect, IonSelectOption, IonButton, IonButtons, IonBackButton, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { DisputeService } from '../../core/services/dispute.service';
import { DISPUTE_CATEGORIES } from '../../core/models/dispute.models';

@Component({
  standalone: true, selector: 'app-raise-dispute',
  templateUrl: './raise-dispute.page.html', styleUrls: ['./raise-dispute.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonTextarea, IonSelect, IonSelectOption, IonButton, IonButtons, IonBackButton, IonSpinner]
})
export class RaiseDisputePage implements OnInit {
  bookingId = 0;
  categories = DISPUTE_CATEGORIES;
  disputeCategory = DISPUTE_CATEGORIES[0];
  description = '';
  desiredResolution = '';
  files: File[] = [];
  submitting = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(DisputeService);
  private toast = inject(ToastController);

  ngOnInit() {
    this.bookingId = Number(this.route.snapshot.paramMap.get('bookingId') || this.route.snapshot.queryParamMap.get('bookingId'));
  }

  onFiles(ev: Event) {
    const list = (ev.target as HTMLInputElement).files;
    this.files = list ? Array.from(list) : [];
  }

  submit() {
    if (!this.bookingId) { return; }
    if (!this.description.trim() || !this.desiredResolution.trim()) {
      this.toast.create({ message: 'Description and desired resolution are required', duration: 2000, color: 'warning' }).then(t => t.present());
      return;
    }
    this.submitting = true;
    this.api.raise(this.bookingId, {
      disputeCategory: this.disputeCategory,
      description: this.description.trim(),
      desiredResolution: this.desiredResolution.trim()
    }, this.files).subscribe({
      next: async () => {
        this.submitting = false;
        const t = await this.toast.create({ message: 'Dispute raised', duration: 2000, color: 'success' });
        await t.present();
        this.router.navigateByUrl('/tabs/disputes');
      },
      error: async (e) => {
        this.submitting = false;
        const t = await this.toast.create({ message: e?.error?.message || 'Failed', duration: 2500, color: 'danger' });
        t.present();
      }
    });
  }
}
