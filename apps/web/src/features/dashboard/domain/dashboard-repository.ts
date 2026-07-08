import type { DashboardPeriod, DashboardRawData } from "./metrics";

export interface DashboardRepository {
  getRawData(period: DashboardPeriod): Promise<DashboardRawData>;
}
