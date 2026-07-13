"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmKeys } from "./query-keys";

interface CheckWhatsAppResponse {
  checked: number;
  valid: number;
  invalid: number;
}

export function useCheckWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CheckWhatsAppResponse> => {
      const response = await fetch("/api/leads/check-whatsapp", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao verificar WhatsApp.");
      return data as CheckWhatsAppResponse;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.leads }),
  });
}
