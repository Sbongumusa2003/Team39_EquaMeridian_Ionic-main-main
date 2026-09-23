import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput,
  AlertController, ToastController, ViewWillEnter
} from '@ionic/angular/standalone';
import { ProfileService, MyProfileDto } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusPillComponent } from '../../shared/status-pill.component';

@Component({
  selector: 'app-profile', standalone: true,
  templateUrl: './profile.page.html', styleUrls: ['./profile.page.scss'],
  imports: [DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonInput, StatusPillComponent]
})
export class ProfilePage implements ViewWillEnter {
  private toast = inject(ToastController);
  private alert = inject(AlertController);
  private api = inject(ProfileService);
  auth = inject(AuthService);

  loading = true; saving = false; toggling2fa = false; deactivating = false;
  p: MyProfileDto | null = null;
  fullName = ''; companyName = ''; registrationNumber = '';
  passwordFor2fa = '';

  ionViewWillEnter() { this.load(); }

  private async say(message: string, color = 'dark') {
    const t = await this.toast.create({ message, duration: 2400, color, position: 'top' });
    await t.present();
  }

  load() {
    this.api.getMyProfile().subscribe({
      next: p => { this.p = p; this.fullName = p.fullName; this.companyName = p.companyName || ''; this.registrationNumber = p.registrationNumber || ''; this.loading = false; },
      error: () => { this.loading = false; void this.say('Could not load your profile.', 'danger'); }
    });
  }

  save() {
    if (!this.p) return;
    if (this.fullName.trim().length < 2) { void this.say('Enter your full name.', 'warning'); return; }
    if (this.fullName.trim().length > 200) { void this.say('Your name cannot be longer than 200 characters.', 'warning'); return; }
    if (this.companyName.trim().length > 200) { void this.say('The company name cannot be longer than 200 characters.', 'warning'); return; }
    if (this.registrationNumber.trim().length > 100) { void this.say('The registration number cannot be longer than 100 characters.', 'warning'); return; }
    this.saving = true;
    this.api.updateProfile({
      fullName: this.fullName.trim(), email: this.p.email,
      companyName: this.companyName.trim() || undefined,
      registrationNumber: this.registrationNumber.trim() || undefined,
      serviceAreaIds: this.p.serviceAreaIds
    }).subscribe({
      next: () => { this.saving = false; void this.say('Profile updated', 'success'); this.load(); },
      error: e => { this.saving = false; void this.say(e?.error?.message || 'Update failed.', 'danger'); }
    });
  }

  toggle2fa() {
    if (!this.p) return;
    if (!this.passwordFor2fa) { void this.say('Enter your password to change 2FA.', 'warning'); return; }
    this.toggling2fa = true;
    const dto = { password: this.passwordFor2fa };
    (this.p.twoFactorEnabled ? this.auth.disableTwoFactor(dto) : this.auth.enableTwoFactor(dto)).subscribe({
      next: () => { this.toggling2fa = false; this.passwordFor2fa = ''; void this.say(this.p!.twoFactorEnabled ? '2FA disabled' : '2FA enabled', 'success'); this.load(); },
      error: e => { this.toggling2fa = false; void this.say(e?.error?.message || 'Could not change 2FA.', 'danger'); }
    });
  }

  async deactivate() {
    const a = await this.alert.create({
      header: 'Deactivate your account?',
      message: 'You will be signed out and won\'t be able to sign in again. Active bookings and open invoices may block this. Contact support to restore your account.',
      buttons: [{ text: 'Keep my account', role: 'cancel' }, { text: 'Deactivate', role: 'destructive', handler: () => {
        this.deactivating = true;
        this.api.deactivateAccount().subscribe({
          next: () => { this.deactivating = false; void this.say('Account deactivated'); this.auth.logout(); },
          error: e => { this.deactivating = false; void this.say(e?.error?.message || 'Could not deactivate your account.', 'danger'); }
        });
      } }]
    });
    await a.present();
  }
}
