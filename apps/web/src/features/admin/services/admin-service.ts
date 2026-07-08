import type { AdminRepository, InviteUserInput } from "../domain/admin-repository";
import type { ManagedUser, PermissionMatrix, RoleCatalogEntry } from "../domain/managed-user";

export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  listUsers(): Promise<ManagedUser[]> {
    return this.repository.listUsers();
  }

  listRoles(): Promise<RoleCatalogEntry[]> {
    return this.repository.listRoles();
  }

  assignRole(userId: string, roleId: string): Promise<void> {
    return this.repository.assignRole(userId, roleId);
  }

  async removeRole(
    currentUserId: string,
    target: { userId: string; roleId: string; roleName: string },
  ): Promise<void> {
    if (target.userId === currentUserId && target.roleName === "admin") {
      throw new Error("Você não pode remover seu próprio papel de admin.");
    }
    return this.repository.removeRole(target.userId, target.roleId);
  }

  async setUserStatus(
    currentUserId: string,
    userId: string,
    status: "active" | "inactive",
  ): Promise<void> {
    if (userId === currentUserId && status === "inactive") {
      throw new Error("Você não pode desativar sua própria conta.");
    }
    return this.repository.setUserStatus(userId, status);
  }

  getPermissionMatrix(): Promise<PermissionMatrix> {
    return this.repository.getPermissionMatrix();
  }

  inviteUser(input: InviteUserInput): Promise<void> {
    return this.repository.inviteUser(input);
  }
}
