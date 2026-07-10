"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConversationMessages, useFeedbackForDecisions } from "../hooks/use-conversation-messages";
import { useSimulatePositiveReply } from "../hooks/use-outbound";
import { MessageFeedback } from "./message-feedback";
import type { AiFeedback, MessageSenderType } from "../domain/conversation";

const SENDER_LABELS: Record<MessageSenderType, string> = {
  lead: "Lead",
  ai: "IA",
  human_agent: "Consultor",
};

const DEMO_REPLIES = [
  "Sim, pode agendar uma reunião comigo!",
  "Legal, quero conversar com alguém sobre isso.",
  "Pode ligar pra mim amanhã pra combinar.",
];

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function ConversationThread({ conversationId, leadId }: { conversationId: string; leadId: string }) {
  const { data: messages, isLoading } = useConversationMessages(conversationId);
  const simulateReply = useSimulatePositiveReply(conversationId);
  const [replyIndex, setReplyIndex] = useState(0);

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

  async function handleSimulateReply() {
    const replyText = DEMO_REPLIES[replyIndex % DEMO_REPLIES.length];
    setReplyIndex((value) => value + 1);
    try {
      const result = await simulateReply.mutateAsync({ leadId, replyText });
      if (result.appointmentId) {
        toast.success("Reunião agendada automaticamente pela IA! Veja em Agenda.");
      } else {
        toast.success("Resposta da IA registrada.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao simular resposta.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-2/3 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {(!messages || messages.length === 0) && (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {messages?.map((message) => {
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
      <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">Ferramenta de demonstração — não envia WhatsApp real</span>
        <Button size="sm" variant="outline" onClick={handleSimulateReply} disabled={simulateReply.isPending}>
          {simulateReply.isPending ? "Simulando..." : "Simular resposta positiva do lead"}
        </Button>
      </div>
    </>
  );
}
