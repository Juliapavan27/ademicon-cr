"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { AuthService } from "../services/auth-service";
import { SupabaseAuthRepository } from "../repository/supabase-auth-repository";
import { authKeys } from "./query-keys";

function useAuthService() {
  return useMemo(() => new AuthService(new SupabaseAuthRepository(createClient())), []);
}

export function useSession() {
  const authService = useAuthService();

  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
  });
}

export function useSignIn() {
  const authService = useAuthService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: ({ error }) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      }
    },
  });
}

export function useSignOut() {
  const authService = useAuthService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}
