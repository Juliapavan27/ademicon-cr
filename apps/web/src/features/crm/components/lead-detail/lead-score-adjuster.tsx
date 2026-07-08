"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lead } from "../../domain/lead";
import { useAdjustLeadScore } from "../../hooks/use-lead-detail";

export function LeadScoreAdjuster({ lead }: { lead: Lead }) {
  const [motivo, setMotivo] = useState("");
  const adjustScore = useAdjustLeadScore(lead.id);

  async function handleAdjust(delta: number) {
    if (!motivo.trim()) {
      toast.error("Informe o motivo do ajuste de score.");
      return;
    }
    try {
      await adjustScore.mutateAsync({ lead, delta, motivo });
      setMotivo("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao ajustar score.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled={adjustScore.isPending}
        onClick={() => handleAdjust(-5)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-10 text-center text-sm font-semibold">{lead.leadScore}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled={adjustScore.isPending}
        onClick={() => handleAdjust(5)}
      >
        <Plus className="size-3.5" />
      </Button>
      <Input
        placeholder="Motivo do ajuste"
        value={motivo}
        onChange={(event) => setMotivo(event.target.value)}
        className="h-8 flex-1"
      />
    </div>
  );
}
