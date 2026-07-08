import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { AuthService } from "@/features/auth/services/auth-service";
import { SupabaseAuthRepository } from "@/features/auth/repository/supabase-auth-repository";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const authService = new AuthService(new SupabaseAuthRepository(supabase));
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
