import { z } from "zod";
import type { ToolSchema } from "../core/types";

const parameters = z.object({
  summary: z.string().describe("Resumo objetivo da conversa até agora, em português, para o consultor humano."),
});

export type SummarizeConversationArgs = z.infer<typeof parameters>;

export const summarizeConversationTool: ToolSchema<SummarizeConversationArgs> = {
  name: "summarize_conversation",
  description: "Gera um resumo curto da conversa para o consultor entender rapidamente o contexto sem ler tudo.",
  parameters,
};
