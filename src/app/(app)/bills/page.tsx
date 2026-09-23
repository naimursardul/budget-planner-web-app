import { Plus, Receipt, Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Money } from "@/components/money";
import { BillFormDialog } from "@/components/bills/bill-form";
import { BillActions } from "@/components/bills/bill-actions";
import { connectDB } from "@/lib/mongodb";
import { Bill, Category } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import type { BillFrequency } from "@/types";

export const metadata = { title: "Bills" };

const FREQ_LABELS: Record<BillFrequency, string> = {
  one_time: "One-time",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export default async function BillsPage() {
  const user = await requireOnboardedUser();
  await connectDB();

  const [bills, billCategories] = await Promise.all([
    Bill.find({ userId: user.id as never }).sort({ dueDate: 1 }).lean(),
    Category.find({ userId: user.id as never, type: "bill" }).sort({ name: 1 }).lean(),
  ]);

  const categories = billCategories.map((c) => ({ id: String(c._id), name: c.name }));

  const now = new Date();
  const upcoming = bills.filter((b) => b.dueDate >= now && b.status !== "paid");
  const overdue = bills.filter((b) => b.dueDate < now && b.status !== "paid");
  const paid = bills.filter((b) => b.status === "paid");

  const totalUpcoming = upcoming.reduce((s, b) => s + b.amount, 0);
  const totalOverdue = overdue.reduce((s, b) => s + b.amount, 0);

  function BillCard({ bill }: { bill: (typeof bills)[number] }) {
    const days = daysUntil(bill.dueDate);
    const isOverdue = days < 0 && bill.status !== "paid";
    return (
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4"
        role="listitem"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{bill.name}</p>
            <Badge variant={isOverdue ? "danger" : bill.status === "paid" ? "success" : "sky"}>
              {isOverdue
                ? `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"}`
                : bill.status === "paid"
                  ? "Paid"
                  : days === 0
                    ? "Due today"
                    : `Due in ${days} ${days === 1 ? "day" : "days"}`}
            </Badge>
            {bill.autoPay && <Badge variant="outline">Auto-pay</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {bill.categoryName} · {FREQ_LABELS[bill.frequency]} · Due {formatDate(bill.dueDate, user.dateFormat)}
          </p>
        </div>
        <p className="text-lg font-bold">
          <Money value={bill.amount} currency={user.currency} />
        </p>
        {bill.status !== "paid" && (
          <BillActions
            bill={{
              id: String(bill._id),
              name: bill.name,
              categoryId: bill.categoryId ? String(bill.categoryId) : "",
              amount: bill.amount,
              dueDate: bill.dueDate.toISOString().slice(0, 10),
              frequency: bill.frequency,
              autoPay: bill.autoPay,
              reminderDays: bill.reminderDays,
            }}
            categories={categories}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
          <p className="text-sm text-muted-foreground">
            {bills.length} {bills.length === 1 ? "bill" : "bills"} tracked
            {overdue.length > 0 && (
              <span className="text-danger"> · {overdue.length} overdue</span>
            )}
          </p>
        </div>
        <BillFormDialog
          categories={categories}
          trigger={
            <Button>
              <Plus aria-hidden /> Add Bill
            </Button>
          }
        />
      </div>

      {bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Add your recurring bills and we'll track due dates, remind you before they're due, and put them on your calendar automatically."
          action={
            <BillFormDialog
              categories={categories}
              trigger={
                <Button>
                  <Plus aria-hidden /> Add Bill
                </Button>
              }
            />
          }
        />
      ) : (
        <>
          {overdue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-danger">Overdue</CardTitle>
                <CardDescription>
                  Total overdue: <Money value={totalOverdue} currency={user.currency} />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3" role="list">
                {overdue.map((bill) => (
                  <BillCard key={String(bill._id)} bill={bill} />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>
                {upcoming.length} upcoming · Total: <Money value={totalUpcoming} currency={user.currency} />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3" role="list">
              {upcoming.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nothing due right now — nice work staying ahead.
                </p>
              ) : (
                upcoming.map((bill) => <BillCard key={String(bill._id)} bill={bill} />)
              )}
            </CardContent>
          </Card>

          {paid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Paid</CardTitle>
                <CardDescription>Completed one-time bills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3" role="list">
                {paid.map((bill) => (
                  <BillCard key={String(bill._id)} bill={bill} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
