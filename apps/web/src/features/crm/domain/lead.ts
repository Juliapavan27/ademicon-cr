export type LeadSource = "whatsapp" | "site" | "indicacao" | "manual" | "import";
export type LeadStatus = "active" | "won" | "lost" | "archived";

export interface Lead {
  id: string;
  organizationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: LeadSource;
  specialtyId: string | null;
  cityId: string | null;
  currentStageId: string | null;
  assignedConsultantId: string | null;
  leadScore: number;
  status: LeadStatus;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  organizationId: string;
  name: string;
  orderIndex: number;
  color: string | null;
  isWon: boolean;
  isLost: boolean;
}

export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string | null;
}

export interface Note {
  id: string;
  leadId: string;
  authorId: string | null;
  authorName: string | null;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  leadId: string;
  uploadedBy: string | null;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export type TaskStatus = "pending" | "done" | "overdue";
export type TaskPriority = "low" | "normal" | "high";

export interface CrmTask {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  leadId: string;
  assignedTo: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string | null;
  createdAt: string;
}

export interface LeadScoreHistoryEntry {
  id: string;
  leadId: string;
  scoreAnterior: number;
  scoreNovo: number;
  motivo: string;
  geradoPor: "ai" | "system" | "manual";
  createdAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  organizationId: string;
  valorEstimado: number | null;
  stageId: string | null;
  wonAt: string | null;
  lostAt: string | null;
  createdAt: string;
}
