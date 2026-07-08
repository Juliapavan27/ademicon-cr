import type { ManagedUser, PermissionMatrix, RoleCatalogEntry } from "./managed-user";

export interface InviteUserInput {
  email: string;
  fullName: string;
  roleId?: string;
}

export interface AdminRepository {
  listUsers(): Promise<ManagedUser[]>;
  listRoles(): Promise<RoleCatalogEntry[]>;
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  setUserStatus(userId: string, status: "active" | "inactive"): Promise<void>;
  getPermissionMatrix(): Promise<PermissionMatrix>;
  inviteUser(input: InviteUserInput): Promise<void>;
}
