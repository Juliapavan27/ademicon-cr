"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useConversationsService } from "./use-conversations-service";
import { conversationsKeys } from "./query-keys";

export function useConversations() {
  const service = useConversationsService();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: conversationsKeys.list,
    queryFn: () => service.listConversations(),
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => queryClient.invalidateQueries({ queryKey: conversationsKeys.list }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
