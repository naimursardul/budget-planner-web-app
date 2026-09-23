"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, Debt, Transaction } from "@/models";
import { requireUser } from "@/lib/session";
import { debtSchema } from "@/lib/validations/debt";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

function revalidateDebt() {
  for (const path of ["/debt", "/dashboard", "/transactions", "/reports"]) {
    revalidatePath(path);
  }
}

export async function createDebtAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = debtSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    originalBalance: formData.get("originalBalance"),
    currentBalance: formData.get("currentBalance"),
    interestRate: formData.get("interestRate") ?? 0,
    minimumPayment: formData.get("minimumPayment") ?? 0,
    dueDate: formData.get("dueDate") ?? 1,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    await Debt.create({ userId: user.id, ...parsed.data, type: parsed.data.type });
  } catch {
    return { error: "We couldn't save that debt. Please try again." };
  }

  revalidateDebt();
  return { success: "Debt saved" };
}

export async function updateDebtAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing debt reference." };

  const parsed = debtSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    originalBalance: formData.get("originalBalance"),
    currentBalance: formData.get("currentBalance"),
    interestRate: formData.get("interestRate") ?? 0,
    minimumPayment: formData.get("minimumPayment") ?? 0,
    dueDate: formData.get("dueDate") ?? 1,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const result = await Debt.updateOne(
      { _id: id, userId: user.id as never },
      { $set: parsed.data }
    );
    if (result.matchedCount === 0) return { error: "Debt not found." };
  } catch {
    return { error: "We couldn't update that debt. Please try again." };
  }

  revalidateDebt();
  return { success: "Debt updated" };
}

/** Record a payment against a debt: lowers the balance and writes a transaction. */
export async function payDebtAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  if (!id || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid payment amount." };
  }

  try {
    await connectDB();
    const debt = await Debt.findOne({ _id: id, userId: user.id as never });
    if (!debt) return { error: "Debt not found." };

    debt.currentBalance = round2(Math.max(0, debt.currentBalance - amount));
    await debt.save();

    const category =
      (await Category.findOne({ userId: user.id as never, type: "debt", name: debt.type }).lean()) ??
      (await Category.findOne({ userId: user.id as never, type: "debt", name: "Other Debt" }).lean());

    await Transaction.create({
      userId: user.id,
      type: "debt",
      categoryId: category?._id ?? null,
      categoryName: category?.name ?? debt.type,
      description: `Debt payment — ${debt.name}`,
      amount: round2(amount),
      date: new Date(),
      account: "Main",
      recurring: false,
    });
  } catch {
    return { error: "We couldn't record that payment. Please try again." };
  }

  revalidateDebt();
  return { success: "Payment recorded" };
}

export async function deleteDebtAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await connectDB();
  await Debt.deleteOne({ _id: id, userId: user.id as never });
  revalidateDebt();
}
