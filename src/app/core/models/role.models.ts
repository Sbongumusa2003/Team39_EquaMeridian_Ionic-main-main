export interface PermissionDto {
  permissionID: number;
  permissionKey: string;
  description?: string | null;
}

export interface RoleDto {
  roleID: number;
  roleName: string;
  description?: string | null;
  isSystemRole: boolean;
  permissionKeys: string[];
  createdDate: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  permissionKeys: string[];
}

export interface UpdateRolePermissionsRequest {
  permissionKeys: string[];
}
