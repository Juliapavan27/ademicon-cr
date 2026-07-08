import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export function ChartTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
      {label && <p className="mb-1 text-xs text-muted-foreground">{label}</p>}
      {payload.map((entry) => (
        <div key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-semibold">{entry.value}</span>
          <span className="text-muted-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}
