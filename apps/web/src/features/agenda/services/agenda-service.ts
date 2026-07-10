import type { AgendaRepository } from "../domain/agenda-repository";
import type { Appointment } from "../domain/appointment";

export class AgendaService {
  constructor(private readonly repository: AgendaRepository) {}

  listAppointments(): Promise<Appointment[]> {
    return this.repository.listAppointments();
  }
}
