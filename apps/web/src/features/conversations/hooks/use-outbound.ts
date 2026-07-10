"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationsKeys } from "./query-keys";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Falha na requisição.");
  return data as T;
}

export function useInitiateOutboundContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) =>
      postJson<{ conversationId: string; message: string }>("/api/conversations/initiate-outbound", { leadId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationsKeys.list }),
  });
}

export function useSimulatePositiveReply(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, replyText }: { leadId: string; replyText: string }) =>
      postJson<{ reply: string; appointmentId: string | null }>("/api/conversations/simulate-reply", {
        conversationId,
        leadId,
        replyText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
    },
  });
}
