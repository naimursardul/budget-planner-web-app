"use server";

import { redirect } from "next/navigation";
import { User } from "@/models";
import { requireUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { ensureDefaultCategories } from "@/services/categories";
import { seedSampleData } from "@/services/seed";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser();

  const parsed = onboardingSchema.safeParse({
    currency: formData.get("currency"),
    dateFormat: formData.get("dateFormat"),
    monthlyIncome: formData.get("monthlyIncome"),
    monthlySavingsGoal: formData.get("monthlySavingsGoal"),
    sampleData: formData.get("sampleData") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Please check your answers — some values are missing or invalid." };
  }

  const { currency, dateFormat, monthlyIncome, monthlySavingsGoal, sampleData } = parsed.data;

  await connectDB();

  // Default categories are the workspace skeleton — make sure they exist
  // (idempotent) before optionally seeding activity on top of them.
  await ensureDefaultCategories(user.id);

  if (sampleData) {
    await seedSampleData(user.id).catch((error) => {
      // Sample data is a convenience — never block onboarding on it. Log it
      // though, or the user just lands on an empty dashboard with no clue why.
      console.error("seedSampleData failed during onboarding:", error);
    });
  }

  await User.updateOne(
    { _id: user.id as never },
    {
      $set: {
        currency,
        dateFormat,
        monthlyIncome,
        monthlySavingsGoal,
        onboardingCompleted: true,
      },
    }
  );

  redirect("/dashboard");
}
