import { z } from "zod";
import type { ToolSchema } from "../core/types";

const parameters = z.object({
  stageName: z
    .string()
    .describe(
      "Nome exato do estágio do funil para onde mover o lead (ex.: 'Em Qualificação', 'Reunião Agendada').",
    ),
});

export type UpdateCrmStageArgs = z.infer<typeof parameters>;

export const updateCrmStageTool: ToolSchema<UpdateCrmStageArgs> = {
  name: "update_crm_stage",
  description:
    "Move o lead para outro estágio do funil de vendas quando a conversa deixa claro que ele avançou (ex.: aceitou agendar uma reunião).",
  parameters,
};
