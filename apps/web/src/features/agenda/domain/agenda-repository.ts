import type { Appointment } from "./appointment";

export interface AgendaRepository {
  listAppointments(): Promise<Appointment[]>;
  scheduleAppointment(leadId: string, scheduledAt: string): Promise<Appointment>;
}
