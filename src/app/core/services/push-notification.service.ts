import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private apiUrl = `${environment.apiUrl}/notifications`;
  private listenersAttached = false;
  private lastToken: string | null = null;

  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  async init(): Promise<void> {
    if (!this.isNative) {
      console.info('[Push] Skipping — not a native platform');
      return;
    }
    if (!this.auth.isLoggedIn) return;

    await this.attachListeners();

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      console.warn('[Push] Permission not granted');
      return;
    }

    await PushNotifications.register();
  }

  async detach(): Promise<void> {
    if (this.lastToken && this.auth.isLoggedIn) {
      try {
        await firstValueFrom(
          this.http.delete(`${this.apiUrl}/device-token`, {
            body: { token: this.lastToken }
          })
        );
      } catch { /* ignore */ }
    }
    this.lastToken = null;
  }

  private async attachListeners(): Promise<void> {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    await PushNotifications.addListener('registration', async (token: Token) => {
      this.lastToken = token.value;
      await this.registerTokenWithApi(token.value);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error', err);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.info('[Push] Foreground', notification.title, notification.body);
      }
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        this.zone.run(() => this.navigateFromNotification(action.notification));
      }
    );
  }

  private async registerTokenWithApi(token: string): Promise<void> {
    if (!this.auth.isLoggedIn) return;
    const platform = Capacitor.getPlatform();
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/device-token`, {
          token,
          platform,
          deviceName: platform
        })
      );
      console.info('[Push] Device token registered with API');
    } catch (e) {
      console.error('[Push] Failed to register token with API', e);
    }
  }

  private navigateFromNotification(n: PushNotificationSchema): void {
    const data = (n.data || {}) as Record<string, string>;
    const type = (data['type'] || data['Type'] || '').toLowerCase();
    const refId = data['referenceId'] || data['ReferenceId'] || data['bookingId'] || data['BookingId'];
    const entity = (data['entityType'] || data['EntityType'] || '').toLowerCase();

    if (entity === 'booking' && refId) {
      this.router.navigateByUrl(`/tabs/bookings/${refId}`);
      return;
    }
    if (entity === 'invoice' && refId) {
      this.router.navigateByUrl(`/tabs/invoices/${refId}`);
      return;
    }
    if (entity === 'quotation' && refId) {
      this.router.navigateByUrl(`/tabs/quotations/${refId}`);
      return;
    }
    if (type.includes('message') || entity === 'message') {
      this.router.navigateByUrl('/tabs/messages');
      return;
    }
    this.router.navigateByUrl('/tabs/notifications');
  }
}