"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "../domain/lead";
import { useCrmService } from "./use-crm-service";
import { crmKeys } from "./query-keys";

export function useLead(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.lead(leadId),
    queryFn: () => crmService.getLead(leadId),
    enabled: Boolean(leadId),
  });
}

export function useDeal(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.deal(leadId),
    queryFn: () => crmService.getDeal(leadId),
    enabled: Boolean(leadId),
  });
}

export function useSetDealValue(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, valorEstimado }: { organizationId: string; valorEstimado: number }) =>
      crmService.setDealValue(leadId, organizationId, valorEstimado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.deal(leadId) }),
  });
}

export function useAdjustLeadScore(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lead, delta, motivo }: { lead: Lead; delta: number; motivo: string }) =>
      crmService.adjustLeadScore(lead, delta, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(leadId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
      queryClient.invalidateQueries({ queryKey: crmKeys.scoreHistory(leadId) });
    },
  });
}

export function useScoreHistory(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.scoreHistory(leadId),
    queryFn: () => crmService.listScoreHistory(leadId),
    enabled: Boolean(leadId),
  });
}

export function useTags() {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.tags,
    queryFn: () => crmService.listTags(),
  });
}

export function useCreateTag() {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) => crmService.createTag(name, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.tags }),
  });
}

export function useAssignTag(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => crmService.assignTag(leadId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(leadId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
    },
  });
}

export function useRemoveTag(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => crmService.removeTag(leadId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.lead(leadId) });
      queryClient.invalidateQueries({ queryKey: crmKeys.leads });
    },
  });
}

export function useNotes(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.notes(leadId),
    queryFn: () => crmService.listNotes(leadId),
    enabled: Boolean(leadId),
  });
}

export function useCreateNote(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => crmService.createNote(leadId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.notes(leadId) }),
  });
}

export function useAttachments(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.attachments(leadId),
    queryFn: () => crmService.listAttachments(leadId),
    enabled: Boolean(leadId),
  });
}

export function useUploadAttachment(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, file }: { organizationId: string; file: File }) =>
      crmService.uploadAttachment(leadId, organizationId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.attachments(leadId) }),
  });
}

export function useDeleteAttachment(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attachmentId, storagePath }: { attachmentId: string; storagePath: string }) =>
      crmService.deleteAttachment(attachmentId, storagePath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.attachments(leadId) }),
  });
}

export function useAttachmentUrl() {
  const crmService = useCrmService();
  return useMutation({
    mutationFn: (storagePath: string) => crmService.getAttachmentUrl(storagePath),
  });
}

export function useTasks(leadId: string) {
  const crmService = useCrmService();
  return useQuery({
    queryKey: crmKeys.tasks(leadId),
    queryFn: () => crmService.listTasks(leadId),
    enabled: Boolean(leadId),
  });
}

export function useCreateTask(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, title, dueDate }: { organizationId: string; title: string; dueDate?: string }) =>
      crmService.createTask(leadId, organizationId, { title, dueDate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.tasks(leadId) }),
  });
}

export function useSetTaskStatus(leadId: string) {
  const crmService = useCrmService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: "pending" | "done" | "overdue" }) =>
      crmService.setTaskStatus(taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.tasks(leadId) }),
  });
}
