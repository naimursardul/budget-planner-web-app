import { z } from "zod";

export const budgetItemSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().min(0, "Budget cannot be negative").max(1_000_000_000),
});

export const saveBudgetSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  items: z.array(budgetItemSchema).max(100),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
  type: z.enum(["income", "expense", "savings", "bill", "debt"]),
  priority: z.enum(["essential", "high", "moderate", "low", "avoidable"]).default("moderate"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color")
    .default("#C9BCE8"),
});

export const renameCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(50, "Name is too long"),
});

export const categoryPrioritySchema = z.object({
  id: z.string().min(1),
  priority: z.enum(["essential", "high", "moderate", "low", "avoidable"]),
});

export const reorderCategorySchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export type SaveBudgetInput = z.infer<typeof saveBudgetSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
