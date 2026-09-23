import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse, RegisterRequest, RegisterSupplierRequest,
  ForgotPasswordRequest, UpdatePasswordRequest, LoginResult, isOtpChallenge,
  VerifyOtpRequest, ToggleTwoFactorRequest, ResendOtpRequest, ResendOtpResponse
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'equa_user';
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): LoginResponse | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      const user: LoginResponse = JSON.parse(stored);
      if (user.expiry && new Date(user.expiry) <= new Date()) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      return user;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  get currentUser(): LoginResponse | null {
    const user = this.currentUserSubject.value;
    if (user?.expiry && new Date(user.expiry) <= new Date()) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.currentUserSubject.next(null);
      return null;
    }
    return user;
  }
  get token(): string | null              { return this.currentUser?.token ?? null; }
  get role(): string | null               { return this.currentUser?.role?.toLowerCase() ?? null; }
  /** True only when a non-expired session exists — required so public browse does not send dead JWTs. */
  get isLoggedIn(): boolean               { return !!this.currentUser; }
  get fullName(): string                   { return this.currentUser?.fullName ?? ''; }

  /** Permission keys for the current session (admin = full catalogue; custom = assigned only). */
  get permissions(): string[] {
    return this.currentUser?.permissions ?? [];
  }

  /**
   * Built-in admin always has access. Custom internal roles need the exact key.
   * Marketplace roles never have admin permissions.
   */
  hasPermission(key: string): boolean {
    const r = this.role;
    if (!r || r === 'supplier' || r === 'contractor') return false;
    if (r === 'admin') return true;
    return this.permissions.some(p => p.toLowerCase() === key.toLowerCase());
  }

  hasAnyPermission(...keys: string[]): boolean {
    return keys.some(k => this.hasPermission(k));
  }

  login(dto: LoginRequest): Observable<LoginResult> {
    return this.http.post<LoginResult>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        if (!isOtpChallenge(response)) {
          this.persistSession(response);
        }
      })
    );
  }

  verifyOtp(dto: VerifyOtpRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-otp`, dto).pipe(
      tap(response => this.persistSession(response))
    );
  }

  resendOtp(dto: ResendOtpRequest): Observable<ResendOtpResponse> {
    return this.http.post<ResendOtpResponse>(`${this.apiUrl}/resend-otp`, dto);
  }

  enableTwoFactor(dto: ToggleTwoFactorRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/two-factor/enable`, dto);
  }

  disableTwoFactor(dto: ToggleTwoFactorRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/two-factor/disable`, dto);
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  logout(): void {
    if (this.token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
    // Professional marketplace pattern: after sign-out return to the public landing page
    // (not the login form). Users can sign in again from the header when ready.
    this.router.navigateByUrl('/tabs/home');
  }

  register(dto: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  registerSupplier(dto: RegisterSupplierRequest): Observable<any> {
    const form = this.buildSupplierForm(dto);
    return this.http.post(`${this.apiUrl}/register/supplier`, form);
  }

  registerSupplierWithProgress(dto: RegisterSupplierRequest): Observable<HttpEvent<any>> {
    const form = this.buildSupplierForm(dto);
    const req = new HttpRequest('POST', `${this.apiUrl}/register/supplier`, form, {
      reportProgress: true
    });
    return this.http.request(req);
  }

  private buildSupplierForm(dto: RegisterSupplierRequest): FormData {
    const form = new FormData();
    form.append('fullName', dto.fullName);
    form.append('email', dto.email);
    form.append('password', dto.password);
    form.append('companyName', dto.companyName);
    if (dto.registrationNumber) form.append('registrationNumber', dto.registrationNumber);
    dto.documents.forEach(file => form.append('Documents', file));
    dto.docTypeIds.forEach(id => form.append('DocTypeIds', id.toString()));
    return form;
  }

  forgotPassword(dto: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: UpdatePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, dto);
  }

  redirectByRole(returnUrl?: string | null): void {
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/auth')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    const role = this.role;
    if (role === 'supplier') {
      this.router.navigateByUrl('/tabs/supplier');
    } else if (role === 'contractor') {
      this.router.navigateByUrl('/tabs/browse');
    } else {
      // Admin and other roles: mobile app is contractor/supplier only — send to account
      this.router.navigateByUrl('/tabs/account');
    }
  }
}