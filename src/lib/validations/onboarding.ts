import { z } from "zod";
import { CURRENCIES } from "@/lib/currencies";
import { DATE_FORMATS } from "@/types";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const onboardingSchema = z.object({
  currency: z.enum(currencyCodes),
  dateFormat: z.enum(DATE_FORMATS),
  monthlyIncome: z.coerce.number().min(0).max(1_000_000_000),
  monthlySavingsGoal: z.coerce.number().min(0).max(1_000_000_000),
  sampleData: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
