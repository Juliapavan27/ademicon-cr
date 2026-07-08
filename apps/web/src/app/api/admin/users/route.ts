import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  roleId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const { data: callerRoles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  const isAdmin = (callerRoles ?? []).some((entry) => {
    const relation = entry.roles as { name: string } | { name: string }[] | null;
    if (!relation) return false;
    return Array.isArray(relation)
      ? relation.some((role) => role.name === "admin")
      : relation.name === "admin";
  });

  if (!isAdmin || !profile) {
    return NextResponse.json({ error: "Apenas administradores podem convidar usuários." }, { status: 403 });
  }

  const parsed = inviteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { email, fullName, roleId } = parsed.data;
  const origin = new URL(request.url).origin;
  const adminClient = createAdminClient();

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${origin}/auth/callback`,
  });

  if (inviteError) {
    const status = inviteError.status === 422 ? 409 : 500;
    return NextResponse.json({ error: inviteError.message }, { status });
  }

  if (roleId && invited.user) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: invited.user.id, role_id: roleId, organization_id: profile.organization_id });

    if (roleError) {
      return NextResponse.json(
        { error: `Usuário convidado, mas falha ao atribuir papel: ${roleError.message}` },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ id: invited.user?.id }, { status: 201 });
}
