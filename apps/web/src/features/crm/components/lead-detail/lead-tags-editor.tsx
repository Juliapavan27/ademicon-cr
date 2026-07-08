"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Lead } from "../../domain/lead";
import { useAssignTag, useCreateTag, useRemoveTag, useTags } from "../../hooks/use-lead-detail";

export function LeadTagsEditor({ lead }: { lead: Lead }) {
  const { data: tags } = useTags();
  const assignTag = useAssignTag(lead.id);
  const removeTag = useRemoveTag(lead.id);
  const createTag = useCreateTag();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const availableTags = (tags ?? []).filter((tag) => !lead.tags.some((t) => t.id === tag.id));

  async function handleCreateAndAssign(event: React.FormEvent) {
    event.preventDefault();
    try {
      const tag = await createTag.mutateAsync({ name: newTagName });
      await assignTag.mutateAsync(tag.id);
      setNewTagName("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar tag.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {lead.tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
          {tag.name}
          <button
            type="button"
            aria-label={`Remover tag ${tag.name}`}
            onClick={() => removeTag.mutate(tag.id)}
            className="rounded-full hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-6" aria-label="Adicionar tag">
            <Plus className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <div className="flex flex-col gap-1">
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  assignTag.mutate(tag.id);
                  setOpen(false);
                }}
              >
                {tag.name}
              </Button>
            ))}
            <form onSubmit={handleCreateAndAssign} className="flex gap-1 border-t pt-2">
              <Input
                autoFocus
                placeholder="Nova tag..."
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                className="h-7 text-xs"
              />
              <Button type="submit" size="sm" className="h-7 shrink-0 px-2" disabled={!newTagName.trim()}>
                Criar
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
