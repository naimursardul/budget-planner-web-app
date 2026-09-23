"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireUser } from "@/lib/session";
import { settingsSchema, notificationPrefsSchema } from "@/lib/validations/settings";
import { changePasswordSchema } from "@/lib/validations/auth";
import { round2 } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

/** Update profile / preferences. Theme is also applied client-side via next-themes. */
export async function updateSettingsAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    dateFormat: formData.get("dateFormat"),
    theme: formData.get("theme"),
    monthlyIncome: formData.get("monthlyIncome") ?? 0,
    monthlySavingsGoal: formData.get("monthlySavingsGoal") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    await User.updateOne(
      { _id: user.id as never },
      {
        $set: {
          name: parsed.data.name,
          currency: parsed.data.currency,
          dateFormat: parsed.data.dateFormat,
          theme: parsed.data.theme,
          monthlyIncome: round2(parsed.data.monthlyIncome),
          monthlySavingsGoal: round2(parsed.data.monthlySavingsGoal),
        },
      }
    );
  } catch {
    return { error: "We couldn't save your settings. Please try again." };
  }

  for (const path of ["/settings", "/dashboard", "/reports", "/budget", "/transactions"]) {
    revalidatePath(path);
  }
  return { success: "Settings saved" };
}

export async function updateNotificationPrefsAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = notificationPrefsSchema.safeParse({
    billReminders: formData.get("billReminders") === "on",
    budgetAlerts: formData.get("budgetAlerts") === "on",
    savingsMilestones: formData.get("savingsMilestones") === "on",
    monthlySummary: formData.get("monthlySummary") === "on",
  });
  if (!parsed.success) return { error: "Invalid notification settings." };

  try {
    await connectDB();
    await User.updateOne(
      { _id: user.id as never },
      { $set: { notificationPrefs: parsed.data } }
    );
  } catch {
    return { error: "We couldn't save your notification settings. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Notification settings saved" };
}

export async function changePasswordAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const sessionUser = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const user = await User.findById(sessionUser.id).select("+passwordHash");
    if (!user) return { error: "Account not found." };

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { error: "Your current password is incorrect." };

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();
  } catch {
    return { error: "We couldn't change your password. Please try again." };
  }

  return { success: "Password changed" };
}
