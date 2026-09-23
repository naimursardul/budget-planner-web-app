"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, SavingsGoal, Transaction } from "@/models";
import { requireUser } from "@/lib/session";
import { contributionSchema, savingsGoalSchema } from "@/lib/validations/savings";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

function revalidateSavings() {
  for (const path of ["/savings", "/dashboard", "/transactions", "/reports"]) {
    revalidatePath(path);
  }
}

export async function createGoalAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = savingsGoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    currentAmount: formData.get("currentAmount") ?? 0,
    deadline: formData.get("deadline") ?? "",
    monthlyContribution: formData.get("monthlyContribution") ?? 0,
    color: formData.get("color") ?? "#B8DDB0",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  try {
    await connectDB();
    await SavingsGoal.create({
      userId: user.id,
      name: data.name,
      targetAmount: round2(data.targetAmount),
      currentAmount: round2(data.currentAmount),
      deadline: data.deadline ? new Date(data.deadline) : null,
      monthlyContribution: round2(data.monthlyContribution),
      color: data.color,
    });
  } catch {
    return { error: "We couldn't save that goal. Please try again." };
  }

  revalidateSavings();
  return { success: "Goal created" };
}

export async function updateGoalAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing goal reference." };

  const parsed = savingsGoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    currentAmount: formData.get("currentAmount") ?? 0,
    deadline: formData.get("deadline") ?? "",
    monthlyContribution: formData.get("monthlyContribution") ?? 0,
    color: formData.get("color") ?? "#B8DDB0",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  try {
    await connectDB();
    const result = await SavingsGoal.updateOne(
      { _id: id, userId: user.id as never },
      {
        $set: {
          name: data.name,
          targetAmount: round2(data.targetAmount),
          currentAmount: round2(data.currentAmount),
          deadline: data.deadline ? new Date(data.deadline) : null,
          monthlyContribution: round2(data.monthlyContribution),
          color: data.color,
        },
      }
    );
    if (result.matchedCount === 0) return { error: "Goal not found." };
  } catch {
    return { error: "We couldn't update that goal. Please try again." };
  }

  revalidateSavings();
  return { success: "Goal updated" };
}

/** Add a contribution: bumps the goal AND records a savings transaction. */
export async function addContributionAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = contributionSchema.safeParse({
    goalId: formData.get("goalId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const goal = await SavingsGoal.findOne({
      _id: parsed.data.goalId,
      userId: user.id as never,
    });
    if (!goal) return { error: "Goal not found." };

    goal.currentAmount = round2(goal.currentAmount + parsed.data.amount);
    await goal.save();

    // Record the savings transaction (categorized under the goal's name if a
    // matching savings category exists, else the generic "Other Savings")
    const category =
      (await Category.findOne({ userId: user.id as never, type: "savings", name: goal.name }).lean()) ??
      (await Category.findOne({ userId: user.id as never, type: "savings", name: "Other Savings" }).lean());

    await Transaction.create({
      userId: user.id,
      type: "savings",
      categoryId: category?._id ?? null,
      categoryName: category?.name ?? goal.name,
      description: `Savings contribution — ${goal.name}`,
      amount: round2(parsed.data.amount),
      date: new Date(),
      account: "Savings",
      recurring: false,
    });
  } catch {
    return { error: "We couldn't add that contribution. Please try again." };
  }

  revalidateSavings();
  return { success: "Contribution added" };
}

export async function deleteGoalAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await connectDB();
  await SavingsGoal.deleteOne({ _id: id, userId: user.id as never });
  revalidateSavings();
}
