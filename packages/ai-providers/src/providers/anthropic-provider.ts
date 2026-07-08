import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, tool as buildTool, type ToolSet } from "ai";
import type { LlmProvider } from "../core/LlmProvider";
import type { GenerateResponseInput, GenerateResponseOutput, ToolCallResult } from "../core/types";

const DEFAULT_MODEL = "claude-sonnet-4-5";

function buildToolSet(input: GenerateResponseInput): ToolSet {
  const tools: ToolSet = {};
  for (const schema of input.tools ?? []) {
    const handler = input.handlers?.[schema.name];
    tools[schema.name] = buildTool({
      description: schema.description,
      parameters: schema.parameters,
      execute: async (args: Record<string, unknown>) =>
        handler ? handler(args) : { error: `Nenhum handler registrado para ${schema.name}` },
    });
  }
  return tools;
}

export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic" as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
    const anthropic = createAnthropic({ apiKey: this.apiKey });

    const result = await generateText({
      model: anthropic(this.model),
      system: input.system,
      messages: input.messages,
      tools: buildToolSet(input),
      maxSteps: 4,
    });

    const toolCalls: ToolCallResult[] = [];
    for (const step of result.steps) {
      for (const call of step.toolCalls) {
        const toolResult = step.toolResults.find(
          (r: { toolCallId: string }) => r.toolCallId === call.toolCallId,
        ) as { result?: unknown } | undefined;
        toolCalls.push({
          toolName: call.toolName,
          args: call.args as Record<string, unknown>,
          result: toolResult?.result,
        });
      }
    }

    return {
      text: result.text,
      toolCalls,
      model: this.model,
      provider: this.name,
    };
  }
}
