import type { z } from "zod";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Schema-only tool description (name/description/zod shape). The actual
 * side-effecting implementation is supplied separately as a `ToolHandler` by
 * whoever calls the provider (the whatsapp-webhook Edge Function) — this
 * package stays framework/IO-free per ADR 0003, it never imports a Supabase
 * client itself.
 */
export interface ToolSchema<TArgs = Record<string, unknown>> {
  name: string;
  description: string;
  parameters: z.ZodType<TArgs>;
}

export type ToolHandler<TArgs = Record<string, unknown>> = (args: TArgs) => Promise<unknown>;

export type ToolHandlers = Record<string, ToolHandler>;

export interface ToolCallResult {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface GenerateResponseInput {
  messages: ChatMessage[];
  system?: string;
  tools?: ToolSchema[];
  handlers?: ToolHandlers;
}

export interface GenerateResponseOutput {
  text: string;
  toolCalls: ToolCallResult[];
  model: string;
  provider: AiProviderName;
  confidenceScore?: number;
}

export type AiProviderName = "anthropic" | "openai" | "mock";
