// Deno-side mirror of packages/ai-providers (see tools.ts for why this
// duplication exists — cross-runtime module resolution between pnpm/Node
// and Supabase Edge Functions' Deno runtime).
import { generateText, tool, type ToolSet } from "npm:ai@4.1.25";
import { createAnthropic } from "npm:@ai-sdk/anthropic@1.1.6";
import type { z } from "npm:zod@3.24.1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: z.ZodType;
}

export type ToolHandlers = Record<string, (args: Record<string, unknown>) => Promise<unknown>>;

export interface GenerateResult {
  text: string;
  toolCalls: { toolName: string; args: Record<string, unknown>; result: unknown }[];
  provider: "anthropic" | "mock";
  model: string;
}

const SCHEDULING_KEYWORDS = ["agendar", "reunião", "reuniao", "ligar", "call", "conversar"];
const PRICE_OBJECTION_KEYWORDS = ["caro", "preço", "preco", "valor", "quanto custa"];

async function generateWithMock(
  messages: ChatMessage[],
  handlers: ToolHandlers,
): Promise<GenerateResult> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const normalized = lastUserMessage.toLowerCase();
  const toolCalls: GenerateResult["toolCalls"] = [];

  if (handlers.classify_lead) {
    const args = { score: Math.min(100, 40 + normalized.length), motivo: "Classificação automática (mock)." };
    const result = await handlers.classify_lead(args);
    toolCalls.push({ toolName: "classify_lead", args, result });
  }

  if (SCHEDULING_KEYWORDS.some((kw) => normalized.includes(kw)) && handlers.create_task) {
    const args = { title: "Retornar contato para agendar reunião" };
    const result = await handlers.create_task(args);
    toolCalls.push({ toolName: "create_task", args, result });
  }

  let text: string;
  if (PRICE_OBJECTION_KEYWORDS.some((kw) => normalized.includes(kw))) {
    text =
      "Entendo a preocupação com o valor! O consórcio costuma sair bem mais em conta que financiamento, " +
      "porque você não paga juros — só uma taxa de administração. Posso te mostrar uma simulação rapidinho?";
  } else if (SCHEDULING_KEYWORDS.some((kw) => normalized.includes(kw))) {
    text = "Perfeito! Já vou pedir pra alguém do nosso time entrar em contato pra combinar o melhor horário. 🙂";
  } else {
    text =
      "Oi! Tudo bem? Vi seu interesse em consórcio por aqui. Me conta rapidinho: você está pensando em imóvel, " +
      "veículo ou outro bem? Assim já te ajudo direitinho.";
  }

  return { text, toolCalls, provider: "mock", model: "mock-v1" };
}

async function generateWithAnthropic(
  apiKey: string,
  system: string,
  messages: ChatMessage[],
  toolSchemas: ToolSchema[],
  handlers: ToolHandlers,
): Promise<GenerateResult> {
  const model = "claude-sonnet-4-5";
  const anthropic = createAnthropic({ apiKey });

  const tools: ToolSet = {};
  for (const schema of toolSchemas) {
    tools[schema.name] = tool({
      description: schema.description,
      parameters: schema.parameters,
      execute: async (args: Record<string, unknown>) =>
        handlers[schema.name] ? handlers[schema.name](args) : { error: `Sem handler para ${schema.name}` },
    });
  }

  const result = await generateText({ model: anthropic(model), system, messages, tools, maxSteps: 4 });

  const toolCalls: GenerateResult["toolCalls"] = [];
  for (const step of result.steps) {
    for (const call of step.toolCalls) {
      const toolResult = step.toolResults.find((r: { toolCallId: string }) => r.toolCallId === call.toolCallId) as
        | { result?: unknown }
        | undefined;
      toolCalls.push({ toolName: call.toolName, args: call.args as Record<string, unknown>, result: toolResult?.result });
    }
  }

  return { text: result.text, toolCalls, provider: "anthropic", model };
}

export async function generateReply(
  system: string,
  messages: ChatMessage[],
  toolSchemas: ToolSchema[],
  handlers: ToolHandlers,
): Promise<GenerateResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (apiKey) {
    return generateWithAnthropic(apiKey, system, messages, toolSchemas, handlers);
  }
  return generateWithMock(messages, handlers);
}
