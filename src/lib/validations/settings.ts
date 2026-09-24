import { z } from "zod";
import { CURRENCIES } from "@/lib/currencies";
import { DATE_FORMATS, THEMES } from "@/types";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  currency: z.enum(currencyCodes),
  dateFormat: z.enum(DATE_FORMATS),
  theme: z.enum(THEMES),
  monthlyIncome: z.coerce.number().min(0).max(1_000_000_000).default(0),
  monthlySavingsGoal: z.coerce.number().min(0).max(1_000_000_000).default(0),
});

export const notificationPrefsSchema = z.object({
  billReminders: z.boolean(),
  budgetAlerts: z.boolean(),
  savingsMilestones: z.boolean(),
  monthlySummary: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;

/**
 * Typed by the user before any data is deleted — no one-click data loss.
 * Lives here rather than in the action because a `"use server"` module may
 * only export async functions, and both sides need the same string.
 */
export const CLEAR_DATA_PHRASE = "DELETE";
