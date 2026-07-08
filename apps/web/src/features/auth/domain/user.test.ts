import { describe, expect, it } from "vitest";
import { hasRole, isStaff, type AppUser } from "./user";

function buildUser(roles: AppUser["roles"]): AppUser {
  return { id: "1", fullName: "Test User", email: "test@ademicon.com", avatarUrl: null, roles };
}

describe("hasRole", () => {
  it("returns true when the user has the role", () => {
    expect(hasRole(buildUser(["consultor"]), "consultor")).toBe(true);
  });

  it("returns false when the user lacks the role", () => {
    expect(hasRole(buildUser(["consultor"]), "admin")).toBe(false);
  });

  it("returns false for a null user", () => {
    expect(hasRole(null, "admin")).toBe(false);
  });
});

describe("isStaff", () => {
  it("is true for admin, gestor and secretaria", () => {
    expect(isStaff(buildUser(["admin"]))).toBe(true);
    expect(isStaff(buildUser(["gestor"]))).toBe(true);
    expect(isStaff(buildUser(["secretaria"]))).toBe(true);
  });

  it("is false for consultor and parceiro", () => {
    expect(isStaff(buildUser(["consultor"]))).toBe(false);
    expect(isStaff(buildUser(["parceiro"]))).toBe(false);
  });
});
