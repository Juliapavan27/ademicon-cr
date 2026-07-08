import { describe, expect, it, vi } from "vitest";
import type { ConversationsRepository } from "../domain/conversations-repository";
import { ConversationsService } from "./conversations-service";

function buildRepository(overrides: Partial<ConversationsRepository> = {}): ConversationsRepository {
  return {
    listConversations: vi.fn(),
    listMessages: vi.fn(),
    submitFeedback: vi.fn(),
    listFeedbackForDecisions: vi.fn(),
    ...overrides,
  };
}

describe("ConversationsService.submitFeedback", () => {
  it("rejects a correction with no text", async () => {
    const repository = buildRepository();
    const service = new ConversationsService(repository);

    await expect(service.submitFeedback("decision-1", "correction", "  ")).rejects.toThrow(
      "Descreva a correção antes de enviar.",
    );
    expect(repository.submitFeedback).not.toHaveBeenCalled();
  });

  it("allows a thumbs_up with no text", async () => {
    const repository = buildRepository();
    const service = new ConversationsService(repository);

    await service.submitFeedback("decision-1", "thumbs_up");
    expect(repository.submitFeedback).toHaveBeenCalledWith("decision-1", "thumbs_up", undefined);
  });

  it("passes the correction text as a payload", async () => {
    const repository = buildRepository();
    const service = new ConversationsService(repository);

    await service.submitFeedback("decision-1", "correction", "Deveria ter mencionado o prazo.");
    expect(repository.submitFeedback).toHaveBeenCalledWith("decision-1", "correction", {
      correctedText: "Deveria ter mencionado o prazo.",
    });
  });
});
