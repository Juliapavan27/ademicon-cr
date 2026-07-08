import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { AuthRepository } from "../domain/auth-repository";
import type { AppUser, RoleName } from "../domain/user";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getCurrentUser(): Promise<AppUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await this.supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    const { data: userRoles } = await this.supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id);

    const roles = (userRoles ?? [])
      .flatMap((entry) => {
        const relation = entry.roles as { name: string } | { name: string }[] | null;
        if (!relation) return [];
        return Array.isArray(relation) ? relation.map((role) => role.name) : [relation.name];
      })
      .filter((name): name is RoleName => Boolean(name));

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      roles,
    };
  }

  async signInWithPassword(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
