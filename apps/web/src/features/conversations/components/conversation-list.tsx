"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationStatus, ConversationSummary } from "../domain/conversation";

const STATUS_LABELS: Record<ConversationStatus, string> = {
  open: "Em aberto",
  stalled: "Parada",
  closed: "Encerrada",
  handed_off: "Repassada",
};

const STATUS_VARIANTS: Record<ConversationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  stalled: "destructive",
  closed: "outline",
  handed_off: "secondary",
};

function formatTimestamp(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  if (conversations.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onSelect(conversation.id)}
          className={cn(
            "flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted",
            selectedId === conversation.id ? "border-primary bg-muted" : "border-transparent",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-medium">{conversation.leadName}</span>
            <Badge variant={STATUS_VARIANTS[conversation.status]} className="shrink-0 text-xs">
              {STATUS_LABELS[conversation.status]}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{formatTimestamp(conversation.lastMessageAt)}</span>
        </button>
      ))}
    </div>
  );
}
