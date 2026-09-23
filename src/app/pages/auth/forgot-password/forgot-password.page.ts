import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true, selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html', styleUrls: ['./forgot-password.page.scss'],
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText]
})
export class ForgotPasswordPage {
  email = ''; loading = false; error = ''; sent = false;
  private auth = inject(AuthService);
  private toast = inject(ToastController);
  submit() {
    this.error = '';
    if (!this.email.trim()) { this.error = 'Enter your email.'; return; }
    this.loading = true;
    this.auth.forgotPassword({ email: this.email.trim() }).subscribe({
      next: async () => { this.loading = false; this.sent = true; const t = await this.toast.create({ message: 'If that email exists, a reset link was sent.', duration: 3000, color: 'success' }); t.present(); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Request failed.'; }
    });
  }
}
