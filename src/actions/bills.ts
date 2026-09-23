"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Bill, CalendarEvent, Category, Transaction } from "@/models";
import { requireUser } from "@/lib/session";
import { billSchema } from "@/lib/validations/bill";
import { billOccurrenceDates } from "@/lib/bill-utils";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

function revalidateBillViews() {
  for (const path of ["/bills", "/calendar", "/dashboard", "/transactions", "/reports"]) {
    revalidatePath(path);
  }
}

async function syncBillCalendarEvents(
  userId: string,
  billId: string,
  name: string,
  amount: number,
  occurrences: Date[]
) {
  await CalendarEvent.deleteMany({ userId: userId as never, sourceId: billId as never });
  if (occurrences.length === 0) return;
  await CalendarEvent.insertMany(
    occurrences.map((date) => ({
      userId,
      title: `${name} — bill`,
      date,
      color: "#F6C49C",
      type: "bill" as const,
      notes: `Bill payment (auto-created)`,
      completed: false,
      sourceId: billId,
    }))
  );
}

export async function createBillAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = billSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    frequency: formData.get("frequency"),
    autoPay: formData.get("autoPay") === "on",
    reminderDays: formData.get("reminderDays") ?? 2,
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

    const bill = await Bill.create({
      userId: user.id,
      name: data.name,
      categoryId: category._id,
      categoryName: category.name,
      amount: round2(data.amount),
      dueDate: new Date(data.dueDate),
      frequency: data.frequency,
      autoPay: data.autoPay,
      reminderDays: data.reminderDays,
      status: "upcoming",
    });

    await syncBillCalendarEvents(
      user.id,
      String(bill._id),
      data.name,
      round2(data.amount),
      billOccurrenceDates(new Date(data.dueDate), data.frequency)
    );
  } catch {
    return { error: "We couldn't save that bill. Please try again." };
  }

  revalidateBillViews();
  return { success: "Bill saved" };
}

export async function updateBillAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing bill reference." };

  const parsed = billSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    frequency: formData.get("frequency"),
    autoPay: formData.get("autoPay") === "on",
    reminderDays: formData.get("reminderDays") ?? 2,
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

    const bill = await Bill.findOne({ _id: id, userId: user.id as never });
    if (!bill) return { error: "Bill not found." };

    bill.name = data.name;
    bill.categoryId = category._id;
    bill.categoryName = category.name;
    bill.amount = round2(data.amount);
    bill.dueDate = new Date(data.dueDate);
    bill.frequency = data.frequency;
    bill.autoPay = data.autoPay;
    bill.reminderDays = data.reminderDays;
    await bill.save();

    await syncBillCalendarEvents(
      user.id,
      id,
      data.name,
      round2(data.amount),
      billOccurrenceDates(new Date(data.dueDate), data.frequency)
    );
  } catch {
    return { error: "We couldn't update that bill. Please try again." };
  }

  revalidateBillViews();
  return { success: "Bill updated" };
}

/** Mark a bill paid: records a bill transaction, updates the bill, and
 *  advances recurring bills to their next due date. */
export async function markBillPaidAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await connectDB();
  const bill = await Bill.findOne({ _id: id, userId: user.id as never });
  if (!bill) return;

  await Transaction.create({
    userId: user.id,
    type: "bill",
    categoryId: bill.categoryId,
    categoryName: bill.categoryName,
    description: `Bill payment — ${bill.name}`,
    amount: bill.amount,
    date: new Date(),
    account: "Main",
    recurring: bill.frequency !== "one_time",
  });

  if (bill.frequency === "one_time") {
    bill.status = "paid";
  } else {
    const next = new Date(bill.dueDate);
    if (bill.frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (bill.frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    bill.dueDate = next;
    bill.status = "upcoming";
  }
  bill.lastPaidAt = new Date();
  await bill.save();

  revalidateBillViews();
}

export async function deleteBillAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await connectDB();
  await Bill.deleteOne({ _id: id, userId: user.id as never });
  await CalendarEvent.deleteMany({ userId: user.id as never, sourceId: id as never });

  revalidateBillViews();
}
