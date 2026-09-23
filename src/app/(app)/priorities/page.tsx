import { Flag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { PriorityTable } from "@/components/priorities/priority-table";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { getMonthlySummary } from "@/services/analytics";
import { formatPercent, isValidMonthKey } from "@/lib/utils";
import type { Priority } from "@/types";

export const metadata = { title: "Priorities" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

const PRIORITY_ORDER: Priority[] = ["essential", "high", "moderate", "low", "avoidable"];

const PRIORITY_LABELS: Record<Priority, string> = {
  essential: "Essential",
  high: "High priority",
  moderate: "Moderate",
  low: "Low priority",
  avoidable: "Avoidable",
};

const PRIORITY_BADGE: Record<Priority, { variant: "danger" | "warning" | "lavender" | "sky" | "outline" }> = {
  essential: { variant: "danger" },
  high: { variant: "warning" },
  moderate: { variant: "lavender" },
  low: { variant: "sky" },
  avoidable: { variant: "outline" },
};

export default async function PrioritiesPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonthKey(rawMonth)
    ? rawMonth
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  await connectDB();

  const [categories, summary] = await Promise.all([
    Category.find({ userId: user.id as never, type: "expense" }).sort({ order: 1, name: 1 }).lean(),
    getMonthlySummary(user.id, month),
  ]);

  const spendByCategory = new Map(summary.byCategory.map((c) => [c.categoryName, c.amount]));
  const budgetByCategory = new Map(
    summary.budgetProgress.filter((b) => b.budget > 0).map((b) => [b.categoryName, b.budget])
  );

  const rows = categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    priority: c.priority,
    spent: spendByCategory.get(c.name) ?? 0,
    budget: budgetByCategory.get(c.name) ?? 0,
  }));

  // Rollup by priority
  const rollup = PRIORITY_ORDER.map((priority) => {
    const items = rows.filter((r) => r.priority === priority);
    return {
      priority,
      spent: items.reduce((s, r) => s + r.spent, 0),
      budget: items.reduce((s, r) => s + r.budget, 0),
      count: items.length,
    };
  });
  const totalSpent = rollup.reduce((s, r) => s + r.spent, 0) || 1;
  const hasData = rows.some((r) => r.spent > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Priorities</h1>
          <p className="text-sm text-muted-foreground">
            Decide what each spending category means to you — essential first.
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      {!hasData ? (
        <EmptyState
          icon={Flag}
          title="No spending this month"
          description="Once you record expenses, this page shows how your money splits across Essential, High priority, Moderate, Low priority, and Avoidable spending."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {rollup.map(({ priority, spent, budget, count }) => (
              <Card key={priority} className="p-5">
                <Badge variant={PRIORITY_BADGE[priority].variant} className="mb-2">
                  {PRIORITY_LABELS[priority]}
                </Badge>
                <p className="text-xl font-bold">
                  <Money value={spent} currency={user.currency} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {count} {count === 1 ? "category" : "categories"}
                  {budget > 0 && ` · ${formatPercent(budget > 0 ? Math.min(999, (spent / budget) * 100) : 0)} of budget`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatPercent((spent / totalSpent) * 100, 1)} of spending
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category priorities</CardTitle>
              <CardDescription>
                Change a priority to re-balance how your spending is classified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriorityTable rows={rows} currency={user.currency} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
