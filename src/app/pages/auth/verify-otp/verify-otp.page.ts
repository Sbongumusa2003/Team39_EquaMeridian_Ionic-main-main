import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true, selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html', styleUrls: ['./verify-otp.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonButtons, IonBackButton, IonSpinner, IonText]
})
export class VerifyOtpPage implements OnInit {
  code = ''; otpReference = ''; keepMeSignedIn = true; loading = false; error = ''; resending = false;
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastController);
  ngOnInit() {
    this.otpReference = this.route.snapshot.queryParamMap.get('ref') || history.state?.otpReference || '';
    this.keepMeSignedIn = history.state?.keepMeSignedIn !== false;
  }
  submit() {
    this.error = '';
    if (!this.otpReference) { this.error = 'Missing OTP reference. Sign in again.'; return; }
    if (!this.code.trim()) { this.error = 'Enter the code from your email/SMS.'; return; }
    this.loading = true;
    this.auth.verifyOtp({ otpReference: this.otpReference, code: this.code.trim(), keepMeSignedIn: this.keepMeSignedIn }).subscribe({
      next: () => { this.loading = false; this.auth.redirectByRole(); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Invalid or expired code.'; }
    });
  }
  resend() {
    if (!this.otpReference) return;
    this.resending = true;
    this.auth.resendOtp({ otpReference: this.otpReference }).subscribe({
      next: async (res: any) => {
        this.resending = false;
        if (res?.otpReference) this.otpReference = res.otpReference;
        const t = await this.toast.create({ message: 'Code resent.', duration: 2000, color: 'success' }); t.present();
      },
      error: async () => { this.resending = false; const t = await this.toast.create({ message: 'Could not resend.', duration: 2000, color: 'danger' }); t.present(); }
    });
  }
}
