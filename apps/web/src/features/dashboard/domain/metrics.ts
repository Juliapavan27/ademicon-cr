export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface RawLead {
  id: string;
  currentStageId: string | null;
  status: "active" | "won" | "lost" | "archived";
  createdAt: string;
}

export interface RawDeal {
  valorEstimado: number | null;
  wonAt: string | null;
}

export interface RawStage {
  id: string;
  name: string;
  orderIndex: number;
  color: string | null;
  isWon: boolean;
  isLost: boolean;
}

export interface DashboardRawData {
  leads: RawLead[];
  deals: RawDeal[];
  stages: RawStage[];
  pendingTasksCount: number;
}

export interface KpiSummary {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  revenue: number;
  pendingTasksCount: number;
}

export interface FunnelStagePoint {
  stageId: string;
  name: string;
  color: string | null;
  isWon: boolean;
  isLost: boolean;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DashboardMetrics {
  kpis: KpiSummary;
  funnel: FunnelStagePoint[];
  trend: TrendPoint[];
}
