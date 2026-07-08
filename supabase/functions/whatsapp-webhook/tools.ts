// Deno Edge Function runtime can't resolve the pnpm workspace package
// `@ademicon/ai-providers` (Node/pnpm module resolution vs. Deno's npm:
// specifiers don't mix reliably across the two runtimes). This file is an
// intentional, self-contained duplicate of the tool schemas defined there —
// see ADR 0005. Keep the `name`/`description`/shape in sync by hand if the
// Node-side definitions change.
import { z } from "npm:zod@3.24.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.47.10";

export const classifyLeadSchema = z.object({
  score: z.number().min(0).max(100).describe("Pontuação de 0 a 100 indicando o quão qualificado está o lead."),
  motivo: z.string().describe("Justificativa curta para a pontuação, em português."),
});

export const createTaskSchema = z.object({
  title: z.string().describe("Título curto e acionável da tarefa, em português."),
  dueDate: z.string().optional().describe("Data limite no formato ISO 8601, se mencionada ou implícita."),
});

export const updateCrmStageSchema = z.object({
  stageName: z
    .string()
    .describe("Nome exato do estágio do funil para onde mover o lead (ex.: 'Em Qualificação', 'Reunião Agendada')."),
});

export const summarizeConversationSchema = z.object({
  summary: z.string().describe("Resumo objetivo da conversa até agora, em português, para o consultor humano."),
});

export const TOOL_SCHEMAS = [
  {
    name: "classify_lead",
    description:
      "Classifica o nível de qualificação do lead com base na conversa até agora, registrando uma pontuação de 0 a 100.",
    parameters: classifyLeadSchema,
  },
  {
    name: "create_task",
    description:
      "Cria uma tarefa de acompanhamento para o consultor quando a conversa indica uma ação humana necessária.",
    parameters: createTaskSchema,
  },
  {
    name: "update_crm_stage",
    description: "Move o lead para outro estágio do funil quando a conversa deixa claro que ele avançou.",
    parameters: updateCrmStageSchema,
  },
  {
    name: "summarize_conversation",
    description: "Gera um resumo curto da conversa para o consultor entender rapidamente o contexto.",
    parameters: summarizeConversationSchema,
  },
] as const;

export interface ToolExecutionContext {
  supabase: SupabaseClient;
  leadId: string;
  conversationId: string;
  organizationId: string;
  llmProvider: string;
  llmModel: string;
}

/**
 * Builds the real DB-writing implementation for each tool, plus a matching
 * `ai_decisions` row per call — this is the "handler" layer ADR 0003
 * describes as living next to the caller, not inside the AI package itself.
 * Provider/model are fixed per call (known before we invoke the LLM), so
 * they're captured via closure rather than passed through `execute`, whose
 * signature must match the single-argument shape the AI SDK expects.
 */
export function buildToolHandlers(ctx: ToolExecutionContext) {
  async function logDecision(
    decisionType: string,
    inputContext: Record<string, unknown>,
    outputPayload: Record<string, unknown>,
  ) {
    await ctx.supabase.from("ai_decisions").insert({
      conversation_id: ctx.conversationId,
      decision_type: decisionType,
      input_context: inputContext,
      output_payload: outputPayload,
      llm_provider: ctx.llmProvider,
      llm_model: ctx.llmModel,
    });
  }

  return {
    classify_lead: async (args: z.infer<typeof classifyLeadSchema>) => {
      const { data: lead } = await ctx.supabase
        .from("leads")
        .select("lead_score")
        .eq("id", ctx.leadId)
        .single();
      const previousScore = lead?.lead_score ?? 0;

      await ctx.supabase.from("leads").update({ lead_score: args.score }).eq("id", ctx.leadId);
      await ctx.supabase.from("lead_score_history").insert({
        lead_id: ctx.leadId,
        score_anterior: previousScore,
        score_novo: args.score,
        motivo: args.motivo,
        gerado_por: "ai",
      });
      await logDecision("classify_lead", { previousScore }, args);
      return { ok: true, previousScore, newScore: args.score };
    },

    create_task: async (args: z.infer<typeof createTaskSchema>) => {
      const { data: task } = await ctx.supabase
        .from("tasks")
        .insert({
          organization_id: ctx.organizationId,
          title: args.title,
          due_date: args.dueDate ?? null,
          related_entity_type: "lead",
          related_entity_id: ctx.leadId,
        })
        .select("id")
        .single();
      await logDecision("create_task", {}, args);
      return { ok: true, taskId: task?.id };
    },

    update_crm_stage: async (args: z.infer<typeof updateCrmStageSchema>) => {
      const { data: stage } = await ctx.supabase
        .from("pipeline_stages")
        .select("id, is_won, is_lost")
        .ilike("name", args.stageName)
        .maybeSingle();

      if (!stage) {
        await logDecision("update_stage", {}, { ...args, error: "stage not found" });
        return { ok: false, error: `Estágio "${args.stageName}" não encontrado.` };
      }

      const status = stage.is_won ? "won" : stage.is_lost ? "lost" : "active";
      await ctx.supabase.from("leads").update({ current_stage_id: stage.id, status }).eq("id", ctx.leadId);
      await logDecision("update_stage", {}, { ...args, stageId: stage.id });
      return { ok: true, stageId: stage.id };
    },

    summarize_conversation: async (args: z.infer<typeof summarizeConversationSchema>) => {
      await ctx.supabase.from("conversation_summaries").insert({
        conversation_id: ctx.conversationId,
        summary_text: args.summary,
        generated_by_model: ctx.llmModel,
      });
      await logDecision("summarize", {}, args);
      return { ok: true };
    },
  };
}
