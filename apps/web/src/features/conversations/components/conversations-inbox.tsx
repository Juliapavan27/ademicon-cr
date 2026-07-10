"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "../hooks/use-conversations";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";

export function ConversationsInbox() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations();
  const selectedConversation = conversations?.find((conversation) => conversation.id === selectedId);

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-[320px_1fr] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex min-w-0 flex-col overflow-hidden border-r">
        <div className="border-b p-3">
          <h2 className="text-sm font-semibold">Conversas</h2>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <ConversationList conversations={conversations ?? []} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden">
        {selectedConversation ? (
          <ConversationThread conversationId={selectedConversation.id} leadId={selectedConversation.leadId} />
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
