import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { RoleName } from "@/features/auth/domain/user";
import type { AdminRepository, InviteUserInput } from "../domain/admin-repository";
import type { ManagedUser, PermissionMatrix, RoleCatalogEntry } from "../domain/managed-user";

function flattenRoleNames(relation: unknown): RoleName[] {
  if (!relation) return [];
  const list = Array.isArray(relation) ? relation : [relation];
  return list
    .map((entry) => (entry as { name?: string } | null)?.name)
    .filter((name): name is RoleName => Boolean(name));
}

export class SupabaseAdminRepository implements AdminRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listUsers(): Promise<ManagedUser[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, full_name, email, status, created_at, user_roles(roles(name))")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      status: row.status as "active" | "inactive",
      createdAt: row.created_at,
      roles: row.user_roles.flatMap((entry) => flattenRoleNames(entry.roles)),
    }));
  }

  async listRoles(): Promise<RoleCatalogEntry[]> {
    const { data, error } = await this.supabase.from("roles").select("id, name, description").order("name");
    if (error) throw error;
    return (data ?? []) as RoleCatalogEntry[];
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();
    if (profileError) throw profileError;

    const { error } = await this.supabase
      .from("user_roles")
      .insert({ user_id: userId, role_id: roleId, organization_id: profile.organization_id });
    if (error) throw error;
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleId);
    if (error) throw error;
  }

  async setUserStatus(userId: string, status: "active" | "inactive"): Promise<void> {
    const { error } = await this.supabase.from("profiles").update({ status }).eq("id", userId);
    if (error) throw error;
  }

  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const [{ data: roles, error: rolesError }, { data: permissions, error: permissionsError }, { data: rolePermissions, error: grantsError }] =
      await Promise.all([
        this.supabase.from("roles").select("id, name, description").order("name"),
        this.supabase.from("permissions").select("id, resource, action").order("resource"),
        this.supabase.from("role_permissions").select("role_id, permission_id"),
      ]);

    if (rolesError) throw rolesError;
    if (permissionsError) throw permissionsError;
    if (grantsError) throw grantsError;

    return {
      roles: (roles ?? []) as RoleCatalogEntry[],
      permissions: permissions ?? [],
      grants: (rolePermissions ?? []).map((row) => ({ roleId: row.role_id, permissionId: row.permission_id })),
    };
  }

  async inviteUser(input: InviteUserInput): Promise<void> {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error ?? "Falha ao convidar usuário.");
    }
  }
}
