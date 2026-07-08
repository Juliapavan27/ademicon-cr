export type RoleName = "admin" | "gestor" | "consultor" | "secretaria" | "parceiro";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: RoleName[];
}

export function hasRole(user: AppUser | null, role: RoleName): boolean {
  return user?.roles.includes(role) ?? false;
}

export function isStaff(user: AppUser | null): boolean {
  return hasRole(user, "admin") || hasRole(user, "gestor") || hasRole(user, "secretaria");
}
