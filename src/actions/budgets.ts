"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Budget, Category } from "@/models";
import { requireUser } from "@/lib/session";
import { saveBudgetSchema } from "@/lib/validations/budget";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

/** Save (create or replace) a month's budget lines. */
export async function saveBudgetAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? "[]"));
  } catch {
    return { error: "Invalid budget data." };
  }

  const parsed = saveBudgetSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
    items: raw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { year, month, items } = parsed.data;

  try {
    await connectDB();

    // Verify every category belongs to this user before writing
    const categoryIds = items.map((i) => i.categoryId);
    const owned = await Category.find({
      _id: { $in: categoryIds },
      userId: user.id as never,
    }).lean();
    const ownedById = new Map(owned.map((c) => [String(c._id), c]));

    const budgetItems = items
      .filter((i) => ownedById.has(i.categoryId) && i.amount > 0)
      .map((i) => {
        const cat = ownedById.get(i.categoryId)!;
        return {
          categoryId: cat._id,
          categoryName: cat.name,
          amount: round2(i.amount),
          priority: cat.priority,
        };
      });

    await Budget.findOneAndUpdate(
      { userId: user.id as never, year, month },
      { $set: { items: budgetItems } },
      { upsert: true, new: true }
    );
  } catch {
    return { error: "We couldn't save your budget. Please try again." };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return { success: "Budget saved" };
}

/** Copy last month's budget into the selected month (quick start). */
export async function copyPreviousBudgetAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  if (!year || !month || month < 1 || month > 12) {
    return { error: "Invalid month selected." };
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  try {
    await connectDB();
    const prev = await Budget.findOne({
      userId: user.id as never,
      year: prevYear,
      month: prevMonth,
    }).lean();
    if (!prev || prev.items.length === 0) {
      return { error: "No previous budget found to copy." };
    }

    await Budget.findOneAndUpdate(
      { userId: user.id as never, year, month },
      { $set: { items: prev.items } },
      { upsert: true }
    );
  } catch {
    return { error: "We couldn't copy your budget. Please try again." };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { success: "Previous budget copied" };
}
