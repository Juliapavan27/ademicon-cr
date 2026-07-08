"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLeadInput } from "../domain/crm-repository";
import type { Lead, PipelineStage } from "../domain/lead";
import { useCrmService } from "./use-crm-service";
import { crmKeys } from "./query-keys";

export function usePipelineStages() {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.stages,
    queryFn: () => crmService.listPipelineStages(),
  });
}

export function useLeads() {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.leads,
    queryFn: () => crmService.listLeads(),
  });
}

export function useCreateLead() {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadInput) => crmService.createLead(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.leads }),
  });
}

export function useMoveLeadStage() {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, targetStage }: { leadId: string; targetStage: PipelineStage }) =>
      crmService.moveLeadStage(leadId, targetStage),
    onMutate: async ({ leadId, targetStage }) => {
      await queryClient.cancelQueries({ queryKey: crmKeys.leads });
      const previousLeads = queryClient.getQueryData<Lead[]>(crmKeys.leads);

      queryClient.setQueryData<Lead[]>(crmKeys.leads, (leads) =>
        leads?.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                currentStageId: targetStage.id,
                status: targetStage.isWon ? "won" : targetStage.isLost ? "lost" : "active",
              }
            : lead,
        ),
      );

      return { previousLeads };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(crmKeys.leads, context.previousLeads);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: crmKeys.leads }),
  });
}
