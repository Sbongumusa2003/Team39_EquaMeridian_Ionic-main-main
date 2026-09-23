import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = (route.data['roles'] ?? []).map((r: string) => r.toLowerCase());
  const userRole = (auth.role ?? '').toLowerCase();

  if (!userRole) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
    return false;
  }

  if (allowed.includes(userRole)) return true;

  // Custom admin-like roles with dashboard permission
  if (allowed.includes('admin') && auth.hasPermission?.('dashboard')) return true;

  router.navigateByUrl('/tabs/unauthorized');
  return false;
};
