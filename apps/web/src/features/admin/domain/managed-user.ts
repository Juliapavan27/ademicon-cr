import type { RoleName } from "@/features/auth/domain/user";

export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive";
  roles: RoleName[];
  createdAt: string;
}

export interface RoleCatalogEntry {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface PermissionEntry {
  id: string;
  resource: string;
  action: string;
}

export interface PermissionMatrix {
  roles: RoleCatalogEntry[];
  permissions: PermissionEntry[];
  grants: Array<{ roleId: string; permissionId: string }>;
}
