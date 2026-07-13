import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { AgendaRepository, ConsultantOption } from "../domain/agenda-repository";
import type { Appointment } from "../domain/appointment";

function toList<T>(relation: T | T[] | null | undefined): T[] {
  if (!relation) return [];
  return Array.isArray(relation) ? relation : [relation];
}

const APPOINTMENT_SELECT =
  "id, lead_id, consultant_id, scheduled_at, duration_minutes, status, source, leads(full_name)";

type AppointmentRow = {
  id: string;
  lead_id: string;
  consultant_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  source: string;
  leads: { full_name: string } | { full_name: string }[] | null;
};

export class SupabaseAgendaRepository implements AgendaRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    const rows = (data as unknown as AppointmentRow[]) ?? [];
    const consultantIds = [...new Set(rows.map((row) => row.consultant_id).filter((id): id is string => Boolean(id)))];
    const consultantNames = await this.mapConsultantNames(consultantIds);
    return this.mapRows(rows, consultantNames);
  }

  async listUnassignedAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .is("consultant_id", null)
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return this.mapRows((data as unknown as AppointmentRow[]) ?? []);
  }

  async listConsultants(): Promise<ConsultantOption[]> {
    const { data, error } = await this.supabase.from("consultants").select("user_id, profiles(full_name)");
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = toList(row.profiles as { full_name: string } | { full_name: string }[] | null)[0];
      return { id: row.user_id, fullName: profile?.full_name ?? "Consultor" };
    });
  }

  async assignConsultant(appointmentId: string, consultantId: string): Promise<void> {
    const { error } = await this.supabase
      .from("appointments")
      .update({ consultant_id: consultantId })
      .eq("id", appointmentId);
    if (error) throw error;
  }

  async scheduleAppointment(leadId: string, scheduledAt: string): Promise<Appointment> {
    // Consultant is intentionally left unassigned here — a human picks one
    // later on the distribution page, the AI doesn't choose on its own.
    const { data, error } = await this.supabase
      .from("appointments")
      .insert({ lead_id: leadId, consultant_id: null, scheduled_at: scheduledAt, source: "ai_scheduled", status: "scheduled" })
      .select(APPOINTMENT_SELECT)
      .single();
    if (error) throw error;
    return this.mapRows([data as unknown as AppointmentRow])[0];
  }

  private async mapConsultantNames(consultantIds: string[]): Promise<Map<string, string>> {
    if (consultantIds.length === 0) return new Map();
    const { data } = await this.supabase.from("profiles").select("id, full_name").in("id", consultantIds);
    return new Map((data ?? []).map((row) => [row.id, row.full_name]));
  }

  private mapRows(rows: AppointmentRow[], consultantNames: Map<string, string> = new Map()): Appointment[] {
    return rows.map((row) => {
      const lead = toList(row.leads)[0];
      return {
        id: row.id,
        leadId: row.lead_id,
        leadName: lead?.full_name ?? "Lead",
        consultantId: row.consultant_id,
        consultantName: row.consultant_id ? (consultantNames.get(row.consultant_id) ?? "Consultor") : null,
        scheduledAt: row.scheduled_at,
        durationMinutes: row.duration_minutes,
        status: row.status as Appointment["status"],
        source: row.source as Appointment["source"],
      };
    });
  }
}
