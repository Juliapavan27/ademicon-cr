import { describe, expect, it, vi } from "vitest";
import { MockProvider } from "./mock-provider";

describe("MockProvider", () => {
  it("classifies the lead when a classify_lead handler is provided", async () => {
    const classifyHandler = vi.fn().mockResolvedValue({ ok: true });
    const provider = new MockProvider();

    const output = await provider.generateResponse({
      messages: [{ role: "user", content: "Oi, quero saber mais sobre consórcio de imóvel" }],
      handlers: { classify_lead: classifyHandler },
    });

    expect(classifyHandler).toHaveBeenCalledTimes(1);
    expect(output.toolCalls).toHaveLength(1);
    expect(output.toolCalls[0]?.toolName).toBe("classify_lead");
    expect(output.provider).toBe("mock");
  });

  it("creates a task when the message mentions scheduling and a handler is provided", async () => {
    const createTaskHandler = vi.fn().mockResolvedValue({ id: "task-1" });
    const provider = new MockProvider();

    const output = await provider.generateResponse({
      messages: [{ role: "user", content: "Podemos agendar uma reunião amanhã?" }],
      handlers: { create_task: createTaskHandler },
    });

    expect(createTaskHandler).toHaveBeenCalledTimes(1);
    expect(output.toolCalls.some((call) => call.toolName === "create_task")).toBe(true);
  });

  it("schedules a meeting instead of creating a task when a schedule_meeting handler is provided", async () => {
    const createTaskHandler = vi.fn();
    const scheduleMeetingHandler = vi.fn().mockResolvedValue({ id: "appt-1" });
    const provider = new MockProvider();

    const output = await provider.generateResponse({
      messages: [{ role: "user", content: "Sim, pode agendar uma reunião comigo" }],
      handlers: { create_task: createTaskHandler, schedule_meeting: scheduleMeetingHandler },
    });

    expect(scheduleMeetingHandler).toHaveBeenCalledTimes(1);
    expect(createTaskHandler).not.toHaveBeenCalled();
    expect(output.toolCalls[0]?.toolName).toBe("schedule_meeting");
    expect(output.text.toLowerCase()).toContain("agendei");
  });

  it("replies with objection handling when the message mentions price", async () => {
    const provider = new MockProvider();
    const output = await provider.generateResponse({
      messages: [{ role: "user", content: "achei meio caro, quanto custa mesmo?" }],
    });

    expect(output.text.toLowerCase()).toContain("juros");
  });

  it("does not call handlers that were not supplied", async () => {
    const provider = new MockProvider();
    const output = await provider.generateResponse({
      messages: [{ role: "user", content: "oi" }],
    });

    expect(output.toolCalls).toHaveLength(0);
  });
});
