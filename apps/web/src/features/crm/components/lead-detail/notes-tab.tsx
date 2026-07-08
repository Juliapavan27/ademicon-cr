"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote, useNotes } from "../../hooks/use-lead-detail";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function NotesTab({ leadId }: { leadId: string }) {
  const { data: notes, isLoading } = useNotes(leadId);
  const createNote = useCreateNote(leadId);
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createNote.mutateAsync(content);
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar nota.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Escreva uma nota..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
        />
        <Button type="submit" size="sm" className="self-end" disabled={createNote.isPending}>
          {createNote.isPending ? "Salvando..." : "Adicionar nota"}
        </Button>
      </form>
      <div className="flex flex-col gap-3">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {notes?.map((note) => (
          <div key={note.id} className="rounded-lg border bg-card p-3 text-sm">
            <p className="whitespace-pre-wrap">{note.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {note.isAiGenerated ? "IA" : note.authorName ?? "—"} · {formatDateTime(note.createdAt)}
            </p>
          </div>
        ))}
        {!isLoading && notes?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
        )}
      </div>
    </div>
  );
}
