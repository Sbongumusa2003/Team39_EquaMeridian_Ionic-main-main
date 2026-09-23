import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonList, IonBackButton, IonButtons, IonSpinner, IonText, IonCheckbox, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { isOtpChallenge } from '../../../core/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonList, IonBackButton, IonButtons, IonSpinner, IonText, IonCheckbox]
})
export class LoginPage {
  email = '';
  password = '';
  keepMeSignedIn = true;
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastController);

  async onSubmit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }
    this.loading = true;
    this.auth.login({
      email: this.email.trim(),
      password: this.password,
      keepMeSignedIn: this.keepMeSignedIn
    }).subscribe({
      next: async (res) => {
        this.loading = false;
        if (isOtpChallenge(res)) {
          this.router.navigate(['/auth/verify-otp'], {
            queryParams: { ref: res.otpReference },
            state: { otpReference: res.otpReference, keepMeSignedIn: this.keepMeSignedIn }
          });
          return;
        }
        const t = await this.toast.create({
          message: `Welcome, ${res.fullName}`,
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await t.present();
        this.auth.redirectByRole(this.route.snapshot.queryParamMap.get('returnUrl'));
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.error?.title || 'Login failed. Check your credentials.';
      }
    });
  }
}
