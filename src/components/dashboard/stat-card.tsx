import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/money";
import { cn, percentChange } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  previousValue: number;
  currency: string;
  /** For costs, an increase is bad; for income/savings, up is good. */
  goodDirection: "up" | "down";
  icon: React.ReactNode;
  accent?: "lavender" | "sage" | "sky" | "blush" | "peach";
}

const ACCENTS: Record<string, string> = {
  lavender: "bg-lavender/40",
  sage: "bg-sage/40",
  sky: "bg-sky/40",
  blush: "bg-blush/40",
  peach: "bg-peach/40",
};

export function StatCard({
  label,
  value,
  previousValue,
  currency,
  goodDirection,
  icon,
  accent = "lavender",
}: StatCardProps) {
  const change = percentChange(value, previousValue);
  const direction =
    change === null || Math.abs(change) < 0.5
      ? "flat"
      : change > 0
        ? "up"
        : "down";
  const isGood =
    direction === "flat" ? null : direction === goodDirection;
  const TrendIcon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight">
            <Money value={value} currency={currency} />
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs" aria-live="polite">
            {change !== null && direction !== "flat" && (
              <TrendIcon
                className={cn("size-3.5", isGood ? "text-success" : "text-danger")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "font-medium",
                direction === "flat" || change === null
                  ? "text-muted-foreground"
                  : isGood
                    ? "text-success"
                    : "text-danger"
              )}
            >
              {change === null
                ? previousValue === 0 && value === 0
                  ? "No data"
                  : "New this month"
                : direction === "flat"
                  ? "Steady vs last month"
                  : `${change > 0 ? "+" : ""}${change}% vs last month`}
            </span>
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            ACCENTS[accent]
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}
