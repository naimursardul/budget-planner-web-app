import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { MonthSwitcher } from "@/components/month-switcher";
import {
  IncomeExpenseChart,
  SpendingDonut,
  CashFlowChart,
} from "@/components/charts/charts";
import { connectDB } from "@/lib/mongodb";
import { Category, SavingsGoal } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import {
  getMonthlySummary,
  getCashFlow,
  currentMonthSavings,
} from "@/services/analytics";
import { generateNotifications } from "@/services/notifications";
import { addMonths, formatPercent, isValidMonthKey } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonthKey(rawMonth) ? rawMonth : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = addMonths(month, -1);

  await connectDB();

  // Refresh high-signal notifications (deduped — never spams)
  await generateNotifications(user.id, user.notificationPrefs).catch(() => {});

  const [summary, prevSummary, cashFlow, savingsThisMonth, categories, goals] =
    await Promise.all([
      getMonthlySummary(user.id, month),
      getMonthlySummary(user.id, prevMonth),
      getCashFlow(user.id, month, 6),
      currentMonthSavings(user.id),
      Category.find({ userId: user.id as never }).sort({ type: 1, order: 1, name: 1 }).lean(),
      SavingsGoal.find({ userId: user.id as never }).lean(),
    ]);

  const categoryOptions = categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    type: c.type,
  }));
  const billCategories = categories
    .filter((c) => c.type === "bill")
    .map((c) => ({ id: String(c._id), name: c.name }));

  const savingsGoal = user.monthlySavingsGoal;
  const savingsPercent =
    savingsGoal > 0 ? Math.min(100, Math.round((savingsThisMonth / savingsGoal) * 100)) : 0;
  const totalGoalProgress = goals.length
    ? goals.reduce((sum, g) => sum + (g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0), 0) / goals.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Greeting + month switcher */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your financial picture for this month.
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      <QuickActions categories={categoryOptions} billCategories={billCategories} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Income"
          value={summary.totals.income}
          previousValue={prevSummary.totals.income}
          currency={user.currency}
          goodDirection="up"
          accent="sage"
          icon={<ArrowDownCircle className="size-5" aria-hidden />}
        />
        <StatCard
          label="Expenses"
          value={summary.totals.expense}
          previousValue={prevSummary.totals.expense}
          currency={user.currency}
          goodDirection="down"
          accent="blush"
          icon={<ArrowUpCircle className="size-5" aria-hidden />}
        />
        <StatCard
          label="Savings"
          value={summary.totals.savings}
          previousValue={prevSummary.totals.savings}
          currency={user.currency}
          goodDirection="up"
          accent="lavender"
          icon={<PiggyBank className="size-5" aria-hidden />}
        />
        <StatCard
          label="Remaining"
          value={summary.remaining}
          previousValue={prevSummary.remaining}
          currency={user.currency}
          goodDirection="up"
          accent="sky"
          icon={<Wallet className="size-5" aria-hidden />}
        />
      </div>

      {/* Income vs Expense + Spending breakdown */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={cashFlow} currency={user.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Where your money went this month</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.byCategory.length > 0 ? (
              <SpendingDonut byCategory={summary.byCategory} currency={user.currency} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No expenses recorded this month yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>
            {summary.budgetProgress.filter((b) => b.budget > 0).length > 0
              ? "Your spending against this month's budget"
              : "No budget set for this month — visit the Budget page to create one"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.budgetProgress.filter((b) => b.budget > 0).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Set category budgets to track your progress here.
            </p>
          ) : (
            summary.budgetProgress
              .filter((b) => b.budget > 0)
              .slice(0, 6)
              .map((item) => (
                <div key={item.categoryName}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{item.categoryName}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground tabular-nums">
                        <Money value={item.actual} currency={user.currency} /> of{" "}
                        <Money value={item.budget} currency={user.currency} />
                      </span>
                      <Badge
                        variant={
                          item.status === "over"
                            ? "danger"
                            : item.status === "near"
                              ? "warning"
                              : "success"
                        }
                      >
                        {item.status === "over" ? "Over" : item.status === "near" ? "Near limit" : "Under"}
                        {" · "}
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
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Cash flow + savings progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Income, expenses and savings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlow} currency={user.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Progress</CardTitle>
            <CardDescription>
              {savingsGoal > 0
                ? `${formatPercent(savingsPercent)} of your monthly savings goal`
                : "Set a monthly savings goal in Settings to track progress"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">This month</span>
                <span className="text-xl font-bold">
                  <Money value={savingsThisMonth} currency={user.currency} />
                  {savingsGoal > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / <Money value={savingsGoal} currency={user.currency} />
                    </span>
                  )}
                </span>
              </div>
              <Progress
                value={savingsPercent}
                aria-label={`Savings progress: ${savingsPercent}% of monthly goal`}
                indicatorClassName="bg-success"
              />
            </div>

            {goals.length > 0 && (
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Across {goals.length} {goals.length === 1 ? "goal" : "goals"}
                  </span>
                  <span className="text-xl font-bold">{formatPercent(totalGoalProgress)}</span>
                </div>
                <Progress
                  value={totalGoalProgress}
                  aria-label={`Overall goal progress: ${totalGoalProgress}%`}
                  indicatorClassName="bg-[var(--viz-1)]"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
