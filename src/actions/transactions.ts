"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, Transaction } from "@/models";
import { requireUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validations/transaction";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

function revalidateAll() {
  for (const path of [
    "/dashboard",
    "/transactions",
    "/budget",
    "/calendar",
    "/savings",
    "/debt",
    "/priorities",
    "/reports",
    "/bills",
  ]) {
    revalidatePath(path);
  }
}

/** Ownership is verified server-side: both the transaction AND the category
 *  must belong to the session user. */
export async function createTransactionAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    subcategory: formData.get("subcategory") ?? "",
    description: formData.get("description") ?? "",
    amount: formData.get("amount"),
    account: formData.get("account") ?? "Main",
    recurring: formData.get("recurring") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  try {
    await connectDB();
    const category = await Category.findOne({
      _id: data.categoryId,
      userId: user.id as never,
    }).lean();
    if (!category) return { error: "That category wasn't found. Please choose another." };

    await Transaction.create({
      userId: user.id,
      type: data.type,
      categoryId: category._id,
      categoryName: category.name,
      subcategory: data.subcategory,
      description: data.description,
      amount: round2(data.amount),
      date: new Date(data.date),
      account: data.account,
      recurring: data.recurring,
    });
  } catch {
    return { error: "We couldn't save that transaction. Please try again." };
  }

  revalidateAll();
  return { success: "Transaction saved" };
}

export async function updateTransactionAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing transaction reference." };

  const parsed = transactionSchema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    subcategory: formData.get("subcategory") ?? "",
    description: formData.get("description") ?? "",
    amount: formData.get("amount"),
    account: formData.get("account") ?? "Main",
    recurring: formData.get("recurring") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  try {
    await connectDB();
    const category = await Category.findOne({
      _id: data.categoryId,
      userId: user.id as never,
    }).lean();
    if (!category) return { error: "That category wasn't found. Please choose another." };

    const result = await Transaction.updateOne(
      { _id: id, userId: user.id as never },
      {
        $set: {
          type: data.type,
          categoryId: category._id,
          categoryName: category.name,
          subcategory: data.subcategory,
          description: data.description,
          amount: round2(data.amount),
          date: new Date(data.date),
          account: data.account,
          recurring: data.recurring,
        },
      }
    );
    if (result.matchedCount === 0) return { error: "Transaction not found." };
  } catch {
    return { error: "We couldn't update that transaction. Please try again." };
  }

  revalidateAll();
  return { success: "Transaction updated" };
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await connectDB();
  await Transaction.deleteOne({ _id: id, userId: user.id as never });
  revalidateAll();
}
