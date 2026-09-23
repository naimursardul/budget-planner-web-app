/** Shared domain types — single source of truth for enums used across
 *  Zod schemas, Mongoose models, and UI components. */

export const TRANSACTION_TYPES = ["income", "expense", "savings", "bill", "debt"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const CATEGORY_TYPES = ["income", "expense", "savings", "bill", "debt"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const PRIORITIES = ["essential", "high", "moderate", "low", "avoidable"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const BILL_FREQUENCIES = ["one_time", "weekly", "monthly", "yearly"] as const;
export type BillFrequency = (typeof BILL_FREQUENCIES)[number];

export const BILL_STATUSES = ["upcoming", "paid", "overdue"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const CALENDAR_EVENT_TYPES = ["bill", "income", "debt", "savings", "custom"] as const;
export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const PLANS = ["one_year", "two_year"] as const;
export type Plan = (typeof PLANS)[number];

export const PURCHASE_STATUSES = ["active", "expired", "refunded", "cancelled"] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const ACCESS_STATUSES = ["trialing", "active", "expired"] as const;
export type AccessStatus = (typeof ACCESS_STATUSES)[number];

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];

export const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY"] as const;
export type DateFormat = (typeof DATE_FORMATS)[number];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface BudgetItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  priority: Priority;
}

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budget: number;
  actual: number;
  remaining: number;
  percent: number;
  status: "under" | "near" | "over" | "unbudgeted";
  priority: Priority;
}

export interface MonthTotals {
  income: number;
  expense: number;
  savings: number;
  bill: number;
  debt: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totals: MonthTotals;
  remaining: number;
  byCategory: CategorySpend[];
  budgetProgress: BudgetProgress[];
}
