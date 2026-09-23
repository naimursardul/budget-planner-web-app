import { z } from "zod";

export const debtSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  type: z.string().trim().min(1, "Type is required").max(50),
  originalBalance: z
    .coerce.number({ invalid_type_error: "Enter the original balance" })
    .positive("Balance must be greater than zero")
    .max(1_000_000_000),
  currentBalance: z
    .coerce.number({ invalid_type_error: "Enter the current balance" })
    .min(0)
    .max(1_000_000_000),
  interestRate: z.coerce.number().min(0).max(100).default(0),
  minimumPayment: z.coerce.number().min(0).max(1_000_000_000).default(0),
  dueDate: z.coerce.number().int().min(1).max(31).default(1),
});

export type DebtInput = z.infer<typeof debtSchema>;
