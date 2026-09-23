import Link from "next/link";
import { Download, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { IncomeExpenseChart, CashFlowChart } from "@/components/charts/charts";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { getCashFlow } from "@/services/analytics";
import { addMonths, formatPercent, monthKey, round2 } from "@/lib/utils";
import { ReportPeriodSelector } from "@/components/reports/period-selector";

export const metadata = { title: "Reports" };

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

const PERIODS = ["this_month", "last_month", "last_3", "last_6", "this_year", "custom"] as const;
type Period = (typeof PERIODS)[number];

function periodRange(period: Period, from?: string, to?: string): { from: string; to: string; months: number; label: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const thisMonth = monthKey(now);
  switch (period) {
    case "last_month": {
      const key = addMonths(thisMonth, -1);
      const [y, m] = key.split("-").map(Number);
      return {
        from: `${key}-01`,
        to: new Date(y, m, 0).toISOString().slice(0, 10),
        months: 1,
        label: "Last month",
      };
    }
    case "last_3":
      return {
        from: `${addMonths(thisMonth, -2)}-01`,
        to: today,
        months: 3,
        label: "Last 3 months",
      };
    case "last_6":
      return {
        from: `${addMonths(thisMonth, -5)}-01`,
        to: today,
        months: 6,
        label: "Last 6 months",
      };
    case "this_year":
      return {
        from: `${now.getFullYear()}-01-01`,
        to: today,
        months: now.getMonth() + 1,
        label: "This year",
      };
    case "custom":
      return {
        from: from && !Number.isNaN(Date.parse(from)) ? from : `${thisMonth}-01`,
        to: to && !Number.isNaN(Date.parse(to)) ? to : today,
        months: 6,
        label: "Custom range",
      };
    case "this_month":
    default:
      return { from: `${thisMonth}-01`, to: today, months: 1, label: "This month" };
  }
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const params = await searchParams;
  const period = (PERIODS as readonly string[]).includes(params.period ?? "")
    ? (params.period as Period)
    : "this_month";
  const { from, to, months, label } = periodRange(period, params.from, params.to);

  await connectDB();

  const [rows, cashFlow] = await Promise.all([
    Transaction.find({
      userId: user.id as never,
      date: { $gte: new Date(from), $lte: new Date(`${to}T23:59:59.999`) },
    }).lean(),
    getCashFlow(user.id, monthKey(new Date(`${to}T12:00:00`)), Math.max(3, Math.min(12, months))),
  ]);

  const totals = { income: 0, expense: 0, savings: 0, bill: 0, debt: 0 };
  const byCategory = new Map<string, { amount: number; type: string }>();
  for (const row of rows) {
    totals[row.type as keyof typeof totals] = round2(totals[row.type as keyof typeof totals] + row.amount);
    const key = row.categoryName;
    const entry = byCategory.get(key) ?? { amount: 0, type: row.type };
    entry.amount = round2(entry.amount + row.amount);
    byCategory.set(key, entry);
  }

  const topCategories = [...byCategory.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const hasData = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            {label} · {from} → {to}
          </p>
        </div>
        <a
          href={`/api/reports/export?from=${from}&to=${to}`}
          download
          className={buttonVariants({ variant: "outline" })}
        >
          <Download aria-hidden /> Export CSV
        </a>
      </div>

      <ReportPeriodSelector period={period} from={from} to={to} />

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No data for this period"
          description="Add transactions in this date range and your reports will build themselves."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            {(
              [
                ["Income", totals.income, "sage"],
                ["Expenses", totals.expense, "blush"],
                ["Savings", totals.savings, "lavender"],
                ["Bills", totals.bill, "sky"],
                ["Debt payments", totals.debt, "peach"],
              ] as const
            ).map(([labelText, value, accent]) => (
              <Card key={labelText} className="p-4">
                <Badge variant={accent} className="mb-2">
                  {labelText}
                </Badge>
                <p className="text-lg font-bold">
                  <Money value={value} currency={user.currency} />
                </p>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="cashflow">
            <TabsList className="flex-wrap">
              <TabsTrigger value="cashflow">Cash flow</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="budget">Budget performance</TabsTrigger>
            </TabsList>

            <TabsContent value="cashflow">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Monthly comparison over the period</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeExpenseChart data={cashFlow} currency={user.currency} />
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Cash Flow Trend</CardTitle>
                  <CardDescription>Income, expenses and savings per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashFlowChart data={cashFlow} currency={user.currency} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Top categories in this period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCategories.map((cat) => {
                    const max = topCategories[0].amount || 1;
                    const percent = Math.round((cat.amount / max) * 100);
                    return (
                      <div key={cat.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className="tabular-nums text-muted-foreground">
                            <Money value={cat.amount} currency={user.currency} />
                          </span>
                        </div>
                        <Progress
                          value={percent}
                          aria-label={`${cat.name}: ${percent}% of top category`}
                          indicatorClassName="bg-[var(--viz-1)]"
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Performance</CardTitle>
                  <CardDescription>
                    Actual spending by type against your totals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(
                    [
                      ["Income", totals.income, user.monthlyIncome],
                      ["Expenses", totals.expense, 0],
                      ["Savings", totals.savings, user.monthlySavingsGoal],
                    ] as const
                  ).map(([name, actual, target]) => {
                    const percent = target > 0 ? Math.round((actual / target) * 100) : 0;
                    return (
                      <div key={name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{name}</span>
                          <span className="tabular-nums text-muted-foreground">
                            <Money value={actual} currency={user.currency} />
                            {target > 0 && (
                              <>
                                {" "}
                                ({formatPercent(percent)} of{" "}
                                <Money value={target} currency={user.currency} />)
                              </>
                            )}
                          </span>
                        </div>
                        {target > 0 && (
                          <Progress
                            value={Math.min(100, percent)}
                            aria-label={`${name}: ${percent}% of target`}
                            indicatorClassName={
                              name === "Expenses" && percent > 100 ? "bg-danger" : "bg-[var(--viz-1)]"
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                  <p className="pt-2 text-xs text-muted-foreground">
                    Set targets in{" "}
                    <Link href="/settings" className="underline underline-offset-4">
                      Settings
                    </Link>{" "}
                    and monthly budgets on the{" "}
                    <Link href="/budget" className="underline underline-offset-4">
                      Budget
                    </Link>{" "}
                    page for detailed performance tracking.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
