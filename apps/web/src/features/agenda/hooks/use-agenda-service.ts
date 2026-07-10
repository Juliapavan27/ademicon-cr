"use client";

import { useMemo } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { AgendaService } from "../services/agenda-service";
import { SupabaseAgendaRepository } from "../repository/supabase-agenda-repository";

export function useAgendaService() {
  return useMemo(() => new AgendaService(new SupabaseAgendaRepository(createClient())), []);
}
