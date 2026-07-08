"use client";

import { useRef } from "react";
import { Download, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead } from "../../domain/lead";
import {
  useAttachmentUrl,
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "../../hooks/use-lead-detail";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export function AttachmentsTab({ lead }: { lead: Lead }) {
  const { data: attachments, isLoading } = useAttachments(lead.id);
  const uploadAttachment = useUploadAttachment(lead.id);
  const deleteAttachment = useDeleteAttachment(lead.id);
  const attachmentUrl = useAttachmentUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment.mutateAsync({ organizationId: lead.organizationId, file });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar arquivo.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleDownload(storagePath: string) {
    try {
      const url = await attachmentUrl.mutateAsync(storagePath);
      window.open(url, "_blank");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar link do arquivo.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-end"
        disabled={uploadAttachment.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="size-4" />
        {uploadAttachment.isPending ? "Enviando..." : "Anexar arquivo"}
      </Button>
      <div className="flex flex-col gap-2">
        {isLoading && <Skeleton className="h-10 w-full" />}
        {attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2.5 text-sm"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium">{attachment.fileName}</span>
              <span className="text-xs text-muted-foreground">{formatSize(attachment.sizeBytes)}</span>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleDownload(attachment.storagePath)}
              >
                <Download className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => deleteAttachment.mutate({ attachmentId: attachment.id, storagePath: attachment.storagePath })}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && attachments?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum arquivo ainda.</p>
        )}
      </div>
    </div>
  );
}
