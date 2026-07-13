"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAgendaService } from "./use-agenda-service";
import { agendaKeys } from "./query-keys";

export function useUnassignedAppointments() {
  const service = useAgendaService();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: agendaKeys.unassigned,
    queryFn: () => service.listUnassignedAppointments(),
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("secretaria-unassigned-appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          queryClient.invalidateQueries({ queryKey: agendaKeys.unassigned });
          queryClient.invalidateQueries({ queryKey: agendaKeys.list });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useConsultantOptions() {
  const service = useAgendaService();
  return useQuery({
    queryKey: agendaKeys.consultants,
    queryFn: () => service.listConsultants(),
  });
}

export function useAssignConsultant() {
  const service = useAgendaService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, consultantId }: { appointmentId: string; consultantId: string }) =>
      service.assignConsultant(appointmentId, consultantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.unassigned });
      queryClient.invalidateQueries({ queryKey: agendaKeys.list });
    },
  });
}

export function useProcessCadence() {
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("cadence-dispatcher", { method: "POST" });
      if (error) throw error;
      return data as { processed: number; sent: number; cancelled: number };
    },
  });
}
