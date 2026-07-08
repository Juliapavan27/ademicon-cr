import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "success" | "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground",
            accent === "success" && "bg-success/10 text-success",
            accent === "warning" && "bg-warning/10 text-warning",
            accent === "destructive" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm leading-tight text-muted-foreground">{label}</span>
          <span className="truncate text-2xl font-semibold" title={value}>
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
