"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAgendaService } from "./use-agenda-service";
import { agendaKeys } from "./query-keys";

export function useAppointments() {
  const service = useAgendaService();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: agendaKeys.list,
    queryFn: () => service.listAppointments(),
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("agenda-appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => queryClient.invalidateQueries({ queryKey: agendaKeys.list }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
