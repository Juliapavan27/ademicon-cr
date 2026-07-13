import type { AgendaRepository, ConsultantOption } from "../domain/agenda-repository";
import type { Appointment } from "../domain/appointment";

export class AgendaService {
  constructor(private readonly repository: AgendaRepository) {}

  listAppointments(): Promise<Appointment[]> {
    return this.repository.listAppointments();
  }

  listUnassignedAppointments(): Promise<Appointment[]> {
    return this.repository.listUnassignedAppointments();
  }

  listConsultants(): Promise<ConsultantOption[]> {
    return this.repository.listConsultants();
  }

  assignConsultant(appointmentId: string, consultantId: string): Promise<void> {
    return this.repository.assignConsultant(appointmentId, consultantId);
  }
}
