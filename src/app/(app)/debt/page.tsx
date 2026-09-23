import { Landmark, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/components/money";
import { EmptyState } from "@/components/empty-state";
import { DebtFormDialog, PayDebtDialog } from "@/components/debt/debt-forms";
import { DeleteDebtButton } from "@/components/debt/delete-debt-button";
import { DebtReductionChart } from "@/components/charts/charts";
import { connectDB } from "@/lib/mongodb";
import { Debt, Transaction } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { addMonths, monthKey } from "@/lib/utils";

export const metadata = { title: "Debt" };

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function DebtPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const { month: rawMonth } = await searchParams;
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth ?? "")
    ? rawMonth!
    : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  await connectDB();

  const [debts, payments] = await Promise.all([
    Debt.find({ userId: user.id as never }).sort({ currentBalance: -1 }).lean(),
    Transaction.aggregate<{ _id: { y: number; m: number }; total: number }>([
      { $match: { userId: user.id as never, type: "debt" } },
      {
        $group: {
          _id: { y: { $year: "$date" }, m: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const totalOriginal = debts.reduce((s, d) => s + d.originalBalance, 0);
  const totalCurrent = debts.reduce((s, d) => s + d.currentBalance, 0);
  const totalPaid = totalOriginal - totalCurrent;
  const monthlyPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const payOffPercent = totalOriginal > 0 ? Math.round((totalPaid / totalOriginal) * 100) : 0;

  // Debt balance history: current total minus payments made in later months
  const paymentByMonth = new Map(
    payments.map((p) => [
      `${p._id.y}-${String(p._id.m).padStart(2, "0")}`,
      p.total,
    ])
  );
  const history: { month: string; balance: number }[] = [];
  let running = totalCurrent;
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const key = addMonths(monthKey(now), -i);
    history.unshift({ month: key, balance: Math.max(0, Math.round(running * 100) / 100) });
    running += paymentByMonth.get(key) ?? 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Debt Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Keep every balance in one place and watch it shrink.
          </p>
        </div>
        <DebtFormDialog
          trigger={
            <Button>
              <Plus aria-hidden /> Add Debt
            </Button>
          }
        />
      </div>

      {debts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No debts tracked"
          description="Add a credit card, loan, or any balance you're paying down. Recording payments updates your balances and dashboard automatically."
          action={
            <DebtFormDialog
              trigger={
                <Button>
                  <Plus aria-hidden /> Add Debt
                </Button>
              }
            />
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total debt</p>
              <p className="mt-1 text-2xl font-bold">
                <Money value={totalCurrent} currency={user.currency} />
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total paid off</p>
              <p className="mt-1 text-2xl font-bold text-success">
                <Money value={totalPaid} currency={user.currency} />
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Monthly payments</p>
              <p className="mt-1 text-2xl font-bold">
                <Money value={monthlyPayments} currency={user.currency} />
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="mt-1 text-2xl font-bold">{payOffPercent}% paid</p>
              <div className="mt-2">
                <Progress
                  value={payOffPercent}
                  aria-label={`Debt payoff progress: ${payOffPercent}%`}
                  indicatorClassName="bg-success"
                />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Debt Reduction</CardTitle>
              <CardDescription>Total balance over recent months</CardDescription>
            </CardHeader>
            <CardContent>
              <DebtReductionChart data={history} currency={user.currency} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {debts.map((debt) => {
              const percent =
                debt.originalBalance > 0
                  ? Math.round(
                      ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100
                    )
                  : 0;
              const record = {
                id: String(debt._id),
                name: debt.name,
                type: debt.type,
                originalBalance: debt.originalBalance,
                currentBalance: debt.currentBalance,
                interestRate: debt.interestRate,
                minimumPayment: debt.minimumPayment,
                dueDate: debt.dueDate,
              };
              return (
                <Card key={record.id} className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{debt.name}</h3>
                        <Badge variant="outline">{debt.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {debt.interestRate > 0 && `${debt.interestRate}% interest · `}
                        Due day {debt.dueDate}
                      </p>
                    </div>
                    <span className="text-xl font-bold">
                      <Money value={debt.currentBalance} currency={user.currency} />
                    </span>
                  </div>

                  <div className="mt-4">
                    <Progress
                      value={percent}
                      aria-label={`${debt.name}: ${percent}% paid off`}
                      indicatorClassName="bg-[var(--viz-3)]"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {percent}% paid ·{" "}
                      <Money value={debt.originalBalance} currency={user.currency} /> original
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <PayDebtDialog debt={record} />
                    <div className="flex gap-1">
                      <DebtFormDialog
                        editRecord={record}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                      />
                      <DeleteDebtButton debtId={record.id} debtName={debt.name} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
