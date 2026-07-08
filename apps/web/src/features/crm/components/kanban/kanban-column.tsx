"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { Lead, PipelineStage } from "../../domain/lead";
import { LeadCard } from "./lead-card";

export function KanbanColumn({
  stage,
  leads,
  onOpenLead,
}: {
  stage: PipelineStage;
  leads: Lead[];
  onOpenLead: (leadId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className="size-2 rounded-full" style={{ backgroundColor: stage.color ?? undefined }} />
        <h3 className="text-sm font-semibold">{stage.name}</h3>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors",
          isOver ? "border-primary bg-accent" : "border-transparent bg-muted",
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} />
        ))}
      </div>
    </div>
  );
}
