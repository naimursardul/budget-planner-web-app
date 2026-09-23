"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, Transaction } from "@/models";
import { requireUser } from "@/lib/session";
import {
  categorySchema,
  renameCategorySchema,
  categoryPrioritySchema,
  reorderCategorySchema,
} from "@/lib/validations/budget";

export interface ActionState {
  error?: string;
  success?: string;
}

const CATEGORY_VIEWS = ["/priorities", "/settings", "/budget", "/transactions", "/dashboard"];

function revalidateCategoryViews() {
  for (const path of CATEGORY_VIEWS) revalidatePath(path);
}

export async function createCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    priority: formData.get("priority") ?? "moderate",
    color: formData.get("color") ?? "#C9BCE8",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const exists = await Category.findOne({
      userId: user.id as never,
      name: { $regex: `^${parsed.data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      type: parsed.data.type,
    });
    if (exists) return { error: "You already have a category with that name." };

    const count = await Category.countDocuments({ userId: user.id as never, type: parsed.data.type });
    await Category.create({ ...parsed.data, userId: user.id, order: count, isDefault: false });
  } catch {
    return { error: "We couldn't create that category. Please try again." };
  }

  revalidateCategoryViews();
  return { success: "Category created" };
}

export async function renameCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = renameCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const category = await Category.findOne({ _id: parsed.data.id, userId: user.id as never });
    if (!category) return { error: "Category not found." };

    const oldName = category.name;
    category.name = parsed.data.name;
    await category.save();

    // Keep historical transactions consistent
    await Transaction.updateMany(
      { userId: user.id as never, categoryId: category._id },
      { $set: { categoryName: parsed.data.name } }
    );
    void oldName;
  } catch {
    return { error: "We couldn't rename that category. Please try again." };
  }

  revalidateCategoryViews();
  return { success: "Category renamed" };
}

export async function updateCategoryPriorityAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categoryPrioritySchema.safeParse({
    id: formData.get("id"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const result = await Category.updateOne(
      { _id: parsed.data.id, userId: user.id as never },
      { $set: { priority: parsed.data.priority } }
    );
    if (result.matchedCount === 0) return { error: "Category not found." };
  } catch {
    return { error: "We couldn't update that priority. Please try again." };
  }

  revalidateCategoryViews();
  return { success: "Priority updated" };
}

export async function reorderCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = reorderCategorySchema.safeParse({
    id: formData.get("id"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const category = await Category.findOne({ _id: parsed.data.id, userId: user.id as never });
    if (!category) return { error: "Category not found." };

    const delta = parsed.data.direction === "up" ? -1.5 : 1.5;
    const neighbor = await Category.findOne({
      userId: user.id as never,
      type: category.type,
      order: parsed.data.direction === "up" ? { $lt: category.order } : { $gt: category.order },
    }).sort({ order: parsed.data.direction === "up" ? -1 : 1 });

    if (neighbor) {
      const temp = category.order;
      category.order = neighbor.order;
      neighbor.order = temp;
      await Promise.all([category.save(), neighbor.save()]);
    }
    void delta;
  } catch {
    return { error: "We couldn't reorder that category. Please try again." };
  }

  revalidateCategoryViews();
  return { success: "Order updated" };
}

export async function deleteCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing category reference." };

  try {
    await connectDB();
    const category = await Category.findOne({ _id: id, userId: user.id as never });
    if (!category) return { error: "Category not found." };

    const inUse = await Transaction.countDocuments({
      userId: user.id as never,
      categoryId: category._id,
    });
    if (inUse > 0) {
      return {
        error: `This category has ${inUse} transaction${inUse === 1 ? "" : "s"} recorded and can't be deleted.`,
      };
    }

    await Category.deleteOne({ _id: id, userId: user.id as never });
  } catch {
    return { error: "We couldn't delete that category. Please try again." };
  }

  revalidateCategoryViews();
  return { success: "Category deleted" };
}
