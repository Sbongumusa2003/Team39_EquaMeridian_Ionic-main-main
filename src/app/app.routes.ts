import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage) },
      { path: 'register', loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage) },
      { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage) },
      { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage) },
      { path: 'supplier-auth', loadComponent: () => import('./pages/auth/supplier-auth/supplier-auth.page').then(m => m.SupplierAuthPage) },
      { path: 'verify-otp', loadComponent: () => import('./pages/auth/verify-otp/verify-otp.page').then(m => m.VerifyOtpPage) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },
  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/home' },
];
