import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";
import type { DashboardRepository } from "../domain/dashboard-repository";
import type { DashboardPeriod, DashboardRawData } from "../domain/metrics";

export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getRawData(period: DashboardPeriod): Promise<DashboardRawData> {
    const [leadsResult, dealsResult, stagesResult, tasksResult] = await Promise.all([
      this.supabase
        .from("leads")
        .select("id, current_stage_id, status, created_at")
        .gte("created_at", period.from)
        .lte("created_at", period.to),
      this.supabase
        .from("deals")
        .select("valor_estimado, won_at")
        .not("won_at", "is", null)
        .gte("won_at", period.from)
        .lte("won_at", period.to),
      this.supabase
        .from("pipeline_stages")
        .select("id, name, order_index, color, is_won, is_lost")
        .order("order_index"),
      this.supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    if (leadsResult.error) throw leadsResult.error;
    if (dealsResult.error) throw dealsResult.error;
    if (stagesResult.error) throw stagesResult.error;
    if (tasksResult.error) throw tasksResult.error;

    return {
      leads: (leadsResult.data ?? []).map((row) => ({
        id: row.id,
        currentStageId: row.current_stage_id,
        status: row.status as DashboardRawData["leads"][number]["status"],
        createdAt: row.created_at,
      })),
      deals: (dealsResult.data ?? []).map((row) => ({
        valorEstimado: row.valor_estimado,
        wonAt: row.won_at,
      })),
      stages: (stagesResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        orderIndex: row.order_index,
        color: row.color,
        isWon: row.is_won,
        isLost: row.is_lost,
      })),
      pendingTasksCount: tasksResult.count ?? 0,
    };
  }
}
