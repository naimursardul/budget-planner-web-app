import { z } from "zod";

const isoDate = z
  .string()
  .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const savingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  targetAmount: z
    .coerce.number({ invalid_type_error: "Enter a target amount" })
    .positive("Target must be greater than zero")
    .max(1_000_000_000),
  currentAmount: z.coerce.number().min(0).max(1_000_000_000).default(0),
  deadline: isoDate.optional().default(""),
  monthlyContribution: z.coerce.number().min(0).max(1_000_000_000).default(0),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#B8DDB0"),
});

export const contributionSchema = z.object({
  goalId: z.string().min(1),
  amount: z
    .coerce.number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than zero"),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
