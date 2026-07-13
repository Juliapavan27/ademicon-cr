import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { CadenceRepository } from "../domain/cadence-repository";
import type { CadenceStep, NewCadenceStep } from "../domain/cadence";

export class SupabaseCadenceRepository implements CadenceRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createSteps(leadId: string, steps: NewCadenceStep[]): Promise<void> {
    const { error } = await this.supabase.from("outreach_cadence_steps").insert(
      steps.map((step) => ({
        lead_id: leadId,
        step_number: step.stepNumber,
        message_text: step.messageText,
        scheduled_at: step.scheduledAt,
      })),
    );
    if (error) throw error;
  }

  async listStepsForLead(leadId: string): Promise<CadenceStep[]> {
    const { data, error } = await this.supabase
      .from("outreach_cadence_steps")
      .select("id, lead_id, step_number, message_text, scheduled_at, sent_at, status")
      .eq("lead_id", leadId)
      .order("step_number", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      leadId: row.lead_id,
      stepNumber: row.step_number,
      messageText: row.message_text,
      scheduledAt: row.scheduled_at,
      sentAt: row.sent_at,
      status: row.status as CadenceStep["status"],
    }));
  }
}
