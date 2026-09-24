"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * Lazy boundary for the chart bundle.
 *
 * Recharts is by far the heaviest dependency in the app and every chart sits
 * below the fold, under stat cards that already carry the headline numbers.
 * Routing the imports through `next/dynamic` keeps it out of each route's
 * first-load JS — the page paints its figures immediately and the chart chunk
 * arrives just after hydration.
 *
 * `ssr: false` is only legal inside a client component, which is the whole
 * reason this module exists: the pages that render charts are server
 * components and cannot pass that option themselves.
 */

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-64 w-full animate-pulse rounded-xl bg-muted/60", className)}
      aria-hidden
    />
  );
}

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row" aria-hidden>
      <div className="size-48 shrink-0 animate-pulse rounded-full bg-muted/60" />
      <div className="w-full space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

export const IncomeExpenseChart = dynamic(
  () => import("./charts").then((m) => m.IncomeExpenseChart),
  { ssr: false, loading: () => <ChartSkeleton className="h-[19rem]" /> }
);

export const SpendingDonut = dynamic(
  () => import("./charts").then((m) => m.SpendingDonut),
  { ssr: false, loading: () => <DonutSkeleton /> }
);

export const CashFlowChart = dynamic(
  () => import("./charts").then((m) => m.CashFlowChart),
  { ssr: false, loading: () => <ChartSkeleton className="h-[19rem]" /> }
);

export const DebtReductionChart = dynamic(
  () => import("./charts").then((m) => m.DebtReductionChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
