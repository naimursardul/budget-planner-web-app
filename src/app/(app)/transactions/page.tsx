import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TransactionFormDialog } from "@/components/transactions/transaction-form";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionFilters } from "@/components/transactions/transactions-filters";
import { connectDB } from "@/lib/mongodb";
import { Category, Transaction } from "@/models";
import { requireOnboardedUser } from "@/lib/session";
import { transactionFilterSchema } from "@/lib/validations/transaction";
import { round2 } from "@/lib/utils";

export const metadata = { title: "Transactions" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 15;

export default async function TransactionsPage({ searchParams }: PageProps) {
  const user = await requireOnboardedUser();
  const raw = Object.fromEntries(
    Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
  const parsed = transactionFilterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : transactionFilterSchema.parse({});

  await connectDB();

  const query: Record<string, unknown> = { userId: user.id as never };
  if (filters.type !== "all") query.type = filters.type;
  if (filters.category !== "all") query.categoryName = filters.category;
  if (filters.account !== "all") query.account = filters.account;
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) (query.date as Record<string, unknown>).$gte = new Date(filters.from);
    if (filters.to) (query.date as Record<string, unknown>).$lte = new Date(`${filters.to}T23:59:59.999`);
  }
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) (query.amount as Record<string, unknown>).$gte = filters.minAmount;
    if (filters.maxAmount !== undefined) (query.amount as Record<string, unknown>).$lte = filters.maxAmount;
  }
  if (filters.q) {
    query.$or = [
      { description: { $regex: filters.q, $options: "i" } },
      { categoryName: { $regex: filters.q, $options: "i" } },
      { subcategory: { $regex: filters.q, $options: "i" } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    date_desc: { date: -1 },
    date_asc: { date: 1 },
    amount_desc: { amount: -1 },
    amount_asc: { amount: 1 },
  };

  const [rows, total, categories] = await Promise.all([
    Transaction.find(query as never)
      .sort(sortMap[filters.sort])
      .skip((filters.page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Transaction.countDocuments(query as never),
    Category.find({ userId: user.id as never }).sort({ type: 1, order: 1, name: 1 }).lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryOptions = categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    type: c.type,
  }));
  const accountNames = [
    ...new Set(rows.map((r) => r.account)),
    "Main",
    "Checking",
    "Savings",
    "Cash",
    "Credit Card",
  ];

  const tableRecords = rows.map((r) => ({
    id: String(r._id),
    date: r.date.toISOString().slice(0, 10),
    type: r.type,
    categoryId: r.categoryId ? String(r.categoryId) : "",
    categoryName: r.categoryName,
    subcategory: r.subcategory,
    description: r.description,
    amount: round2(r.amount),
    account: r.account,
    recurring: r.recurring,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "record" : "records"}
            {total > 0 && ` · showing page ${filters.page} of ${totalPages}`}
          </p>
        </div>
        <TransactionFormDialog
          categories={categoryOptions}
          trigger={
            <Button>
              <Plus aria-hidden /> Add Transaction
            </Button>
          }
        />
      </div>

      <TransactionFilters
        filters={filters}
        categories={categories.map((c) => ({ name: c.name, type: c.type }))}
        accounts={accountNames}
      />

      {tableRecords.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description="Create your first transaction to start tracking your money. Everything on your dashboard updates automatically."
          action={
            <TransactionFormDialog
              categories={categoryOptions}
              trigger={
                <Button>
                  <Plus aria-hidden /> Add Transaction
                </Button>
              }
            />
          }
        />
      ) : (
        <Card>
          <TransactionsTable
            records={tableRecords}
            categories={categoryOptions}
            currency={user.currency}
            dateFormat={user.dateFormat}
          />
        </Card>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="Pagination">
          {filters.page > 1 ? (
            <Link
              href={{
                pathname: "/transactions",
                query: { ...raw, page: filters.page - 1 },
              }}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {filters.page < totalPages ? (
            <Link
              href={{
                pathname: "/transactions",
                query: { ...raw, page: filters.page + 1 },
              }}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
