import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { AgendaRepository } from "../domain/agenda-repository";
import type { Appointment } from "../domain/appointment";

function toList<T>(relation: T | T[] | null | undefined): T[] {
  if (!relation) return [];
  return Array.isArray(relation) ? relation : [relation];
}

export class SupabaseAgendaRepository implements AgendaRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from("appointments")
      .select("id, lead_id, consultant_id, scheduled_at, duration_minutes, status, source, leads(full_name)")
      .order("scheduled_at", { ascending: true });
    if (error) throw error;

    const consultantIds = [...new Set((data ?? []).map((row) => row.consultant_id))];
    const consultantNames = await this.mapConsultantNames(consultantIds);

    return (data ?? []).map((row) => {
      const lead = toList(row.leads as { full_name: string } | { full_name: string }[] | null)[0];
      return {
        id: row.id,
        leadId: row.lead_id,
        leadName: lead?.full_name ?? "Lead",
        consultantId: row.consultant_id,
        consultantName: consultantNames.get(row.consultant_id) ?? "Consultor",
        scheduledAt: row.scheduled_at,
        durationMinutes: row.duration_minutes,
        status: row.status as Appointment["status"],
        source: row.source as Appointment["source"],
      };
    });
  }

  async scheduleAppointment(leadId: string, scheduledAt: string): Promise<Appointment> {
    const { data: consultant } = await this.supabase.from("consultants").select("user_id").limit(1).maybeSingle();
    if (!consultant) throw new Error("Nenhum consultor disponível para receber o agendamento.");

    const { data, error } = await this.supabase
      .from("appointments")
      .insert({
        lead_id: leadId,
        consultant_id: consultant.user_id,
        scheduled_at: scheduledAt,
        source: "ai_scheduled",
        status: "scheduled",
      })
      .select("id, lead_id, consultant_id, scheduled_at, duration_minutes, status, source, leads(full_name)")
      .single();
    if (error) throw error;

    const consultantNames = await this.mapConsultantNames([data.consultant_id]);
    const lead = toList(data.leads as { full_name: string } | { full_name: string }[] | null)[0];

    return {
      id: data.id,
      leadId: data.lead_id,
      leadName: lead?.full_name ?? "Lead",
      consultantId: data.consultant_id,
      consultantName: consultantNames.get(data.consultant_id) ?? "Consultor",
      scheduledAt: data.scheduled_at,
      durationMinutes: data.duration_minutes,
      status: data.status as Appointment["status"],
      source: data.source as Appointment["source"],
    };
  }

  private async mapConsultantNames(consultantIds: string[]): Promise<Map<string, string>> {
    if (consultantIds.length === 0) return new Map();
    const { data } = await this.supabase.from("profiles").select("id, full_name").in("id", consultantIds);
    return new Map((data ?? []).map((row) => [row.id, row.full_name]));
  }
}
