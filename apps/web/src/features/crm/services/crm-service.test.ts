import { describe, expect, it, vi } from "vitest";
import type { CrmRepository } from "../domain/crm-repository";
import type { Lead, PipelineStage } from "../domain/lead";
import { CrmService } from "./crm-service";

function buildRepository(overrides: Partial<CrmRepository> = {}): CrmRepository {
  return {
    listPipelineStages: vi.fn(),
    listLeads: vi.fn(),
    getLead: vi.fn(),
    createLead: vi.fn(),
    moveLeadStage: vi.fn(),
    adjustLeadScore: vi.fn(),
    updateSuggestedApproach: vi.fn(),
    listTags: vi.fn(),
    createTag: vi.fn(),
    assignTag: vi.fn(),
    removeTag: vi.fn(),
    listNotes: vi.fn(),
    createNote: vi.fn(),
    listAttachments: vi.fn(),
    uploadAttachment: vi.fn(),
    getAttachmentUrl: vi.fn(),
    deleteAttachment: vi.fn(),
    listTasks: vi.fn(),
    createTask: vi.fn(),
    setTaskStatus: vi.fn(),
    listScoreHistory: vi.fn(),
    getDeal: vi.fn(),
    upsertDealValue: vi.fn(),
    markDealOutcome: vi.fn(),
    ...overrides,
  };
}

function buildStage(overrides: Partial<PipelineStage> = {}): PipelineStage {
  return {
    id: "stage-1",
    organizationId: "org-1",
    name: "Novo Lead",
    orderIndex: 1,
    color: null,
    isWon: false,
    isLost: false,
    ...overrides,
  };
}

function buildLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    organizationId: "org-1",
    fullName: "Lead Teste",
    email: null,
    phone: null,
    company: null,
    source: "manual",
    specialtyId: null,
    cityId: null,
    currentStageId: "stage-1",
    assignedConsultantId: null,
    leadScore: 50,
    status: "active",
    whatsappStatus: "not_checked",
    suggestedApproach: null,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("CrmService.moveLeadStage", () => {
  it("sets status to won and marks the deal won when landing on a won stage", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const wonStage = buildStage({ id: "stage-won", isWon: true });

    await service.moveLeadStage("lead-1", wonStage);
    expect(repository.moveLeadStage).toHaveBeenCalledWith("lead-1", "stage-won", "won");
    expect(repository.markDealOutcome).toHaveBeenCalledWith("lead-1", "won");
  });

  it("sets status to lost and marks the deal lost when landing on a lost stage", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const lostStage = buildStage({ id: "stage-lost", isLost: true });

    await service.moveLeadStage("lead-1", lostStage);
    expect(repository.moveLeadStage).toHaveBeenCalledWith("lead-1", "stage-lost", "lost");
    expect(repository.markDealOutcome).toHaveBeenCalledWith("lead-1", "lost");
  });

  it("sets status to active for a neutral stage", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const neutralStage = buildStage({ id: "stage-mid" });

    await service.moveLeadStage("lead-1", neutralStage);
    expect(repository.moveLeadStage).toHaveBeenCalledWith("lead-1", "stage-mid", "active");
  });
});

describe("CrmService.adjustLeadScore", () => {
  it("clamps the delta so the score never exceeds 100", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const lead = buildLead({ leadScore: 95 });

    await service.adjustLeadScore(lead, 20, "boa conversa");
    expect(repository.adjustLeadScore).toHaveBeenCalledWith("lead-1", 95, 5, "boa conversa");
  });

  it("clamps the delta so the score never goes below 0", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const lead = buildLead({ leadScore: 5 });

    await service.adjustLeadScore(lead, -20, "sumiu");
    expect(repository.adjustLeadScore).toHaveBeenCalledWith("lead-1", 5, -5, "sumiu");
  });

  it("rejects an empty motivo", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const lead = buildLead();

    await expect(service.adjustLeadScore(lead, 10, "  ")).rejects.toThrow(
      "Informe o motivo do ajuste de score.",
    );
    expect(repository.adjustLeadScore).not.toHaveBeenCalled();
  });

  it("rejects a no-op adjustment when already at the limit", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);
    const lead = buildLead({ leadScore: 100 });

    await expect(service.adjustLeadScore(lead, 10, "motivo")).rejects.toThrow(/limite/);
    expect(repository.adjustLeadScore).not.toHaveBeenCalled();
  });
});

describe("CrmService.setDealValue", () => {
  it("rejects a negative value", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);

    await expect(service.setDealValue("lead-1", "org-1", -10)).rejects.toThrow(
      "Valor estimado deve ser um número positivo.",
    );
    expect(repository.upsertDealValue).not.toHaveBeenCalled();
  });

  it("accepts a valid value", async () => {
    const repository = buildRepository();
    const service = new CrmService(repository);

    await service.setDealValue("lead-1", "org-1", 5000);
    expect(repository.upsertDealValue).toHaveBeenCalledWith("lead-1", "org-1", 5000);
  });
});
