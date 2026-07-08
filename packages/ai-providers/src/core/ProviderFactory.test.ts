import { describe, expect, it } from "vitest";
import { ProviderFactory } from "./ProviderFactory";
import { MockProvider } from "../providers/mock-provider";
import { AnthropicProvider } from "../providers/anthropic-provider";
import { OpenAiProvider } from "../providers/openai-provider";

describe("ProviderFactory.resolve", () => {
  it("falls back to MockProvider when no key is configured", () => {
    const provider = ProviderFactory.resolve({});
    expect(provider).toBeInstanceOf(MockProvider);
  });

  it("resolves AnthropicProvider when requested and a key is present", () => {
    const provider = ProviderFactory.resolve({ ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it("falls back to MockProvider when anthropic is requested without a key", () => {
    const provider = ProviderFactory.resolve({ AI_PROVIDER: "anthropic" });
    expect(provider).toBeInstanceOf(MockProvider);
  });

  it("resolves OpenAiProvider when explicitly requested with a key", () => {
    const provider = ProviderFactory.resolve({ AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(provider).toBeInstanceOf(OpenAiProvider);
  });

  it("defaults the requested provider name to anthropic", () => {
    expect(ProviderFactory.requestedProviderName({})).toBe("anthropic");
  });
});
