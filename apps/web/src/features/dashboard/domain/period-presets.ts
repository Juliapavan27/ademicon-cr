import type { DashboardPeriod } from "./metrics";

export type PeriodPresetDays = 7 | 30 | 90;

export function buildPeriod(days: PeriodPresetDays, now: Date = new Date()): DashboardPeriod {
  const to = new Date(now);
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}
