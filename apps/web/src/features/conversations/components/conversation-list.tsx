"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConversations } from "../hooks/use-conversations";
import type { ConversationStatus } from "../domain/conversation";

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
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-2">
      {data.map((conversation) => (
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
