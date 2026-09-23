import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  standalone: true, selector: 'app-policies',
  templateUrl: './policies.page.html', styleUrls: ['./policies.page.scss'],
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton]
})
export class PoliciesPage implements OnInit {
  title = 'Policy'; body = ''; key = 'terms';
  readonly tabs = [{ key: 'terms', label: 'Terms' }, { key: 'privacy', label: 'Privacy' }, { key: 'mla', label: 'Master lease' }];
  private route = inject(ActivatedRoute);
  ngOnInit() { this.route.paramMap.subscribe(() => this.render()); }
  private render() {
    const key = this.route.snapshot.paramMap.get('key') || this.route.snapshot.data['policyKey'] || 'terms';
    const map: any = {
      terms: { title: 'Terms of Service', body: 'EquaMeridian Hub Terms of Service govern use of the equipment hire marketplace, including listings, bookings, payments, and disputes. Users must provide accurate information and comply with applicable law.' },
      privacy: { title: 'Privacy Policy', body: 'We process personal and company data to operate the marketplace, verify suppliers, and fulfil hires. Data is retained as required for legal and operational purposes.' },
      mla: { title: 'Master Lease Agreement', body: 'The Master Lease Agreement sets the standard hire terms between contractors and suppliers on the platform, including condition, liability, delivery, and off-hire obligations.' }
    };
    this.key = map[key] ? key : 'terms';
    const p = map[this.key];
    this.title = p.title; this.body = p.body;
  }
}
