export type ConversationStatus = "open" | "stalled" | "closed" | "handed_off";

export interface ConversationSummary {
  id: string;
  leadId: string;
  leadName: string;
  channel: "whatsapp" | "webchat";
  status: ConversationStatus;
  lastMessageAt: string | null;
}

export type MessageSenderType = "lead" | "ai" | "human_agent";

export interface ConversationMessage {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  senderType: MessageSenderType;
  content: string;
  createdAt: string;
  aiDecisionId: string | null;
}

export type FeedbackType = "thumbs_up" | "thumbs_down" | "correction";

export interface AiFeedback {
  id: string;
  aiDecisionId: string;
  feedbackType: FeedbackType;
  correctionPayload: Record<string, unknown> | null;
  createdAt: string;
}
