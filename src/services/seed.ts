import { Bill, Budget, CalendarEvent, Category, Debt, SavingsGoal, Transaction } from "@/models";
import { billOccurrenceDates } from "@/lib/bill-utils";

/**
 * Populate a workspace with one realistic month of activity so a new user
 * immediately understands how the system works. Used by onboarding
 * ("Start with sample data") and the demo account.
 */
export async function seedSampleData(userId: string): Promise<void> {
  const categories = await Category.find({ userId: userId as never }).lean();
  const byName = new Map(categories.map((c) => [c.name, c]));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const day = (d: number) => new Date(year, month, Math.min(d, 28), 12, 0, 0);
  const prevMonth = new Date(year, month - 1, 15, 12, 0, 0);
  const prevPrevMonth = new Date(year, month - 2, 15, 12, 0, 0);

  const tx = (date: Date, type: string, category: string, description: string, amount: number, account = "Main") => ({
    userId,
    type,
    categoryId: byName.get(category)?._id ?? null,
    categoryName: category,
    subcategory: "",
    description,
    amount,
    date,
    account,
    recurring: false,
  });

  // --- Income ---
  const transactions = [
    tx(day(1), "income", "Salary", "Monthly salary", 4200),
    tx(day(15), "income", "Freelance", "Design project", 650),
    tx(new Date(year, month - 1, 1, 12), "income", "Salary", "Monthly salary", 4200),
    tx(new Date(year, month - 2, 1, 12), "income", "Salary", "Monthly salary", 4100),
  ];

  // --- Expenses ---
  const expenses: [number, string, string, number][] = [
    [2, "Housing", "Rent", 1200],
    [3, "Groceries", "Weekly groceries", 96],
    [10, "Groceries", "Weekly groceries", 104],
    [17, "Groceries", "Weekly groceries", 88],
    [24, "Groceries", "Weekly groceries", 92],
    [5, "Transportation", "Fuel", 55],
    [8, "Dining Out", "Team lunch", 38],
    [14, "Dining Out", "Anniversary dinner", 76],
    [6, "Entertainment", "Cinema tickets", 28],
    [11, "Shopping", "New shoes", 85],
    [19, "Health", "Pharmacy", 32],
    [21, "Personal Care", "Haircut", 25],
    [9, "Subscriptions", "Music streaming", 11],
  ];
  for (const [d, category, description, amount] of expenses) {
    transactions.push(tx(day(d), "expense", category, description, amount));
  }
  // Previous months: lighter history for cash-flow charts
  for (const date of [prevMonth, prevPrevMonth]) {
    for (const [category, amount] of [
      ["Housing", 1200],
      ["Groceries", 380],
      ["Transportation", 60],
      ["Dining Out", 90],
      ["Entertainment", 40],
    ] as [string, number][]) {
      transactions.push(tx(date, "expense", category, "Regular spending", amount));
    }
  }

  // --- Bills paid this month ---
  for (const [category, description, amount] of [
    ["Electricity", "Electricity bill", 84],
    ["Internet", "Internet bill", 60],
    ["Phone", "Phone plan", 35],
  ] as [string, string, number][]) {
    transactions.push(tx(day(4), "bill", category, description, amount));
  }

  // --- Savings + debt ---
  transactions.push(tx(day(5), "savings", "Emergency Fund", "Automatic transfer", 300, "Savings"));
  transactions.push(tx(day(5), "savings", "Vacation", "Vacation fund transfer", 150, "Savings"));
  transactions.push(tx(day(20), "debt", "Credit Card", "Card payment", 120));

  await Transaction.insertMany(transactions);

  // --- Bills (upcoming) ---
  const upcomingBills: [string, string, number, number][] = [
    ["Electricity", "Electricity", 84, 5],
    ["Water", "Water", 28, 7],
    ["Internet", "Internet", 60, 12],
    ["Phone", "Phone plan", 35, 18],
    ["Streaming", "Video streaming", 15, 22],
  ];
  for (const [category, name, amount, dueDay] of upcomingBills) {
    const bill = await Bill.create({
      userId,
      name,
      categoryId: byName.get(category)?._id ?? null,
      categoryName: category,
      amount,
      dueDate: new Date(year, month + 1, dueDay, 12, 0, 0),
      frequency: "monthly",
      autoPay: category === "Internet",
      reminderDays: 2,
      status: "upcoming",
    });
    await CalendarEvent.insertMany(
      billOccurrenceDates(bill.dueDate, "monthly").map((date) => ({
        userId,
        title: `${name} — bill`,
        date,
        color: "#F6C49C",
        type: "bill" as const,
        notes: "Bill payment (auto-created)",
        completed: false,
        sourceId: bill._id,
      }))
    );
  }

  // --- Savings goals ---
  await SavingsGoal.insertMany([
    {
      userId,
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 4250,
      deadline: null,
      monthlyContribution: 300,
      color: "#B8DDB0",
    },
    {
      userId,
      name: "Vacation",
      targetAmount: 3000,
      currentAmount: 1300,
      deadline: new Date(year + 1, 5, 30),
      monthlyContribution: 150,
      color: "#B9E3EA",
    },
  ]);

  // --- Debt ---
  await Debt.create({
    userId,
    name: "Visa Card",
    type: "Credit Card",
    originalBalance: 2400,
    currentBalance: 1560,
    interestRate: 18.9,
    minimumPayment: 120,
    dueDate: 20,
  });

  // --- Budget for the current month ---
  const budgetLines: [string, number][] = [
    ["Housing", 1200],
    ["Groceries", 450],
    ["Transportation", 80],
    ["Dining Out", 120],
    ["Entertainment", 60],
    ["Shopping", 100],
    ["Health", 50],
    ["Personal Care", 40],
    ["Subscriptions", 30],
  ];
  await Budget.findOneAndUpdate(
    { userId: userId as never, year, month: month + 1 },
    {
      $set: {
        items: budgetLines
          .filter(([name]) => byName.has(name))
          .map(([name, amount]) => ({
            categoryId: byName.get(name)!._id,
            categoryName: name,
            amount,
            priority: byName.get(name)!.priority,
          })),
      },
    },
    { upsert: true }
  );
}
