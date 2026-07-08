"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PeriodPresetDays } from "../domain/period-presets";

const PRESETS: { label: string; days: PeriodPresetDays }[] = [
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
];

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodPresetDays;
  onChange: (days: PeriodPresetDays) => void;
}) {
  return (
    <div className="flex gap-1">
      {PRESETS.map((preset) => (
        <Button
          key={preset.days}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange(preset.days)}
          className={cn(
            "text-muted-foreground",
            value === preset.days && "bg-accent text-accent-foreground",
          )}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
