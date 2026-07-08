"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Lead } from "../../domain/lead";

const SOURCE_LABELS: Record<Lead["source"], string> = {
  whatsapp: "WhatsApp",
  site: "Site",
  indicacao: "Indicação",
  manual: "Manual",
};

export function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: (leadId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(lead.id)}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{lead.fullName}</span>
        <Badge variant="outline" className="shrink-0 text-xs">
          {lead.leadScore}
        </Badge>
      </div>
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      <span className="text-xs text-muted-foreground">{SOURCE_LABELS[lead.source]}</span>
    </button>
  );
}
