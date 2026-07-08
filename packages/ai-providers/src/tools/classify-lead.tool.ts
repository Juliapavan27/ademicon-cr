import { z } from "zod";
import type { ToolSchema } from "../core/types";

const parameters = z.object({
  score: z.number().min(0).max(100).describe("Pontuação de 0 a 100 indicando o quão qualificado está o lead."),
  motivo: z.string().describe("Justificativa curta para a pontuação, em português."),
});

export type ClassifyLeadArgs = z.infer<typeof parameters>;

export const classifyLeadTool: ToolSchema<ClassifyLeadArgs> = {
  name: "classify_lead",
  description:
    "Classifica o nível de qualificação do lead com base na conversa até agora, registrando uma pontuação de 0 a 100.",
  parameters,
};
