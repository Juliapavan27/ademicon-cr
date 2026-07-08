"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useScoreHistory } from "../../hooks/use-lead-detail";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function HistoryTab({ leadId }: { leadId: string }) {
  const { data: history, isLoading } = useScoreHistory(leadId);

  if (isLoading) return <Skeleton className="h-16 w-full" />;

  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>;
  }

  return (
    <ol className="flex flex-col gap-3 border-l pl-4">
      {history.map((entry) => (
        <li key={entry.id} className="text-sm">
          <p>
            Score {entry.scoreAnterior} → <span className="font-semibold">{entry.scoreNovo}</span>
            {" · "}
            <span className="text-muted-foreground">{entry.motivo}</span>
          </p>
          <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
