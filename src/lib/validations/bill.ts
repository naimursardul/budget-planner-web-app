import { z } from "zod";
import { BILL_FREQUENCIES } from "@/types";

const isoDate = z
  .string()
  .min(1, "Due date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const billSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  categoryId: z.string().min(1, "Choose a category"),
  amount: z
    .coerce.number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero")
    .max(1_000_000_000, "Amount is too large"),
  dueDate: isoDate,
  frequency: z.enum(BILL_FREQUENCIES).default("monthly"),
  autoPay: z.boolean().default(false),
  reminderDays: z.coerce.number().int().min(0).max(14).default(2),
});

export type BillInput = z.infer<typeof billSchema>;
