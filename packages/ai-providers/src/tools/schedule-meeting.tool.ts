import { z } from "zod";
import type { ToolSchema } from "../core/types";

const parameters = z.object({
  proposedDateTime: z.string().describe("Data e hora propostas para a reunião, em ISO 8601."),
  motivo: z.string().describe("Resumo curto do porquê a reunião está sendo agendada, em português."),
});

export type ScheduleMeetingArgs = z.infer<typeof parameters>;

export const scheduleMeetingTool: ToolSchema<ScheduleMeetingArgs> = {
  name: "schedule_meeting",
  description:
    "Agenda uma reunião com um consultor humano quando o lead demonstra interesse claro em conversar ou avançar (ex.: pede para ligar, confirma um horário, aceita agendar).",
  parameters,
};
