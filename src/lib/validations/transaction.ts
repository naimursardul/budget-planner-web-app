import { z } from "zod";
import { TRANSACTION_TYPES } from "@/types";

const isoDate = z
  .string()
  .min(1, "Date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const transactionSchema = z.object({
  date: isoDate,
  type: z.enum(TRANSACTION_TYPES),
  categoryId: z.string().min(1, "Choose a category"),
  subcategory: z.string().trim().max(50, "Sub-category is too long").optional().default(""),
  description: z.string().trim().max(200, "Description is too long").optional().default(""),
  amount: z
    .coerce.number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero")
    .max(1_000_000_000, "Amount is too large"),
  account: z.string().trim().min(1).max(50).default("Main"),
  recurring: z.boolean().default(false),
});

export const transactionFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(["all", ...TRANSACTION_TYPES]).default("all"),
  category: z.string().default("all"),
  account: z.string().default("all"),
  from: isoDate.optional(),
  to: isoDate.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).default("date_desc"),
  page: z.coerce.number().int().min(1).default(1),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
