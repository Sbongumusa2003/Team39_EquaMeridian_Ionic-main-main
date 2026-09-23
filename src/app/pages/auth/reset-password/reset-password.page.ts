import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true, selector: 'app-reset-password',
  templateUrl: './reset-password.page.html', styleUrls: ['./reset-password.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText]
})
export class ResetPasswordPage implements OnInit {
  token = ''; password = ''; confirm = ''; loading = false; error = '';
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastController);
  ngOnInit() { this.token = this.route.snapshot.queryParamMap.get('token') || ''; }
  submit() {
    this.error = '';
    if (!this.token) { this.error = 'Missing reset token.'; return; }
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    this.auth.resetPassword({ token: this.token, newPassword: this.password, confirmPassword: this.confirm }).subscribe({
      next: async () => {
        this.loading = false;
        const t = await this.toast.create({ message: 'Password updated. Please sign in.', duration: 2500, color: 'success' });
        await t.present();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Reset failed.'; }
    });
  }
}
