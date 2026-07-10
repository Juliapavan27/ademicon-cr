import type { AiFeedback, ConversationMessage, ConversationSummary, FeedbackType, MessageSenderType } from "./conversation";

export interface ConversationsRepository {
  listConversations(): Promise<ConversationSummary[]>;
  listMessages(conversationId: string): Promise<ConversationMessage[]>;
  submitFeedback(
    aiDecisionId: string,
    feedbackType: FeedbackType,
    correctionPayload?: Record<string, unknown>,
  ): Promise<void>;
  listFeedbackForDecisions(aiDecisionIds: string[]): Promise<AiFeedback[]>;

  findOrCreateOutboundConversation(leadId: string, leadPhone: string | null): Promise<string>;
  insertMessage(
    conversationId: string,
    direction: "inbound" | "outbound",
    senderType: MessageSenderType,
    content: string,
  ): Promise<string>;
  insertAiDecision(
    conversationId: string,
    messageId: string,
    decisionType: string,
    inputContext: Record<string, unknown>,
    outputPayload: Record<string, unknown>,
  ): Promise<string>;
}
