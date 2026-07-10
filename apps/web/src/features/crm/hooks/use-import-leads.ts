"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ParsedLeadRow } from "../domain/lead-import";
import type { ImportedLeadResult } from "../services/lead-import-service";
import { crmKeys } from "./query-keys";

interface ImportResponse {
  imported: number;
  results: ImportedLeadResult[];
}

export function useImportLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: ParsedLeadRow[]): Promise<ImportResponse> => {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao importar leads.");
      return data as ImportResponse;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.leads }),
  });
}
