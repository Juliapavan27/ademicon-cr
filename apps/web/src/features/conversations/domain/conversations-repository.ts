import type { AiFeedback, ConversationMessage, ConversationSummary, FeedbackType } from "./conversation";

export interface ConversationsRepository {
  listConversations(): Promise<ConversationSummary[]>;
  listMessages(conversationId: string): Promise<ConversationMessage[]>;
  submitFeedback(
    aiDecisionId: string,
    feedbackType: FeedbackType,
    correctionPayload?: Record<string, unknown>,
  ): Promise<void>;
  listFeedbackForDecisions(aiDecisionIds: string[]): Promise<AiFeedback[]>;
}
