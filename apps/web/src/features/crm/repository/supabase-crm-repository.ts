import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { CreateLeadInput, CrmRepository } from "../domain/crm-repository";
import type {
  Attachment,
  CrmTask,
  Deal,
  Lead,
  LeadScoreHistoryEntry,
  Note,
  PipelineStage,
  Tag,
} from "../domain/lead";

function toList<T>(relation: T | T[] | null | undefined): T[] {
  if (!relation) return [];
  return Array.isArray(relation) ? relation : [relation];
}

const LEAD_SELECT = "id, organization_id, full_name, email, phone, source, specialty_id, city_id, current_stage_id, assigned_consultant_id, lead_score, status, created_at, updated_at, lead_tags(tags(id, organization_id, name, color))";

type LeadRow = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  specialty_id: string | null;
  city_id: string | null;
  current_stage_id: string | null;
  assigned_consultant_id: string | null;
  lead_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  lead_tags: { tags: Tag | Tag[] | null }[];
};

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    organizationId: row.organization_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    source: row.source as Lead["source"],
    specialtyId: row.specialty_id,
    cityId: row.city_id,
    currentStageId: row.current_stage_id,
    assignedConsultantId: row.assigned_consultant_id,
    leadScore: row.lead_score,
    status: row.status as Lead["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.lead_tags.flatMap((entry) => toList(entry.tags)),
  };
}

