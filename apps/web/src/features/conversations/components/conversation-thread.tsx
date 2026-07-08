"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConversationMessages, useFeedbackForDecisions } from "../hooks/use-conversation-messages";
import { MessageFeedback } from "./message-feedback";
import type { AiFeedback, MessageSenderType } from "../domain/conversation";

const SENDER_LABELS: Record<MessageSenderType, string> = {
  lead: "Lead",
  ai: "IA",
  human_agent: "Consultor",
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function ConversationThread({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useConversationMessages(conversationId);

  const aiDecisionIds = useMemo(
    () => (messages ?? []).flatMap((message) => (message.aiDecisionId ? [message.aiDecisionId] : [])),
    [messages],
  );
  const { data: feedbackList } = useFeedbackForDecisions(aiDecisionIds);

  const feedbackByDecisionId = useMemo(() => {
    const map = new Map<string, AiFeedback>();
    for (const feedback of feedbackList ?? []) {
      map.set(feedback.aiDecisionId, feedback);
    }
    return map;
  }, [feedbackList]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-2/3 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const isLead = message.senderType === "lead";
        return (
          <div key={message.id} className={cn("flex flex-col gap-1", isLead ? "items-start" : "items-end")}>
            <div
              className={cn(
                "max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm",
                isLead ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {SENDER_LABELS[message.senderType]} · {formatTime(message.createdAt)}
            </span>
            {message.senderType === "ai" && message.aiDecisionId && (
              <MessageFeedback
                conversationId={conversationId}
                aiDecisionId={message.aiDecisionId}
                feedback={feedbackByDecisionId.get(message.aiDecisionId)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
