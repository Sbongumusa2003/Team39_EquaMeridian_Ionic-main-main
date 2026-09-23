import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RoleDto, PermissionDto, CreateRoleRequest, UpdateRolePermissionsRequest
} from '../models/role.models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = `${environment.apiUrl}/admin/roles`;
  private permissionsUrl = `${environment.apiUrl}/admin/permissions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.apiUrl);
  }

  getById(roleId: number): Observable<RoleDto> {
    return this.http.get<RoleDto>(`${this.apiUrl}/${roleId}`);
  }

  getAllPermissions(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(this.permissionsUrl);
  }

  create(dto: CreateRoleRequest): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.apiUrl, dto);
  }

  updatePermissions(roleId: number, dto: UpdateRolePermissionsRequest): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.apiUrl}/${roleId}/permissions`, dto);
  }

  delete(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleId}`);
  }
}
