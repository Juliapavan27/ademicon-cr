"use client";

import { useMemo } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { CrmService } from "../services/crm-service";
import { SupabaseCrmRepository } from "../repository/supabase-crm-repository";

export function useCrmService() {
  return useMemo(() => new CrmService(new SupabaseCrmRepository(createClient())), []);
}
