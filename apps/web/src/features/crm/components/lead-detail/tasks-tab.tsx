"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead } from "../../domain/lead";
import { useCreateTask, useSetTaskStatus, useTasks } from "../../hooks/use-lead-detail";

export function TasksTab({ lead }: { lead: Lead }) {
  const { data: tasks, isLoading } = useTasks(lead.id);
  const createTask = useCreateTask(lead.id);
  const setTaskStatus = useSetTaskStatus(lead.id);
  const [title, setTitle] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createTask.mutateAsync({ organizationId: lead.organizationId, title });
      setTitle("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar tarefa.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Nova tarefa..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Button type="submit" size="sm" disabled={createTask.isPending}>
          Adicionar
        </Button>
      </form>
      <div className="flex flex-col gap-2">
        {isLoading && <Skeleton className="h-10 w-full" />}
        {tasks?.map((task) => (
          <label
            key={task.id}
            className="flex items-center gap-2 rounded-lg border bg-card p-2.5 text-sm"
          >
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={(checked) =>
                setTaskStatus.mutate({ taskId: task.id, status: checked ? "done" : "pending" })
              }
            />
            <span className={task.status === "done" ? "text-muted-foreground line-through" : ""}>
              {task.title}
            </span>
          </label>
        ))}
        {!isLoading && tasks?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>
        )}
      </div>
    </div>
  );
}
