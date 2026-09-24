import { Budget, Transaction } from "@/models";
import { toObjectId } from "@/lib/mongodb";
import type { BudgetProgress, CategorySpend, MonthTotals, MonthlySummary } from "@/types";
import { addMonths, monthKey, monthRange, parseMonthKey, round2 } from "@/lib/utils";

export function budgetStatus(actual: number, budget: number): BudgetProgress["status"] {
  if (budget <= 0) return "unbudgeted";
  if (actual > budget) return "over";
  if (actual >= budget * 0.8) return "near";
  return "under";
}

/** Totals per transaction type for a given month. */
async function totalsForRange(
  userId: string,
  start: Date,
  end: Date
): Promise<MonthTotals & { byCategory: CategorySpend[] }> {
  const uid = toObjectId(userId);
  const [byType, byCategory] = await Promise.all([
    Transaction.aggregate<{ _id: string; total: number }>([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate<{ _id: string; categoryId: unknown; total: number }>([
      {
        $match: {
          userId: uid,
          type: "expense",
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$categoryName",
          categoryId: { $first: "$categoryId" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]),
  ]);

  const totals: MonthTotals = { income: 0, expense: 0, savings: 0, bill: 0, debt: 0 };
  for (const row of byType) {
    if (row._id in totals) totals[row._id as keyof MonthTotals] = round2(row.total);
  }

  return {
    ...totals,
    byCategory: byCategory.map((c) => ({
      categoryId: String(c.categoryId ?? ""),
      categoryName: c._id,
      amount: round2(c.total),
    })),
  };
}

/**
 * The single monthly engine behind the dashboard, budget (both the plan and
 * priorities views), and reports pages. Everything is computed from real
 * transaction data.
 */
export async function getMonthlySummary(userId: string, month: string): Promise<MonthlySummary> {
  const { year, month: m } = parseMonthKey(month);
  const { start, end } = monthRange(year, m);

  const [rangeData, budget] = await Promise.all([
    totalsForRange(userId, start, end),
    Budget.findOne({ userId: userId as never, year, month: m }).lean(),
  ]);

  const spendByCategory = new Map(rangeData.byCategory.map((c) => [c.categoryName, c.amount]));

  const budgetProgress: BudgetProgress[] = (budget?.items ?? []).map((item) => {
    const actual = spendByCategory.get(item.categoryName) ?? 0;
    spendByCategory.delete(item.categoryName);
    return {
      categoryId: String(item.categoryId),
      categoryName: item.categoryName,
      budget: round2(item.amount),
      actual: round2(actual),
      remaining: round2(item.amount - actual),
      percent: item.amount > 0 ? Math.round((actual / item.amount) * 100) : 0,
      status: budgetStatus(actual, item.amount),
      priority: item.priority,
    };
  });

  // Categories with spending but no budget line still show up (unbudgeted)
  for (const [name, amount] of spendByCategory) {
    budgetProgress.push({
      categoryId: "",
      categoryName: name,
      budget: 0,
      actual: round2(amount),
      remaining: 0,
      percent: 0,
      status: "unbudgeted",
      priority: "moderate",
    });
  }
  budgetProgress.sort((a, b) => b.actual - a.actual);

  return {
    month,
    totals: {
      income: rangeData.income,
      expense: rangeData.expense,
      savings: rangeData.savings,
      bill: rangeData.bill,
      debt: rangeData.debt,
    },
    remaining: round2(rangeData.income - rangeData.expense - rangeData.savings - rangeData.debt),
    byCategory: rangeData.byCategory,
    budgetProgress,
  };
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

/** Income/expense/savings per month for the trailing N months (inclusive of `endMonth`). */
export async function getCashFlow(
  userId: string,
  endMonth: string,
  months = 6
): Promise<CashFlowPoint[]> {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) keys.push(addMonths(endMonth, -i));

  const start = monthRange(parseMonthKey(keys[0]).year, parseMonthKey(keys[0]).month).start;
  const end = monthRange(parseMonthKey(keys[keys.length - 1]).year, parseMonthKey(keys[keys.length - 1]).month).end;

  const rows = await Transaction.aggregate<{
    _id: { y: number; m: number; type: string };
    total: number;
  }>([
    {
      $match: {
        userId: toObjectId(userId),
        date: { $gte: start, $lte: end },
        type: { $in: ["income", "expense", "savings"] },
      },
    },
    {
      $group: {
        _id: { y: { $year: "$date" }, m: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const map = new Map(rows.map((r) => [`${r._id.y}-${String(r._id.m).padStart(2, "0")}-${r._id.type}`, round2(r.total)]));

  return keys.map((k) => ({
    month: k,
    income: map.get(`${k}-income`) ?? 0,
    expenses: map.get(`${k}-expense`) ?? 0,
    savings: map.get(`${k}-savings`) ?? 0,
  }));
}

export async function currentMonthSavings(userId: string): Promise<number> {
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);
  const rows = await Transaction.aggregate<{ total: number }>([
    {
      $match: {
        userId: toObjectId(userId),
        type: "savings",
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows[0] ? round2(rows[0].total) : 0;
}

/** Totals for every month of a given year (for reports / year view). */
export async function getYearlyTotals(
  userId: string,
  year: number
): Promise<Record<string, MonthTotals>> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const rows = await Transaction.aggregate<{
    _id: { y: number; m: number; type: string };
    total: number;
  }>([
    { $match: { userId: toObjectId(userId), date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { y: { $year: "$date" }, m: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const result: Record<string, MonthTotals> = {};
  for (const row of rows) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, "0")}`;
    if (!result[key]) result[key] = { income: 0, expense: 0, savings: 0, bill: 0, debt: 0 };
    if (row._id.type in result[key]) {
      result[key][row._id.type as keyof MonthTotals] = round2(row.total);
    }
  }
  return result;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}
