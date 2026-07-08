"use client";

import { useEffect, useState } from "react";
import { Check, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lead } from "../../domain/lead";
import { useDeal, useSetDealValue } from "../../hooks/use-lead-detail";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DealValueEditor({ lead }: { lead: Lead }) {
  const { data: deal } = useDeal(lead.id);
  const setDealValue = useSetDealValue(lead.id);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(deal?.valorEstimado != null ? String(deal.valorEstimado) : "");
  }, [deal?.valorEstimado]);

  async function handleSave() {
    try {
      await setDealValue.mutateAsync({ organizationId: lead.organizationId, valorEstimado: Number(value) });
      setEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar valor estimado.");
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="size-3.5 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          step="0.01"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          className="h-7 w-28 text-xs"
        />
        <Button size="icon" className="size-7" disabled={setDealValue.isPending} onClick={handleSave}>
          <Check className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <DollarSign className="size-3.5" />
      {deal?.valorEstimado != null ? formatCurrency(deal.valorEstimado) : "Definir valor estimado"}
    </button>
  );
}
