import { Bill, Budget, Notification, SavingsGoal, Transaction } from "@/models";
import { budgetStatus } from "@/services/analytics";
import { toObjectId } from "@/lib/mongodb";
import { monthRange } from "@/lib/utils";

interface GeneratedNotification {
  type: "bill_due" | "budget_near" | "budget_over" | "savings_milestone" | "new_month";
  title: string;
  message: string;
  dedupKey: string;
}

/**
 * Generate at most a handful of high-signal notifications. Duplicate events
 * are prevented by the unique (userId, dedupKey) index — insertMany with
 * ordered:false makes repeats no-ops.
 */
export async function generateNotifications(
  userId: string,
  prefs: { billReminders: boolean; budgetAlerts: boolean; savingsMilestones: boolean; monthlySummary: boolean }
): Promise<void> {
  const now = new Date();
  const toGenerate: GeneratedNotification[] = [];

  // 1. Bills due within their reminder window (or overdue)
  if (prefs.billReminders) {
    const bills = await Bill.find({
      userId: userId as never,
      status: { $ne: "paid" },
      dueDate: { $lte: new Date(now.getTime() + 7 * 86400000) },
    }).lean();

    for (const bill of bills) {
      const days = Math.ceil(
        (new Date(bill.dueDate).setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / 86400000
      );
      if (days >= 0 && days > bill.reminderDays) continue;
      toGenerate.push({
        type: "bill_due",
        title: days < 0 ? `Overdue: ${bill.name}` : days === 0 ? `${bill.name} is due today` : `${bill.name} is due in ${days} ${days === 1 ? "day" : "days"}`,
        message:
          days < 0
            ? `This bill was due ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago. Mark it paid when you're ready.`
            : `Amount: ${bill.amount.toFixed(2)}. Mark it paid from the Bills page.`,
        dedupKey: `bill_due:${bill._id}:${new Date(bill.dueDate).toISOString().slice(0, 10)}`,
      });
    }
  }

  // 2. Budget alerts for the current month
  if (prefs.budgetAlerts) {
    const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);
    const [budget, spends] = await Promise.all([
      Budget.findOne({
        userId: userId as never,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }).lean(),
      Transaction.aggregate<{ _id: string; total: number }>([
        {
          $match: {
            userId: toObjectId(userId),
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: "$categoryName", total: { $sum: "$amount" } } },
      ]),
    ]);
    const spendMap = new Map(spends.map((s) => [s._id, s.total]));

    for (const item of budget?.items ?? []) {
      const actual = spendMap.get(item.categoryName) ?? 0;
      const status = budgetStatus(actual, item.amount);
      if (status === "over") {
        toGenerate.push({
          type: "budget_over",
          title: `You've exceeded your ${item.categoryName} budget`,
          message: `${actual.toFixed(2)} spent of a ${item.amount.toFixed(2)} budget.`,
          dedupKey: `budget_over:${item.categoryName}:${now.getFullYear()}-${now.getMonth() + 1}`,
        });
      } else if (status === "near") {
        toGenerate.push({
          type: "budget_near",
          title: `You're close to your ${item.categoryName} budget`,
          message: `${actual.toFixed(2)} spent of a ${item.amount.toFixed(2)} budget.`,
          dedupKey: `budget_near:${item.categoryName}:${now.getFullYear()}-${now.getMonth() + 1}`,
        });
      }
    }
  }

  // 3. Savings milestones (25/50/75/100%)
  if (prefs.savingsMilestones) {
    const goals = await SavingsGoal.find({ userId: userId as never }).lean();
    for (const goal of goals) {
      if (goal.targetAmount <= 0) continue;
      const percent = goal.currentAmount / goal.targetAmount;
      const milestone = [100, 75, 50, 25].find((m) => percent >= m / 100);
      if (milestone === undefined) continue;
      toGenerate.push({
        type: "savings_milestone",
        title:
          milestone === 100
            ? `Goal complete: ${goal.name}! 🎉`
            : `Your ${goal.name} goal is ${milestone}% complete`,
        message: `You've saved ${goal.currentAmount.toFixed(2)} toward ${goal.targetAmount.toFixed(2)}.`,
        dedupKey: `savings_milestone:${goal._id}:${milestone}`,
      });
    }
  }

  // 4. New month summary
  if (prefs.monthlySummary) {
    toGenerate.push({
      type: "new_month",
      title: "A new month has started",
      message: "Your budget is ready — review last month and plan this one.",
      dedupKey: `new_month:${now.getFullYear()}-${now.getMonth() + 1}`,
    });
  }

  if (toGenerate.length === 0) return;

  await Notification.insertMany(
    toGenerate.map((n) => ({ ...n, userId, read: false })),
    { ordered: false }
  ).catch(() => {
    // duplicate dedupKeys are expected — safe to ignore
  });
}

export async function getUnreadNotifications(userId: string, limit = 10) {
  return Notification.find({ userId: userId as never })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId: userId as never, read: false });
}
