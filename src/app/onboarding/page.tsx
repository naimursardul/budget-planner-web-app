import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = { title: "Welcome — Smart Budget Planner" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4 py-10">
      <OnboardingWizard firstName={user.name.split(" ")[0]} />
    </div>
  );
}
