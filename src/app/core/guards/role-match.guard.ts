import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Lets the router pick a different page for the same URL depending on who is signed in. */
export const roleMatch = (role: string): CanMatchFn => () => inject(AuthService).role === role;

/** Suppliers land on their hub instead of the shopper home page. */
export const homeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.role === 'supplier' ? inject(Router).parseUrl('/tabs/supplier') : true;
};
