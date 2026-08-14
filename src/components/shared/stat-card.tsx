import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const ACCENT_CLASS = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  accent: keyof typeof ACCENT_CLASS;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className={cn("h-1 w-full", ACCENT_CLASS[accent])} />
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
