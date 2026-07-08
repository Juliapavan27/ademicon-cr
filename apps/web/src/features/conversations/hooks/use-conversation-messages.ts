"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import type { FeedbackType } from "../domain/conversation";
import { useConversationsService } from "./use-conversations-service";
import { conversationsKeys } from "./query-keys";

export function useConversationMessages(conversationId: string) {
  const service = useConversationsService();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: conversationsKeys.messages(conversationId),
    queryFn: () => service.listMessages(conversationId),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => queryClient.invalidateQueries({ queryKey: conversationsKeys.messages(conversationId) }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useFeedbackForDecisions(aiDecisionIds: string[]) {
  const service = useConversationsService();
  return useQuery({
    queryKey: conversationsKeys.feedback(aiDecisionIds),
    queryFn: () => service.listFeedbackForDecisions(aiDecisionIds),
    enabled: aiDecisionIds.length > 0,
  });
}

export function useSubmitFeedback(conversationId: string) {
  const service = useConversationsService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      aiDecisionId,
      feedbackType,
      correctionText,
    }: {
      aiDecisionId: string;
      feedbackType: FeedbackType;
      correctionText?: string;
    }) => service.submitFeedback(aiDecisionId, feedbackType, correctionText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", "feedback"] });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.messages(conversationId) });
    },
  });
}
