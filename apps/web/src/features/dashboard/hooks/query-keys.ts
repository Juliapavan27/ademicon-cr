import type { DashboardPeriod } from "../domain/metrics";

export const dashboardKeys = {
  metrics: (period: DashboardPeriod) => ["dashboard", "metrics", period.from, period.to] as const,
};
