import type { CategoryType, Priority } from "@/types";
import { Category } from "@/models/Category";

interface CategoryDef {
  name: string;
  type: CategoryType;
  priority: Priority;
  color: string;
}

const C = {
  lavender: "#C9BCE8",
  sage: "#B8DDB0",
  sky: "#B9E3EA",
  blush: "#F6C1CC",
  peach: "#F6C49C",
  dark: "#7A7480",
};

/** Default categories per transaction type, from the product spec. */
export const DEFAULT_CATEGORIES: CategoryDef[] = [
  // INCOME
  { name: "Salary", type: "income", priority: "essential", color: C.sage },
  { name: "Freelance", type: "income", priority: "moderate", color: C.sky },
  { name: "Business", type: "income", priority: "moderate", color: C.lavender },
  { name: "Interest", type: "income", priority: "low", color: C.peach },
  { name: "Dividends", type: "income", priority: "low", color: C.blush },
  { name: "Other Income", type: "income", priority: "low", color: C.dark },

  // EXPENSES
  { name: "Groceries", type: "expense", priority: "essential", color: C.sage },
  { name: "Dining Out", type: "expense", priority: "low", color: C.peach },
  { name: "Shopping", type: "expense", priority: "low", color: C.blush },
  { name: "Transportation", type: "expense", priority: "high", color: C.sky },
  { name: "Housing", type: "expense", priority: "essential", color: C.lavender },
  { name: "Utilities", type: "expense", priority: "essential", color: C.dark },
  { name: "Health", type: "expense", priority: "essential", color: C.sage },
  { name: "Entertainment", type: "expense", priority: "low", color: C.blush },
  { name: "Subscriptions", type: "expense", priority: "moderate", color: C.lavender },
  { name: "Personal Care", type: "expense", priority: "moderate", color: C.peach },
  { name: "Education", type: "expense", priority: "high", color: C.sky },
  { name: "Pets", type: "expense", priority: "moderate", color: C.sage },
  { name: "Gifts", type: "expense", priority: "low", color: C.blush },
  { name: "Other Expenses", type: "expense", priority: "moderate", color: C.dark },

  // SAVINGS
  { name: "Emergency Fund", type: "savings", priority: "essential", color: C.sage },
  { name: "Vacation", type: "savings", priority: "moderate", color: C.sky },
  { name: "Retirement", type: "savings", priority: "high", color: C.lavender },
  { name: "House", type: "savings", priority: "high", color: C.peach },
  { name: "Car", type: "savings", priority: "moderate", color: C.blush },
  { name: "Other Savings", type: "savings", priority: "low", color: C.dark },

  // BILLS
  { name: "Electricity", type: "bill", priority: "essential", color: C.peach },
  { name: "Water", type: "bill", priority: "essential", color: C.sky },
  { name: "Internet", type: "bill", priority: "essential", color: C.lavender },
  { name: "Phone", type: "bill", priority: "essential", color: C.sage },
  { name: "Rent", type: "bill", priority: "essential", color: C.dark },
  { name: "Insurance", type: "bill", priority: "essential", color: C.blush },
  { name: "Streaming", type: "bill", priority: "low", color: C.lavender },
  { name: "Gas", type: "bill", priority: "essential", color: C.peach },
  { name: "Healthcare", type: "bill", priority: "essential", color: C.sage },
  { name: "Other Bills", type: "bill", priority: "moderate", color: C.dark },

  // DEBT
  { name: "Credit Card", type: "debt", priority: "high", color: C.blush },
  { name: "Student Loan", type: "debt", priority: "high", color: C.lavender },
  { name: "Car Loan", type: "debt", priority: "high", color: C.sky },
  { name: "Mortgage", type: "debt", priority: "essential", color: C.dark },
  { name: "Personal Loan", type: "debt", priority: "high", color: C.peach },
  { name: "Medical Debt", type: "debt", priority: "high", color: C.sage },
  { name: "Other Debt", type: "debt", priority: "moderate", color: C.dark },
];

/** Duplicate key — expected when two callers race the same upsert. */
function isDuplicateKeyError(error: unknown): boolean {
  const e = error as { code?: number; writeErrors?: { code?: number }[] } | null;
  if (!e) return false;
  if (e.code === 11000) return true;
  return (
    Array.isArray(e.writeErrors) &&
    e.writeErrors.length > 0 &&
    e.writeErrors.every((w) => w.code === 11000)
  );
}

/**
 * Seed the default category set for a user. Genuinely idempotent: it is called
 * at registration and again when onboarding finishes, so it upserts on the
 * `{userId, name, type}` unique index rather than inserting. `insertMany` —
 * even unordered — still throws a bulk write error once the duplicates exist.
 *
 * `$setOnInsert` means a re-run never overwrites a colour, priority or order
 * the user has since customised on one of these categories.
 */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  try {
    await Category.bulkWrite(
      DEFAULT_CATEGORIES.map((c, i) => ({
        updateOne: {
          filter: { userId: userId as never, name: c.name, type: c.type },
          update: {
            $setOnInsert: {
              userId: userId as never,
              name: c.name,
              type: c.type,
              priority: c.priority,
              color: c.color,
              order: i,
              isDefault: true,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  } catch (error) {
    // Two concurrent upserts can still collide on the unique index; the row
    // exists either way, which is all this function promises. Anything else
    // is a real failure and must not be swallowed.
    if (!isDuplicateKeyError(error)) throw error;
  }
}
