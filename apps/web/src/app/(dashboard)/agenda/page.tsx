import { AppointmentsList } from "@/features/agenda/components/appointments-list";

export default function AgendaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Reuniões agendadas automaticamente pela IA e manualmente pelo time.
        </p>
      </div>
      <AppointmentsList />
    </div>
  );
}