export class SupabaseCrmRepository implements CrmRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listPipelineStages(): Promise<PipelineStage[]> {
    const { data, error } = await this.supabase
      .from("pipeline_stages")
      .select("id, organization_id, name, order_index, color, is_won, is_lost")
      .order("order_index");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      orderIndex: row.order_index,
      color: row.color,
      isWon: row.is_won,
      isLost: row.is_lost,
    }));
  }

  async listLeads(): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from("leads")
      .select(LEAD_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as LeadRow[] ?? []).map(mapLead);
  }

  async getLead(leadId: string): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from("leads")
      .select(LEAD_SELECT)
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapLead(data as unknown as LeadRow) : null;
  }

  async createLead(input: CreateLeadInput): Promise<Lead> {
    const { data: profile } = await this.supabase.auth.getUser();
    const userId = profile.user?.id;
    if (!userId) throw new Error("Sessão não carregada.");

    const { data: callerProfile, error: callerError } = await this.supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();
    if (callerError) throw callerError;

    let stageId = input.stageId;
    if (!stageId) {
      const { data: firstStage } = await this.supabase
        .from("pipeline_stages")
        .select("id")
        .order("order_index")
        .limit(1)
        .maybeSingle();
      stageId = firstStage?.id;
    }

    const { data, error } = await this.supabase
      .from("leads")
      .insert({
        organization_id: callerProfile.organization_id,
        full_name: input.fullName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        source: input.source ?? "manual",
        current_stage_id: stageId ?? null,
      })
      .select(LEAD_SELECT)
      .single();
    if (error) throw error;
    return mapLead(data as unknown as LeadRow);
  }

  async moveLeadStage(leadId: string, stageId: string, status?: Lead["status"]): Promise<void> {
    const { error } = await this.supabase
      .from("leads")
      .update({ current_stage_id: stageId, ...(status ? { status } : {}) })
      .eq("id", leadId);
    if (error) throw error;
  }

  async adjustLeadScore(leadId: string, currentScore: number, delta: number, motivo: string): Promise<void> {
    const newScore = currentScore + delta;
    const { error: updateError } = await this.supabase
      .from("leads")
      .update({ lead_score: newScore })
      .eq("id", leadId);
    if (updateError) throw updateError;

    const { error: historyError } = await this.supabase.from("lead_score_history").insert({
      lead_id: leadId,
      score_anterior: currentScore,
      score_novo: newScore,
      motivo,
      gerado_por: "manual",
    });
    if (historyError) throw historyError;
  }

  async listTags(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("id, organization_id, name, color")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      color: row.color,
    }));
  }

  async createTag(name: string, color?: string): Promise<Tag> {
    const { data: profile } = await this.supabase.auth.getUser();
    const userId = profile.user?.id;
    if (!userId) throw new Error("Sessão não carregada.");
    const { data: callerProfile, error: callerError } = await this.supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();
    if (callerError) throw callerError;

    const { data, error } = await this.supabase
      .from("tags")
      .insert({ organization_id: callerProfile.organization_id, name, color })
      .select("id, organization_id, name, color")
      .single();
    if (error) throw error;
    return { id: data.id, organizationId: data.organization_id, name: data.name, color: data.color };
  }

  async assignTag(leadId: string, tagId: string): Promise<void> {
    const { error } = await this.supabase.from("lead_tags").insert({ lead_id: leadId, tag_id: tagId });
    if (error) throw error;
  }

  async removeTag(leadId: string, tagId: string): Promise<void> {
    const { error } = await this.supabase
      .from("lead_tags")
      .delete()
      .eq("lead_id", leadId)
      .eq("tag_id", tagId);
    if (error) throw error;
  }

  async listNotes(leadId: string): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("id, lead_id, author_id, content, is_ai_generated, created_at, profiles(full_name)")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = toList(row.profiles as { full_name: string } | { full_name: string }[] | null)[0];
      return {
        id: row.id,
        leadId: row.lead_id,
        authorId: row.author_id,
        authorName: profile?.full_name ?? null,
        content: row.content,
        isAiGenerated: row.is_ai_generated,
        createdAt: row.created_at,
      };
    });
  }

  async createNote(leadId: string, content: string): Promise<void> {
    const { data: profile } = await this.supabase.auth.getUser();
    const { error } = await this.supabase
      .from("notes")
      .insert({ lead_id: leadId, content, author_id: profile.user?.id });
    if (error) throw error;
  }

  async listAttachments(leadId: string): Promise<Attachment[]> {
    const { data, error } = await this.supabase
      .from("attachments")
      .select("id, lead_id, uploaded_by, storage_path, file_name, mime_type, size_bytes, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      leadId: row.lead_id!,
      uploadedBy: row.uploaded_by,
      storagePath: row.storage_path,
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
    }));
  }

  async uploadAttachment(leadId: string, organizationId: string, file: File): Promise<void> {
    const { data: profile } = await this.supabase.auth.getUser();
    const storagePath = `${organizationId}/${leadId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await this.supabase.storage.from("attachments").upload(storagePath, file);
    if (uploadError) throw uploadError;

    const { error: insertError } = await this.supabase.from("attachments").insert({
      lead_id: leadId,
      uploaded_by: profile.user?.id,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    });
    if (insertError) throw insertError;
  }

  async getAttachmentUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from("attachments")
      .createSignedUrl(storagePath, 60 * 5);
    if (error) throw error;
    return data.signedUrl;
  }

  async deleteAttachment(attachmentId: string, storagePath: string): Promise<void> {
    const { error: storageError } = await this.supabase.storage.from("attachments").remove([storagePath]);
    if (storageError) throw storageError;
    const { error } = await this.supabase.from("attachments").delete().eq("id", attachmentId);
    if (error) throw error;
  }

  async listTasks(leadId: string): Promise<CrmTask[]> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("id, organization_id, title, description, related_entity_id, assigned_to, due_date, status, priority, created_by, created_at")
      .eq("related_entity_type", "lead")
      .eq("related_entity_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      title: row.title,
      description: row.description,
      leadId: row.related_entity_id!,
      assignedTo: row.assigned_to,
      dueDate: row.due_date,
      status: row.status as CrmTask["status"],
      priority: row.priority as CrmTask["priority"],
      createdBy: row.created_by,
      createdAt: row.created_at,
    }));
  }

  async createTask(
    leadId: string,
    organizationId: string,
    input: { title: string; dueDate?: string },
  ): Promise<void> {
    const { data: profile } = await this.supabase.auth.getUser();
    const { error } = await this.supabase.from("tasks").insert({
      organization_id: organizationId,
      title: input.title,
      due_date: input.dueDate ?? null,
      related_entity_type: "lead",
      related_entity_id: leadId,
      created_by: profile.user?.id,
      assigned_to: profile.user?.id,
    });
    if (error) throw error;
  }

  async setTaskStatus(taskId: string, status: CrmTask["status"]): Promise<void> {
    const { error } = await this.supabase.from("tasks").update({ status }).eq("id", taskId);
    if (error) throw error;
  }

  async listScoreHistory(leadId: string): Promise<LeadScoreHistoryEntry[]> {
    const { data, error } = await this.supabase
      .from("lead_score_history")
      .select("id, lead_id, score_anterior, score_novo, motivo, gerado_por, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      leadId: row.lead_id,
      scoreAnterior: row.score_anterior,
      scoreNovo: row.score_novo,
      motivo: row.motivo,
      geradoPor: row.gerado_por as LeadScoreHistoryEntry["geradoPor"],
      createdAt: row.created_at,
    }));
  }

  async getDeal(leadId: string): Promise<Deal | null> {
    const { data, error } = await this.supabase
      .from("deals")
      .select("id, lead_id, organization_id, valor_estimado, stage_id, won_at, lost_at, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      leadId: data.lead_id,
      organizationId: data.organization_id,
      valorEstimado: data.valor_estimado,
      stageId: data.stage_id,
      wonAt: data.won_at,
      lostAt: data.lost_at,
      createdAt: data.created_at,
    };
  }

  async upsertDealValue(leadId: string, organizationId: string, valorEstimado: number): Promise<void> {
    const existing = await this.getDeal(leadId);
    if (existing) {
      const { error } = await this.supabase
        .from("deals")
        .update({ valor_estimado: valorEstimado })
        .eq("id", existing.id);
      if (error) throw error;
      return;
    }

    const { data: lead } = await this.supabase
      .from("leads")
      .select("current_stage_id")
      .eq("id", leadId)
      .single();

    const { error } = await this.supabase.from("deals").insert({
      lead_id: leadId,
      organization_id: organizationId,
      valor_estimado: valorEstimado,
      stage_id: lead?.current_stage_id ?? null,
    });
    if (error) throw error;
  }

  async markDealOutcome(leadId: string, outcome: "won" | "lost"): Promise<void> {
    const existing = await this.getDeal(leadId);
    if (!existing) return;

    const { error } = await this.supabase
      .from("deals")
      .update(outcome === "won" ? { won_at: new Date().toISOString() } : { lost_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  }
}
