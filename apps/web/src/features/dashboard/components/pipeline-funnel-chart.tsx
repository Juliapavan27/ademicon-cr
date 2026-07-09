"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStagePoint } from "../domain/metrics";

// 25% headroom above the top gridline so the count label above each bar
// never collides with the chart's own ceiling.
const HEADROOM_RATIO = 1.25;

function buildYTicks(maxValue: number): number[] {
  const max = Math.max(1, maxValue);
  const step = max <= 5 ? 1 : Math.ceil(max / 5);
  const topTick = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = topTick; value >= 0; value -= step) ticks.push(value);
  return ticks;
}

export function PipelineFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  const maxCount = Math.max(1, ...data.map((stage) => stage.count));
  const yTicks = buildYTicks(maxCount);
  const scaleMax = yTicks[0] * HEADROOM_RATIO;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de leads por estágio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-72 w-full gap-3">
          <div className="flex flex-col justify-between py-1 text-xs text-muted-foreground">
            {yTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="relative flex flex-1 items-stretch gap-2 border-l border-border pt-1">
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="pointer-events-none absolute left-0 right-0 border-t border-border/60"
                style={{ bottom: `${(tick / scaleMax) * 100}%` }}
              />
            ))}
            {data.map((stage) => (
              <div
                key={stage.stageId}
                className="relative z-10 flex flex-1 flex-col items-center justify-end gap-1.5 px-1"
              >
                <span className="text-xs font-medium text-foreground">{stage.count}</span>
                <div
                  className="w-full max-w-10 rounded-t-md"
                  style={{
                    height: `${(stage.count / scaleMax) * 100}%`,
                    minHeight: stage.count > 0 ? "4px" : "0px",
                    backgroundColor: stage.color ?? "var(--primary)",
                  }}
                  title={`${stage.name}: ${stage.count}`}
                />
                <span className="line-clamp-2 text-center text-[10px] leading-tight text-muted-foreground">
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
