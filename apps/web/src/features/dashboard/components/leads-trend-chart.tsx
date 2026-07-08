"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendPoint } from "../domain/metrics";
import { ChartTooltip } from "./chart-tooltip";

const TREND_COLOR = "#005DAA";

function formatShortDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export function LeadsTrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((point) => ({ ...point, label: formatShortDate(point.date) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Novos leads ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TREND_COLOR} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={TREND_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Leads"
                stroke={TREND_COLOR}
                strokeWidth={2}
                fill="url(#leadsTrendFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
