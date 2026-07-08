import type { DashboardRepository } from "../domain/dashboard-repository";
import type {
  DashboardMetrics,
  DashboardPeriod,
  DashboardRawData,
  FunnelStagePoint,
  KpiSummary,
  TrendPoint,
} from "../domain/metrics";

/**
 * Ordinal ramp for the "in progress" funnel stages (light → dark, single
 * hue) — validated with the dataviz skill's contrast/CVD checks. Won/lost
 * stages use the fixed status palette instead, since they encode outcome
 * (good/bad), not sequence position.
 */
const IN_PROGRESS_RAMP = ["#60A5FA", "#2563EB", "#005DAA", "#003B71"];
const WON_COLOR = "#22C55E";
const LOST_COLOR = "#EF4444";

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function eachDayBetween(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = new Date(dateKey(from));
  const end = new Date(dateKey(to));
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getMetrics(period: DashboardPeriod): Promise<DashboardMetrics> {
    const raw = await this.repository.getRawData(period);
    return {
      kpis: computeKpis(raw),
      funnel: computeFunnel(raw),
      trend: computeTrend(raw, period),
    };
  }
}

export function computeKpis(raw: DashboardRawData): KpiSummary {
  const totalLeads = raw.leads.length;
  const activeLeads = raw.leads.filter((lead) => lead.status === "active").length;
  const wonLeads = raw.leads.filter((lead) => lead.status === "won").length;
  const lostLeads = raw.leads.filter((lead) => lead.status === "lost").length;
  const revenue = raw.deals.reduce((sum, deal) => sum + (deal.valorEstimado ?? 0), 0);

  return {
    totalLeads,
    activeLeads,
    wonLeads,
    lostLeads,
    conversionRate: totalLeads === 0 ? 0 : wonLeads / totalLeads,
    revenue,
    pendingTasksCount: raw.pendingTasksCount,
  };
}

export function computeFunnel(raw: DashboardRawData): FunnelStagePoint[] {
  const inProgressStages = raw.stages.filter((stage) => !stage.isWon && !stage.isLost);

  return raw.stages.map((stage) => {
    const rampIndex = inProgressStages.findIndex((s) => s.id === stage.id);
    const color = stage.isWon
      ? WON_COLOR
      : stage.isLost
        ? LOST_COLOR
        : (IN_PROGRESS_RAMP[rampIndex % IN_PROGRESS_RAMP.length] ?? stage.color);

    return {
      stageId: stage.id,
      name: stage.name,
      color,
      isWon: stage.isWon,
      isLost: stage.isLost,
      count: raw.leads.filter((lead) => lead.currentStageId === stage.id).length,
    };
  });
}

export function computeTrend(raw: DashboardRawData, period: DashboardPeriod): TrendPoint[] {
  const countsByDay = new Map<string, number>();
  for (const lead of raw.leads) {
    const key = dateKey(lead.createdAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  return eachDayBetween(period.from, period.to).map((date) => ({
    date,
    count: countsByDay.get(date) ?? 0,
  }));
}
