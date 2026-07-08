"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStagePoint } from "../domain/metrics";
import { ChartTooltip } from "./chart-tooltip";

export function PipelineFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de leads por estágio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" name="Leads" radius={4} maxBarSize={40}>
                {data.map((entry) => (
                  <Cell key={entry.stageId} fill={entry.color ?? "var(--primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
