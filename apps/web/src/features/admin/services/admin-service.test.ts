import { describe, expect, it, vi } from "vitest";
import type { AdminRepository } from "../domain/admin-repository";
import { AdminService } from "./admin-service";

function buildRepository(overrides: Partial<AdminRepository> = {}): AdminRepository {
  return {
    listUsers: vi.fn(),
    listRoles: vi.fn(),
    assignRole: vi.fn(),
    removeRole: vi.fn(),
    setUserStatus: vi.fn(),
    getPermissionMatrix: vi.fn(),
    inviteUser: vi.fn(),
    ...overrides,
  };
}

describe("AdminService.removeRole", () => {
  it("blocks removing your own admin role", async () => {
    const repository = buildRepository();
    const service = new AdminService(repository);

    await expect(
      service.removeRole("user-1", { userId: "user-1", roleId: "role-1", roleName: "admin" }),
    ).rejects.toThrow("Você não pode remover seu próprio papel de admin.");
    expect(repository.removeRole).not.toHaveBeenCalled();
  });

  it("allows removing another user's admin role", async () => {
    const repository = buildRepository();
    const service = new AdminService(repository);

    await service.removeRole("user-1", { userId: "user-2", roleId: "role-1", roleName: "admin" });
    expect(repository.removeRole).toHaveBeenCalledWith("user-2", "role-1");
  });
});

describe("AdminService.setUserStatus", () => {
  it("blocks deactivating your own account", async () => {
    const repository = buildRepository();
    const service = new AdminService(repository);

    await expect(service.setUserStatus("user-1", "user-1", "inactive")).rejects.toThrow(
      "Você não pode desativar sua própria conta.",
    );
    expect(repository.setUserStatus).not.toHaveBeenCalled();
  });

  it("allows deactivating another user's account", async () => {
    const repository = buildRepository();
    const service = new AdminService(repository);

    await service.setUserStatus("user-1", "user-2", "inactive");
    expect(repository.setUserStatus).toHaveBeenCalledWith("user-2", "inactive");
  });
});
