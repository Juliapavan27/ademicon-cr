"use client";

import { useMemo } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { ConversationsService } from "../services/conversations-service";
import { SupabaseConversationsRepository } from "../repository/supabase-conversations-repository";

export function useConversationsService() {
  return useMemo(() => new ConversationsService(new SupabaseConversationsRepository(createClient())), []);
}
