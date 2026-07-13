import type { Appointment } from "./appointment";

export interface ConsultantOption {
  id: string;
  fullName: string;
}

export interface AgendaRepository {
  listAppointments(): Promise<Appointment[]>;
  scheduleAppointment(leadId: string, scheduledAt: string): Promise<Appointment>;
  listUnassignedAppointments(): Promise<Appointment[]>;
  listConsultants(): Promise<ConsultantOption[]>;
  assignConsultant(appointmentId: string, consultantId: string): Promise<void>;
}
