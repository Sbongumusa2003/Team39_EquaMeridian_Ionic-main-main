import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, logOutOutline, documentTextOutline, notificationsOutline, helpCircleOutline, shieldCheckmarkOutline,
  businessOutline, calendarOutline, cartOutline, heartOutline, cubeOutline, walletOutline, clipboardOutline,
  alertCircleOutline, chatbubblesOutline, starOutline, receiptOutline, cardOutline, folderOpenOutline,
  chevronForwardOutline, storefrontOutline, createOutline, desktopOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

interface Row { icon: string; label: string; link: string; }
interface Section { title: string; rows: Row[]; }

@Component({
  selector: 'app-account', standalone: true,
  templateUrl: './account.page.html', styleUrls: ['./account.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton]
})
export class AccountPage {
  auth = inject(AuthService);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({
      personOutline, logOutOutline, documentTextOutline, notificationsOutline, helpCircleOutline, shieldCheckmarkOutline,
      businessOutline, calendarOutline, cartOutline, heartOutline, cubeOutline, walletOutline, clipboardOutline,
      alertCircleOutline, chatbubblesOutline, starOutline, receiptOutline, cardOutline, folderOpenOutline,
      chevronForwardOutline, storefrontOutline, createOutline, desktopOutline
    });
  }

  get roleLabel(): string {
    const r = this.auth.role;
    return r === 'contractor' ? 'Contractor' : r === 'supplier' ? 'Supplier' : r === 'admin' ? 'Administrator' : (r ?? 'Guest');
  }
  get initial(): string { return (this.auth.fullName || '?').trim().charAt(0).toUpperCase(); }

  get sections(): Section[] {
    const role = this.auth.role;
    const s: Section[] = [];
    if (role === 'contractor') {
      s.push({ title: 'Shopping', rows: [
        { icon: 'heart-outline', label: 'Wishlist', link: '/tabs/wishlist' },
        { icon: 'document-text-outline', label: 'Quotations', link: '/tabs/quotations' },
        { icon: 'star-outline', label: 'My reviews', link: '/tabs/my-reviews' },
        { icon: 'clipboard-outline', label: 'Inspections', link: '/tabs/inspections' },
      ] });
    } else if (role === 'supplier') {
      s.push({ title: 'My business', rows: [
        { icon: 'storefront-outline', label: 'Supplier hub', link: '/tabs/supplier' },
        { icon: 'cube-outline', label: 'My listings', link: '/tabs/listings' },
        { icon: 'wallet-outline', label: 'Payouts', link: '/tabs/payouts' },
        { icon: 'clipboard-outline', label: 'Inspections', link: '/tabs/inspections' },
      ] });
    }
    if (role === 'contractor' || role === 'supplier') {
      s.push({ title: 'Paperwork', rows: [
        { icon: 'receipt-outline', label: 'Invoices', link: '/tabs/invoices' },
        { icon: 'create-outline', label: 'Lease agreements', link: '/tabs/lease-agreements' },
        { icon: 'card-outline', label: 'Payment history', link: '/tabs/payment-history' },
        { icon: 'folder-open-outline', label: 'My documents', link: '/tabs/documents' },
        { icon: 'alert-circle-outline', label: 'Disputes', link: '/tabs/disputes' },
      ] });
      s.push({ title: 'Communication', rows: [
        { icon: 'chatbubbles-outline', label: 'Messages', link: '/tabs/messages' },
        { icon: 'notifications-outline', label: 'Notifications', link: '/tabs/notifications' },
      ] });
    }
    s.push({ title: 'Settings & support', rows: [
      ...(this.auth.isLoggedIn ? [{ icon: 'person-outline', label: 'My profile & security', link: '/tabs/profile' }] : []),
      { icon: 'shield-checkmark-outline', label: 'Terms & policies', link: '/tabs/policies/terms' },
      { icon: 'help-circle-outline', label: 'Help & support', link: '/tabs/help' },
    ] });
    return s;
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Sign out?', message: 'You can sign back in at any time.',
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Sign out', role: 'destructive', handler: () => this.auth.logout() }]
    });
    await alert.present();
  }
}
