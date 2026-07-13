"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppointments } from "../hooks/use-appointments";
import type { AppointmentStatus } from "../domain/appointment";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  rescheduled: "Reagendado",
  completed: "Concluído",
  no_show: "Não compareceu",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<AppointmentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "default",
  confirmed: "default",
  rescheduled: "secondary",
  completed: "outline",
  no_show: "destructive",
  cancelled: "destructive",
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AppointmentsList() {
  const { data: appointments, isLoading } = useAppointments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum agendamento ainda. Quando a IA marcar uma reunião, ela aparece aqui automaticamente — o
            consultor só precisa comparecer.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Consultor</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.leadName}</TableCell>
                  <TableCell className="tabular-nums">{formatDateTime(appointment.scheduledAt)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {appointment.consultantName ?? (
                      <Badge variant="secondary" className="text-xs">
                        Aguardando distribuição
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={appointment.source === "ai_scheduled" ? "default" : "outline"} className="text-xs">
                      {appointment.source === "ai_scheduled" ? "Agendado pela IA" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[appointment.status]} className="text-xs">
                      {STATUS_LABELS[appointment.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
