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

const MIN_SCORE = 0;
const MAX_SCORE = 100;

export class CrmService {
  constructor(private readonly repository: CrmRepository) {}

  listPipelineStages(): Promise<PipelineStage[]> {
    return this.repository.listPipelineStages();
  }

  listLeads(): Promise<Lead[]> {
    return this.repository.listLeads();
  }

  getLead(leadId: string): Promise<Lead | null> {
    return this.repository.getLead(leadId);
  }

  async createLead(input: CreateLeadInput): Promise<Lead> {
    if (!input.fullName.trim()) {
      throw new Error("Nome do lead é obrigatório.");
    }
    return this.repository.createLead(input);
  }

  /**
   * Landing on a "ganho"/"perdido" stage updates the lead's overall status to
   * match — the funnel stage and the lead status would otherwise drift apart
   * (e.g. a lead sitting in "Ganho" but still marked "active").
   */
  async moveLeadStage(leadId: string, targetStage: PipelineStage): Promise<void> {
    const status = targetStage.isWon ? "won" : targetStage.isLost ? "lost" : "active";
    await this.repository.moveLeadStage(leadId, targetStage.id, status);
    if (targetStage.isWon) await this.repository.markDealOutcome(leadId, "won");
    if (targetStage.isLost) await this.repository.markDealOutcome(leadId, "lost");
  }

  async adjustLeadScore(lead: Lead, delta: number, motivo: string): Promise<void> {
    if (!motivo.trim()) {
      throw new Error("Informe o motivo do ajuste de score.");
    }
    const clampedDelta = Math.max(MIN_SCORE - lead.leadScore, Math.min(MAX_SCORE - lead.leadScore, delta));
    if (clampedDelta === 0) {
      throw new Error(`Score já está no limite (${lead.leadScore}).`);
    }
    return this.repository.adjustLeadScore(lead.id, lead.leadScore, clampedDelta, motivo);
  }

  listTags(): Promise<Tag[]> {
    return this.repository.listTags();
  }

  async createTag(name: string, color?: string): Promise<Tag> {
    if (!name.trim()) throw new Error("Nome da tag é obrigatório.");
    return this.repository.createTag(name, color);
  }

  assignTag(leadId: string, tagId: string): Promise<void> {
    return this.repository.assignTag(leadId, tagId);
  }

  removeTag(leadId: string, tagId: string): Promise<void> {
    return this.repository.removeTag(leadId, tagId);
  }

  listNotes(leadId: string): Promise<Note[]> {
    return this.repository.listNotes(leadId);
  }

  async createNote(leadId: string, content: string): Promise<void> {
    if (!content.trim()) throw new Error("A nota não pode estar vazia.");
    return this.repository.createNote(leadId, content);
  }

  listAttachments(leadId: string): Promise<Attachment[]> {
    return this.repository.listAttachments(leadId);
  }

  uploadAttachment(leadId: string, organizationId: string, file: File): Promise<void> {
    return this.repository.uploadAttachment(leadId, organizationId, file);
  }

  getAttachmentUrl(storagePath: string): Promise<string> {
    return this.repository.getAttachmentUrl(storagePath);
  }

  deleteAttachment(attachmentId: string, storagePath: string): Promise<void> {
    return this.repository.deleteAttachment(attachmentId, storagePath);
  }

  listTasks(leadId: string): Promise<CrmTask[]> {
    return this.repository.listTasks(leadId);
  }

  async createTask(
    leadId: string,
    organizationId: string,
    input: { title: string; dueDate?: string },
  ): Promise<void> {
    if (!input.title.trim()) throw new Error("Título da tarefa é obrigatório.");
    return this.repository.createTask(leadId, organizationId, input);
  }

  setTaskStatus(taskId: string, status: CrmTask["status"]): Promise<void> {
    return this.repository.setTaskStatus(taskId, status);
  }

  listScoreHistory(leadId: string): Promise<LeadScoreHistoryEntry[]> {
    return this.repository.listScoreHistory(leadId);
  }

  getDeal(leadId: string): Promise<Deal | null> {
    return this.repository.getDeal(leadId);
  }

  async setDealValue(leadId: string, organizationId: string, valorEstimado: number): Promise<void> {
    if (Number.isNaN(valorEstimado) || valorEstimado < 0) {
      throw new Error("Valor estimado deve ser um número positivo.");
    }
    return this.repository.upsertDealValue(leadId, organizationId, valorEstimado);
  }
}
