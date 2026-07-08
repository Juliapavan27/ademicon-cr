import type { AiProviderName, GenerateResponseInput, GenerateResponseOutput } from "./types";

/**
 * Provider-agnostic contract for the commercial AI agent.
 * Implementations (anthropic-provider.ts, openai-provider.ts) wrap the
 * Vercel AI SDK so the app/conversation orchestrator never depends on a
 * specific vendor SDK. Concrete providers ship in Fase 4 (IA Comercial),
 * alongside the WhatsApp integration that consumes them.
 */
export interface LlmProvider {
  readonly name: AiProviderName;
  generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput>;
}
