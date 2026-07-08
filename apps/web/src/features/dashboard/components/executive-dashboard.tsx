"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, TrendingUp, Users, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactCurrency, formatCompactNumber, formatPercent } from "../domain/formatters";
import { buildPeriod, type PeriodPresetDays } from "../domain/period-presets";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { KpiCard } from "./kpi-card";
import { LeadsTrendChart } from "./leads-trend-chart";
import { PeriodFilter } from "./period-filter";
import { PipelineFunnelChart } from "./pipeline-funnel-chart";

export function ExecutiveDashboard() {
  const [days, setDays] = useState<PeriodPresetDays>(30);
  const period = useMemo(() => buildPeriod(days), [days]);
  const { data: metrics, isLoading } = useDashboardMetrics(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <PeriodFilter value={days} onChange={setDays} />
      </div>

      {isLoading || !metrics ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-5">
          <KpiCard label="Leads no período" value={formatCompactNumber(metrics.kpis.totalLeads)} icon={Users} />
          <KpiCard
            label="Taxa de conversão"
            value={formatPercent(metrics.kpis.conversionRate)}
            icon={TrendingUp}
            accent="success"
          />
          <KpiCard
            label="Receita (ganhos)"
            value={formatCompactCurrency(metrics.kpis.revenue)}
            icon={Wallet}
            accent="success"
          />
          <KpiCard label="Leads em aberto" value={formatCompactNumber(metrics.kpis.activeLeads)} icon={CheckCircle2} />
          <KpiCard
            label="Tarefas pendentes"
            value={formatCompactNumber(metrics.kpis.pendingTasksCount)}
            icon={ClipboardList}
            accent="warning"
          />
        </div>
      )}

      {isLoading || !metrics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <PipelineFunnelChart data={metrics.funnel} />
          <LeadsTrendChart data={metrics.trend} />
        </div>
      )}
    </div>
  );
}
