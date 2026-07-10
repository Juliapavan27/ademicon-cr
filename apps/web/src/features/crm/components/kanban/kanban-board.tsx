"use client";

import { useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads, useMoveLeadStage, usePipelineStages } from "../../hooks/use-leads";
import { LeadDetailSheet } from "../lead-detail/lead-detail-sheet";
import { CreateLeadDialog } from "./create-lead-dialog";
import { ImportLeadsDialog } from "./import-leads-dialog";
import { KanbanColumn } from "./kanban-column";

export function KanbanBoard() {
  const { data: stages, isLoading: stagesLoading } = usePipelineStages();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const moveLeadStage = useMoveLeadStage();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const targetStageId = over.id as string;
    const targetStage = stages?.find((stage) => stage.id === targetStageId);
    const lead = leads?.find((l) => l.id === leadId);

    if (!targetStage || !lead || lead.currentStageId === targetStage.id) return;

    moveLeadStage.mutate({ leadId, targetStage });
  }

  if (stagesLoading || leadsLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <ImportLeadsDialog />
        <CreateLeadDialog />
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages?.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leads?.filter((lead) => lead.currentStageId === stage.id) ?? []}
              onOpenLead={setSelectedLeadId}
            />
          ))}
        </div>
      </DndContext>
      <LeadDetailSheet leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
    </div>
  );
}
