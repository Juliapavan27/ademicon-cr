import type { LlmProvider } from "../core/LlmProvider";
import type { GenerateResponseInput, GenerateResponseOutput, ToolCallResult } from "../core/types";

const SCHEDULING_KEYWORDS = ["agendar", "reunião", "reuniao", "ligar", "call", "conversar"];
const PRICE_OBJECTION_KEYWORDS = ["caro", "preço", "preco", "valor", "quanto custa"];

/**
 * Deterministic, rule-based stand-in for a real LLM provider — no API key,
 * no network call, no cost. Exists so the whole orchestration pipeline
 * (tool handlers, ai_decisions logging, WhatsApp reply) is buildable and
 * testable before an Anthropic/OpenAI key is available. It still calls the
 * real supplied handlers, so switching to a real provider later requires no
 * change to anything downstream of `generateResponse`.
 */
export class MockProvider implements LlmProvider {
  readonly name = "mock" as const;

  async generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
    const lastUserMessage = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const normalized = lastUserMessage.toLowerCase();
    const toolCalls: ToolCallResult[] = [];

    const classifyHandler = input.handlers?.classify_lead;
    if (classifyHandler) {
      const score = Math.min(100, 40 + normalized.length);
      const args = { score, motivo: "Classificação automática (mock) baseada no engajamento da mensagem." };
      const result = await classifyHandler(args);
      toolCalls.push({ toolName: "classify_lead", args, result });
    }

    let scheduledFor: Date | null = null;
    if (SCHEDULING_KEYWORDS.some((kw) => normalized.includes(kw))) {
      const scheduleMeetingHandler = input.handlers?.schedule_meeting;
      const createTaskHandler = input.handlers?.create_task;
      if (scheduleMeetingHandler) {
        scheduledFor = nextBusinessDayAt(14);
        const args = { proposedDateTime: scheduledFor.toISOString(), motivo: "Lead demonstrou interesse em conversar/agendar." };
        const result = await scheduleMeetingHandler(args);
        toolCalls.push({ toolName: "schedule_meeting", args, result });
      } else if (createTaskHandler) {
        const args = { title: "Retornar contato para agendar reunião", dueDate: undefined };
        const result = await createTaskHandler(args);
        toolCalls.push({ toolName: "create_task", args, result });
      }
    }

    let text: string;
    if (scheduledFor) {
      text = `Perfeito! Já agendei uma conversa com um dos nossos consultores para ${formatPtBr(scheduledFor)}. Qualquer imprevisto, me avisa por aqui. 🙂`;
    } else if (PRICE_OBJECTION_KEYWORDS.some((kw) => normalized.includes(kw))) {
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

    return {
      text,
      toolCalls,
      model: "mock-v1",
      provider: this.name,
    };
  }
}

function nextBusinessDayAt(hour: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(hour, 0, 0, 0);
  return date;
}

function formatPtBr(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
