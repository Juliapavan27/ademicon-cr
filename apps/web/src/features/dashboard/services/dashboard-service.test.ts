import { describe, expect, it } from "vitest";
import type { DashboardRawData } from "../domain/metrics";
import { computeFunnel, computeKpis, computeTrend } from "./dashboard-service";

function buildRaw(overrides: Partial<DashboardRawData> = {}): DashboardRawData {
  return {
    leads: [],
    deals: [],
    stages: [],
    pendingTasksCount: 0,
    ...overrides,
  };
}

describe("computeKpis", () => {
  it("counts leads by status and computes conversion rate", () => {
    const raw = buildRaw({
      leads: [
        { id: "1", currentStageId: "s1", status: "active", createdAt: "2026-07-01T00:00:00Z" },
        { id: "2", currentStageId: "s2", status: "won", createdAt: "2026-07-02T00:00:00Z" },
        { id: "3", currentStageId: "s3", status: "lost", createdAt: "2026-07-03T00:00:00Z" },
        { id: "4", currentStageId: "s1", status: "won", createdAt: "2026-07-04T00:00:00Z" },
      ],
      pendingTasksCount: 5,
    });

    const kpis = computeKpis(raw);
    expect(kpis.totalLeads).toBe(4);
    expect(kpis.activeLeads).toBe(1);
    expect(kpis.wonLeads).toBe(2);
    expect(kpis.lostLeads).toBe(1);
    expect(kpis.conversionRate).toBe(0.5);
    expect(kpis.pendingTasksCount).toBe(5);
  });

  it("returns a zero conversion rate when there are no leads", () => {
    const kpis = computeKpis(buildRaw());
    expect(kpis.conversionRate).toBe(0);
  });

  it("sums deal values, treating a null value as zero", () => {
    const raw = buildRaw({
      deals: [{ valorEstimado: 1000, wonAt: "2026-07-01T00:00:00Z" }, { valorEstimado: null, wonAt: "2026-07-02T00:00:00Z" }],
    });
    expect(computeKpis(raw).revenue).toBe(1000);
  });
});

describe("computeFunnel", () => {
  it("counts leads per stage and assigns status colors to won/lost stages", () => {
    const raw = buildRaw({
      stages: [
        { id: "s1", name: "Novo", orderIndex: 1, color: null, isWon: false, isLost: false },
        { id: "s2", name: "Ganho", orderIndex: 2, color: null, isWon: true, isLost: false },
        { id: "s3", name: "Perdido", orderIndex: 3, color: null, isWon: false, isLost: true },
      ],
      leads: [
        { id: "1", currentStageId: "s1", status: "active", createdAt: "2026-07-01T00:00:00Z" },
        { id: "2", currentStageId: "s1", status: "active", createdAt: "2026-07-01T00:00:00Z" },
        { id: "3", currentStageId: "s2", status: "won", createdAt: "2026-07-01T00:00:00Z" },
      ],
    });

    const funnel = computeFunnel(raw);
    expect(funnel.find((s) => s.stageId === "s1")?.count).toBe(2);
    expect(funnel.find((s) => s.stageId === "s2")?.count).toBe(1);
    expect(funnel.find((s) => s.stageId === "s2")?.color).toBe("#22C55E");
    expect(funnel.find((s) => s.stageId === "s3")?.color).toBe("#EF4444");
    expect(funnel.find((s) => s.stageId === "s3")?.count).toBe(0);
  });
});

describe("computeTrend", () => {
  it("fills every day in the period, including days with zero leads", () => {
    const raw = buildRaw({
      leads: [
        { id: "1", currentStageId: "s1", status: "active", createdAt: "2026-07-01T10:00:00Z" },
        { id: "2", currentStageId: "s1", status: "active", createdAt: "2026-07-01T15:00:00Z" },
        { id: "3", currentStageId: "s1", status: "active", createdAt: "2026-07-03T00:00:00Z" },
      ],
    });

    const trend = computeTrend(raw, { from: "2026-07-01T00:00:00Z", to: "2026-07-03T23:59:59Z" });
    expect(trend).toEqual([
      { date: "2026-07-01", count: 2 },
      { date: "2026-07-02", count: 0 },
      { date: "2026-07-03", count: 1 },
    ]);
  });
});
