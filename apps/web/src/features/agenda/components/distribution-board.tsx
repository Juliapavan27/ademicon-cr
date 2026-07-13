"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignConsultant, useConsultantOptions, useProcessCadence, useUnassignedAppointments } from "../hooks/use-distribution";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AssignRow({ appointmentId, leadName, scheduledAt }: { appointmentId: string; leadName: string; scheduledAt: string }) {
  const { data: consultants } = useConsultantOptions();
  const assignConsultant = useAssignConsultant();
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{leadName}</p>
        <p className="text-xs text-muted-foreground">{formatDateTime(scheduledAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Escolher consultor" />
          </SelectTrigger>
          <SelectContent>
            {consultants?.map((consultant) => (
              <SelectItem key={consultant.id} value={consultant.id}>
                {consultant.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!selected || assignConsultant.isPending}
          onClick={() =>
            assignConsultant.mutate(
              { appointmentId, consultantId: selected },
              { onSuccess: () => toast.success(`Reunião com ${leadName} distribuída.`) },
            )
          }
        >
          Atribuir
        </Button>
      </div>
    </div>
  );
}

export function DistributionBoard() {
  const { data: appointments, isLoading } = useUnassignedAppointments();
  const processCadence = useProcessCadence();

  async function handleProcessCadence() {
    try {
      const result = await processCadence.mutateAsync();
      toast.success(
        `Cadência processada: ${result.sent} mensagem(ns) enviada(s), ${result.cancelled} cancelada(s) por resposta.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao processar a cadência.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Cadência de prospecção</CardTitle>
            <p className="text-sm text-muted-foreground">
              Processa manualmente os passos vencidos da cadência (abertura, dia 3, dia 7) para leads
              importados que ainda não responderam.
            </p>
          </div>
          <Button onClick={handleProcessCadence} disabled={processCadence.isPending} variant="secondary">
            <Send className="size-4" />
            {processCadence.isPending ? "Processando..." : "Processar cadência pendente"}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuir agendamentos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Reuniões que a IA já confirmou com o lead, aguardando um consultor ser escolhido pelo time.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum agendamento aguardando distribuição no momento.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {appointments.map((appointment) => (
                <AssignRow
                  key={appointment.id}
                  appointmentId={appointment.id}
                  leadName={appointment.leadName}
                  scheduledAt={appointment.scheduledAt}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
