import type { ConversationsRepository } from "../domain/conversations-repository";
import type { AiFeedback, ConversationMessage, ConversationSummary, FeedbackType } from "../domain/conversation";

export class ConversationsService {
  constructor(private readonly repository: ConversationsRepository) {}

  listConversations(): Promise<ConversationSummary[]> {
    return this.repository.listConversations();
  }

  listMessages(conversationId: string): Promise<ConversationMessage[]> {
    return this.repository.listMessages(conversationId);
  }

  async submitFeedback(
    aiDecisionId: string,
    feedbackType: FeedbackType,
    correctionText?: string,
  ): Promise<void> {
    if (feedbackType === "correction" && !correctionText?.trim()) {
      throw new Error("Descreva a correção antes de enviar.");
    }
    const payload = correctionText ? { correctedText: correctionText } : undefined;
    return this.repository.submitFeedback(aiDecisionId, feedbackType, payload);
  }

  listFeedbackForDecisions(aiDecisionIds: string[]): Promise<AiFeedback[]> {
    return this.repository.listFeedbackForDecisions(aiDecisionIds);
  }
}
