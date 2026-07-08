import { z } from "zod";
import type { ToolSchema } from "../core/types";

const parameters = z.object({
  title: z.string().describe("Título curto e acionável da tarefa, em português."),
  dueDate: z.string().optional().describe("Data limite no formato ISO 8601, se mencionada ou implícita."),
});

export type CreateTaskArgs = z.infer<typeof parameters>;

export const createTaskTool: ToolSchema<CreateTaskArgs> = {
  name: "create_task",
  description:
    "Cria uma tarefa de acompanhamento para o consultor quando a conversa indica uma ação humana necessária (ex.: ligar, confirmar um horário, enviar um documento).",
  parameters,
};
