"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLead } from "../../hooks/use-lead-detail";
import { AttachmentsTab } from "./attachments-tab";
import { DealValueEditor } from "./deal-value-editor";
import { HistoryTab } from "./history-tab";
import { InitiateContactButton } from "./initiate-contact-button";
import { LeadScoreAdjuster } from "./lead-score-adjuster";
import { LeadTagsEditor } from "./lead-tags-editor";
import { NotesTab } from "./notes-tab";
import { TasksTab } from "./tasks-tab";

export function LeadDetailSheet({
  leadId,
  onClose,
}: {
  leadId: string | null;
  onClose: () => void;
}) {
  const { data: lead, isLoading } = useLead(leadId ?? "");

  return (
    <Sheet open={Boolean(leadId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {isLoading && (
          <div className="flex flex-col gap-4 p-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.fullName}</SheetTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {lead.company && <span>{lead.company}</span>}
                {lead.email && <span>{lead.email}</span>}
                {lead.phone && <span>{lead.phone}</span>}
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-4">
              <InitiateContactButton leadId={lead.id} />
              <LeadScoreAdjuster lead={lead} />
              <DealValueEditor lead={lead} />
              <LeadTagsEditor lead={lead} />
              <Tabs defaultValue="notas">
                <TabsList className="w-full">
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
                  <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                </TabsList>
                <TabsContent value="notas">
                  <NotesTab leadId={lead.id} />
                </TabsContent>
                <TabsContent value="tarefas">
                  <TasksTab lead={lead} />
                </TabsContent>
                <TabsContent value="arquivos">
                  <AttachmentsTab lead={lead} />
                </TabsContent>
                <TabsContent value="historico">
                  <HistoryTab leadId={lead.id} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
