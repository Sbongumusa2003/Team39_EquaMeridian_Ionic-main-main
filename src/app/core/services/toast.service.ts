import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

/** App-wide message popup. The same message is not repeated within 15 seconds. */
@Injectable({ providedIn: 'root' })
export class AppToastService {
  private controller = inject(ToastController);
  private recent = new Map<string, number>();

  error(message: string) { return this.show(message, 'danger', 5000); }
  warning(message: string) { return this.show(message, 'warning', 4000); }
  success(message: string) { return this.show(message, 'success', 2500); }

  private async show(message: string, color: string, duration: number) {
    if (!message) return;
    const now = Date.now();
    const last = this.recent.get(message);
    if (last && now - last < 15000) return;
    this.recent.set(message, now);
    const t = await this.controller.create({
      message, duration, color, position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await t.present();
  }
}
