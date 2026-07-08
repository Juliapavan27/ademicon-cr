"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useSession } from "@/features/auth/hooks/use-session";
import { AdminService } from "../services/admin-service";
import { SupabaseAdminRepository } from "../repository/supabase-admin-repository";
import { adminKeys } from "./query-keys";

function useAdminService() {
  return useMemo(() => new AdminService(new SupabaseAdminRepository(createClient())), []);
}

export function useUsers() {
  const adminService = useAdminService();
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => adminService.listUsers(),
  });
}

export function useRoles() {
  const adminService = useAdminService();
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: () => adminService.listRoles(),
  });
}

export function usePermissionMatrix() {
  const adminService = useAdminService();
  return useQuery({
    queryKey: adminKeys.permissionMatrix,
    queryFn: () => adminService.getPermissionMatrix(),
  });
}

export function useAssignRole() {
  const adminService = useAdminService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminService.assignRole(userId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useRemoveRole() {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

  return useMutation({
    mutationFn: (target: { userId: string; roleId: string; roleName: string }) => {
      if (!currentUser) throw new Error("Sessão não carregada.");
      return adminService.removeRole(currentUser.id, target);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useInviteUser() {
  const adminService = useAdminService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; fullName: string; roleId?: string }) =>
      adminService.inviteUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useSetUserStatus() {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "inactive" }) => {
      if (!currentUser) throw new Error("Sessão não carregada.");
      return adminService.setUserStatus(currentUser.id, userId, status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}
