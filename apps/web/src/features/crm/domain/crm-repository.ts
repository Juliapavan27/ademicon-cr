import type {
  Attachment,
  CrmTask,
  Deal,
  Lead,
  LeadScoreHistoryEntry,
  LeadSource,
  LeadStatus,
  Note,
  PipelineStage,
  Tag,
} from "./lead";

export interface CreateLeadInput {
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  stageId?: string;
}

export interface CrmRepository {
  listPipelineStages(): Promise<PipelineStage[]>;
  listLeads(): Promise<Lead[]>;
  getLead(leadId: string): Promise<Lead | null>;
  createLead(input: CreateLeadInput): Promise<Lead>;
  moveLeadStage(leadId: string, stageId: string, status?: LeadStatus): Promise<void>;
  adjustLeadScore(leadId: string, currentScore: number, delta: number, motivo: string): Promise<void>;
  updateSuggestedApproach(leadId: string, approach: string): Promise<void>;

  getDeal(leadId: string): Promise<Deal | null>;
  upsertDealValue(leadId: string, organizationId: string, valorEstimado: number): Promise<void>;
  markDealOutcome(leadId: string, outcome: "won" | "lost"): Promise<void>;

  listTags(): Promise<Tag[]>;
  createTag(name: string, color?: string): Promise<Tag>;
  assignTag(leadId: string, tagId: string): Promise<void>;
  removeTag(leadId: string, tagId: string): Promise<void>;

  listNotes(leadId: string): Promise<Note[]>;
  createNote(leadId: string, content: string): Promise<void>;

  listAttachments(leadId: string): Promise<Attachment[]>;
  uploadAttachment(leadId: string, organizationId: string, file: File): Promise<void>;
  getAttachmentUrl(storagePath: string): Promise<string>;
  deleteAttachment(attachmentId: string, storagePath: string): Promise<void>;

  listTasks(leadId: string): Promise<CrmTask[]>;
  createTask(leadId: string, organizationId: string, input: { title: string; dueDate?: string }): Promise<void>;
  setTaskStatus(taskId: string, status: CrmTask["status"]): Promise<void>;

  listScoreHistory(leadId: string): Promise<LeadScoreHistoryEntry[]>;
}
