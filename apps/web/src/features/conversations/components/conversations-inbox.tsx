"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";

export function ConversationsInbox() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-[320px_1fr] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex min-w-0 flex-col overflow-hidden border-r">
        <div className="border-b p-3">
          <h2 className="text-sm font-semibold">Conversas</h2>
        </div>
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden">
        {selectedId ? (
          <ConversationThread conversationId={selectedId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">Selecione uma conversa para ver o histórico</p>
          </div>
        )}
      </div>
    </div>
  );
}
