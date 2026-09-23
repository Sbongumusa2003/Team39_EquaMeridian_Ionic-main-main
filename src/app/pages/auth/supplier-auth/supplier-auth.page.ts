import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Angular had a dedicated supplier-auth entry; Ionic routes suppliers to register/login. */
@Component({
  standalone: true, selector: 'app-supplier-auth',
  template: '',
  imports: []
})
export class SupplierAuthPage implements OnInit {
  private router = inject(Router);
  ngOnInit() {
    this.router.navigate(['/auth/register'], { queryParams: { role: 'supplier' }, replaceUrl: true });
  }
}
