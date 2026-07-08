"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import type { DashboardPeriod } from "../domain/metrics";
import { DashboardService } from "../services/dashboard-service";
import { SupabaseDashboardRepository } from "../repository/supabase-dashboard-repository";
import { dashboardKeys } from "./query-keys";

export function useDashboardMetrics(period: DashboardPeriod) {
  const dashboardService = useMemo(
    () => new DashboardService(new SupabaseDashboardRepository(createClient())),
    [],
  );

  return useQuery({
    queryKey: dashboardKeys.metrics(period),
    queryFn: () => dashboardService.getMetrics(period),
  });
}
