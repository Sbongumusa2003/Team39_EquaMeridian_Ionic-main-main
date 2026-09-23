import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MyProfileDto {
  userID: number;
  fullName: string;
  email: string;
  role: string;
  accountStatus: string;
  companyName?: string;
  registrationNumber?: string;
  createdDate: string;
  lastLoginDate?: string;
  twoFactorEnabled: boolean;
  serviceAreaIds: number[];
  serviceAreaNames: string[];
}

export interface UpdateProfileDto {
  fullName: string;
  email: string;
  companyName?: string;
  registrationNumber?: string;
  serviceAreaIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private url = `${environment.apiUrl}/users/me`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<MyProfileDto> {
    return this.http.get<MyProfileDto>(this.url);
  }

  updateProfile(dto: UpdateProfileDto): Observable<any> {
    return this.http.put(`${this.url}/profile`, dto);
  }

  deactivateAccount(): Observable<any> {
    return this.http.patch(`${this.url}/deactivate`, {});
  }
}