/**
 * Seed a demo account with realistic sample data.
 *
 *   npm run seed
 *
 * Creates (or resets) demo@smartbudgetplanner.app / demo1234 — an isolated
 * user flagged `isDemo`, with default categories, six months of transactions,
 * bills, savings goals, debt, and budgets, so every screen has something
 * meaningful to show.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../src/models/User";
import {
  Bill,
  Budget,
  CalendarEvent,
  Category,
  Debt,
  Notification,
  Purchase,
  SavingsGoal,
  Transaction,
} from "../src/models";
import { ensureDefaultCategories } from "../src/services/categories";
import { seedSampleData } from "../src/services/seed";

const DEMO_EMAIL = "demo@smartbudgetplanner.app";
const DEMO_PASSWORD = "demo1234";

async function main() {
  // Connect directly rather than through `src/lib/mongodb` — that module is
  // marked `server-only`, which only resolves inside Next's bundler, and its
  // hot-reload connection cache is meaningless in a one-shot script.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI — copy .env.example to .env and set it first.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Idempotent: wipe the previous demo user's workspace before reseeding.
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    const userId = existing._id;
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Category.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      Bill.deleteMany({ userId }),
      CalendarEvent.deleteMany({ userId }),
      SavingsGoal.deleteMany({ userId }),
      Debt.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      Purchase.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);
    console.log("Removed previous demo user.");
  }

  const user = await User.create({
    name: "Demo User",
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    currency: "USD",
    monthlyIncome: 4200,
    monthlySavingsGoal: 500,
    onboardingCompleted: true,
    isDemo: true,
    // Demo access is granted operationally here (no Purchase record — this is
    // a seed script, not a browser request; real users pay via Lemon Squeezy).
    accessStatus: "active",
    currentPlan: "one_year",
    activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  await ensureDefaultCategories(user._id.toString());
  await seedSampleData(user._id.toString());

  // Extend history to a full six months so cash-flow and reports look real.
  const byName = new Map(
    (await Category.find({ userId: user._id }).lean()).map((c) => [c.name, c])
  );
  const now = new Date();
  const extra = [];
  for (let back = 3; back <= 5; back++) {
    const date = new Date(now.getFullYear(), now.getMonth() - back, 15, 12, 0, 0);
    extra.push({
      userId: user._id,
      type: "income",
      categoryId: byName.get("Salary")?._id ?? null,
      categoryName: "Salary",
      subcategory: "",
      description: "Monthly salary",
      amount: 4000 + back * 25,
      date: new Date(date.getFullYear(), date.getMonth(), 1, 12),
      account: "Main",
      recurring: true,
    });
    for (const [category, amount] of [
      ["Housing", 1200],
      ["Groceries", 390],
      ["Transportation", 65],
      ["Dining Out", 95],
      ["Entertainment", 45],
      ["Health", 30],
    ] as [string, number][]) {
      extra.push({
        userId: user._id,
        type: "expense",
        categoryId: byName.get(category)?._id ?? null,
        categoryName: category,
        subcategory: "",
        description: "Regular spending",
        amount,
        date,
        account: "Main",
        recurring: false,
      });
    }
  }
  await Transaction.insertMany(extra);

  const count = await Transaction.countDocuments({ userId: user._id });
  console.log(`Demo user ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Workspace: ${count} transactions, categories, bills, goals, debt, budget seeded.`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
