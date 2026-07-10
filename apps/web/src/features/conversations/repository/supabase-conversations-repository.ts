import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@ademicon/database-types";
import type { ConversationsRepository } from "../domain/conversations-repository";
import type {
  AiFeedback,
  ConversationMessage,
  ConversationSummary,
  FeedbackType,
  MessageSenderType,
} from "../domain/conversation";

function toList<T>(relation: T | T[] | null | undefined): T[] {
  if (!relation) return [];
  return Array.isArray(relation) ? relation : [relation];
}

export class SupabaseConversationsRepository implements ConversationsRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listConversations(): Promise<ConversationSummary[]> {
    const { data, error } = await this.supabase
      .from("conversations")
      .select("id, lead_id, channel, status, last_message_at, leads(full_name)")
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const lead = toList(row.leads as { full_name: string } | { full_name: string }[] | null)[0];
      return {
        id: row.id,
        leadId: row.lead_id,
        leadName: lead?.full_name ?? "Lead",
        channel: row.channel as ConversationSummary["channel"],
        status: row.status as ConversationSummary["status"],
        lastMessageAt: row.last_message_at,
      };
    });
  }

  async listMessages(conversationId: string): Promise<ConversationMessage[]> {
    const { data, error } = await this.supabase
      .from("messages")
      .select("id, conversation_id, direction, sender_type, content, created_at, ai_decisions(id)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const decision = toList(row.ai_decisions as { id: string } | { id: string }[] | null)[0];
      return {
        id: row.id,
        conversationId: row.conversation_id,
        direction: row.direction as ConversationMessage["direction"],
        senderType: row.sender_type as ConversationMessage["senderType"],
        content: row.content,
        createdAt: row.created_at,
        aiDecisionId: decision?.id ?? null,
      };
    });
  }

  async submitFeedback(
    aiDecisionId: string,
    feedbackType: FeedbackType,
    correctionPayload?: Record<string, unknown>,
  ): Promise<void> {
    const { data: profile } = await this.supabase.auth.getUser();
    const { error } = await this.supabase.from("ai_learning_feedback").insert({
      ai_decision_id: aiDecisionId,
      feedback_type: feedbackType,
      corrected_by: profile.user?.id,
      correction_payload: (correctionPayload as Json) ?? null,
    });
    if (error) throw error;
  }

  async listFeedbackForDecisions(aiDecisionIds: string[]): Promise<AiFeedback[]> {
    if (aiDecisionIds.length === 0) return [];
    const { data, error } = await this.supabase
      .from("ai_learning_feedback")
      .select("id, ai_decision_id, feedback_type, correction_payload, created_at")
      .in("ai_decision_id", aiDecisionIds);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      aiDecisionId: row.ai_decision_id,
      feedbackType: row.feedback_type as FeedbackType,
      correctionPayload: row.correction_payload as Record<string, unknown> | null,
      createdAt: row.created_at,
    }));
  }

  async findOrCreateOutboundConversation(leadId: string, leadPhone: string | null): Promise<string> {
    const { data: existing } = await this.supabase
      .from("conversations")
      .select("id")
      .eq("lead_id", leadId)
      .eq("channel", "whatsapp")
      .neq("status", "closed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return existing.id;

    const { data, error } = await this.supabase
      .from("conversations")
      .insert({
        lead_id: leadId,
        channel: "whatsapp",
        status: "open",
        external_thread_id: leadPhone,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  async insertMessage(
    conversationId: string,
    direction: "inbound" | "outbound",
    senderType: MessageSenderType,
    content: string,
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({ conversation_id: conversationId, direction, sender_type: senderType, content })
      .select("id")
      .single();
    if (error) throw error;

    await this.supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data.id;
  }

  async insertAiDecision(
    conversationId: string,
    messageId: string,
    decisionType: string,
    inputContext: Record<string, unknown>,
    outputPayload: Record<string, unknown>,
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from("ai_decisions")
      .insert({
        conversation_id: conversationId,
        message_id: messageId,
        decision_type: decisionType,
        input_context: inputContext as Json,
        output_payload: outputPayload as Json,
        llm_provider: "mock",
        llm_model: "mock-v1",
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }
}
