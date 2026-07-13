export type CadenceStepStatus = "pending" | "sent" | "skipped" | "cancelled";

export interface CadenceStep {
  id: string;
  leadId: string;
  stepNumber: number;
  messageText: string;
  scheduledAt: string;
  sentAt: string | null;
  status: CadenceStepStatus;
}

export interface NewCadenceStep {
  stepNumber: number;
  messageText: string;
  scheduledAt: string;
}
