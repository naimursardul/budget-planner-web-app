import { Flag, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { BudgetEditor } from "@/components/budget/budget-editor";
import { PriorityTable } from "@/components/priorities/priority-table";
import { connectDB } from "@/lib/mongodb";
import { Budget, Category } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { getMonthlySummary } from "@/services/analytics";
import { currencySymbolFor } from "@/lib/currencies";
import { formatPercent, isValidMonthKey, parseMonthKey } from "@/lib/utils";
import type { Priority } from "@/types";

export const metadata = { title: "Budget" };

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

export default async function BudgetPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonthKey(rawMonth)
    ? rawMonth
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const { year, month: m } = parseMonthKey(month);

  await connectDB();

  const [expenseCategories, budget, summary] = await Promise.all([
    Category.find({ userId: user.id as never, type: "expense" })
      .sort({ order: 1, name: 1 })
      .lean(),
    Budget.findOne({ userId: user.id as never, year, month: m }).lean(),
    getMonthlySummary(user.id, month),
  ]);

  const currentBudget: Record<string, number> = {};
  for (const item of budget?.items ?? []) {
    currentBudget[String(item.categoryId)] = item.amount;
  }

  const tracked = summary.budgetProgress.filter((b) => b.budget > 0);
  const totalBudget = tracked.reduce((s, b) => s + b.budget, 0);
  const totalActual = tracked.reduce((s, b) => s + b.actual, 0);
  const overallPercent = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

  // Priorities view — the same month's numbers, grouped by what each
  // category means to you rather than by its budget line.
  const spendByCategory = new Map(summary.byCategory.map((c) => [c.categoryName, c.amount]));
  const budgetByCategory = new Map(tracked.map((b) => [b.categoryName, b.budget]));

  const priorityRows = expenseCategories.map((c) => ({
    id: String(c._id),
    name: c.name,
    priority: c.priority,
    spent: spendByCategory.get(c.name) ?? 0,
    budget: budgetByCategory.get(c.name) ?? 0,
  }));

  const rollup = PRIORITY_ORDER.map((priority) => {
    const items = priorityRows.filter((r) => r.priority === priority);
    return {
      priority,
      spent: items.reduce((s, r) => s + r.spent, 0),
      budget: items.reduce((s, r) => s + r.budget, 0),
      count: items.length,
    };
  });
  const totalSpent = rollup.reduce((s, r) => s + r.spent, 0) || 1;
  const hasSpending = priorityRows.some((r) => r.spent > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">
            Plan your spending, compare it with what actually happened, and see how it splits by
            priority.
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      <Tabs defaultValue="plan">
        <TabsList className="flex-wrap">
          <TabsTrigger value="plan">Plan &amp; track</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <BudgetEditor
            year={year}
            month={m}
            categories={expenseCategories.map((c) => ({
              id: String(c._id),
              name: c.name,
              priority: c.priority,
            }))}
            currentBudget={currentBudget}
            currencySymbol={currencySymbolFor(user.currency)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>
                {tracked.length > 0
                  ? `Overall: ${formatPercent(overallPercent)} of your total budget used`
                  : "Save a budget above to start tracking progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracked.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Target className="size-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    No budget set for this month yet. Add amounts above, or copy last month.
                  </p>
                </div>
              ) : (
                tracked.map((item) => (
                  <div key={item.categoryName}>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{item.categoryName}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground tabular-nums">
                          <Money value={item.actual} currency={user.currency} /> /{" "}
                          <Money value={item.budget} currency={user.currency} />
                        </span>
                        <Badge
                          variant={
                            item.status === "over" ? "danger" : item.status === "near" ? "warning" : "success"
                          }
                        >
                          {item.status === "over" ? "Over" : item.status === "near" ? "Near limit" : "Under"} ·{" "}
                          {formatPercent(item.percent)}
                        </Badge>
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, item.percent)}
                      aria-label={`${item.categoryName}: ${item.percent}% of budget used`}
                      indicatorClassName={
                        item.status === "over"
                          ? "bg-danger"
                          : item.status === "near"
                            ? "bg-warning"
                            : "bg-success"
                      }
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.remaining >= 0 ? "Remaining: " : "Over by: "}
                      <Money
                        value={Math.abs(item.remaining)}
                        currency={user.currency}
                        className={item.remaining >= 0 ? "text-success" : "text-danger"}
                      />
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-6">
          {!hasSpending ? (
            <EmptyState
              icon={Flag}
              title="No spending this month"
              description="Once you record expenses, this tab shows how your money splits across Essential, High priority, Moderate, Low priority, and Avoidable spending."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {rollup.map(({ priority, spent, budget: priorityBudget, count }) => (
                  <Card key={priority} className="p-5">
                    <Badge variant={PRIORITY_BADGE[priority].variant} className="mb-2">
                      {PRIORITY_LABELS[priority]}
                    </Badge>
                    <p className="text-xl font-bold">
                      <Money value={spent} currency={user.currency} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {count} {count === 1 ? "category" : "categories"}
                      {priorityBudget > 0 &&
                        ` · ${formatPercent(Math.min(999, (spent / priorityBudget) * 100))} of budget`}
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
                  <PriorityTable rows={priorityRows} currency={user.currency} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
