import type { AiProviderName } from "./types";
import type { LlmProvider } from "./LlmProvider";
import { AnthropicProvider } from "../providers/anthropic-provider";
import { OpenAiProvider } from "../providers/openai-provider";
import { MockProvider } from "../providers/mock-provider";

export interface ProviderFactoryEnv {
  AI_PROVIDER?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

/**
 * Resolves the active LLM provider from config. Falls back to `MockProvider`
 * when no key is configured for the requested provider, so the rest of the
 * pipeline (Edge Function, tool handlers, ai_decisions logging) stays fully
 * testable before a real Anthropic/OpenAI key exists — see ADR 0003/0005.
 */
export class ProviderFactory {
  static resolve(env: ProviderFactoryEnv): LlmProvider {
    const requested = ProviderFactory.requestedProviderName(env);

    if (requested === "anthropic" && env.ANTHROPIC_API_KEY) {
      return new AnthropicProvider(env.ANTHROPIC_API_KEY);
    }
    if (requested === "openai" && env.OPENAI_API_KEY) {
      return new OpenAiProvider(env.OPENAI_API_KEY);
    }
    return new MockProvider();
  }

  static requestedProviderName(env: ProviderFactoryEnv): AiProviderName {
    return env.AI_PROVIDER === "openai" ? "openai" : "anthropic";
  }
}
