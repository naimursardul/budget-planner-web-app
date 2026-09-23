import { Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { BudgetEditor } from "@/components/budget/budget-editor";
import { connectDB } from "@/lib/mongodb";
import { Budget, Category } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { getMonthlySummary } from "@/services/analytics";
import { currencySymbolFor, formatPercent, isValidMonthKey, parseMonthKey } from "@/lib/budget-helpers";

export const metadata = { title: "Budget" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground">
            Plan your spending and compare it with what actually happened.
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

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
    </div>
  );
}
