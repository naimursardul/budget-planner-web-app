import Link from "next/link";
import { CreditCard } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models";
import { SettingsView } from "@/components/settings/settings-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Settings" };

const PLAN_LABELS: Record<string, string> = {
  free: "Free trial",
  one_year: "1 Year",
  two_year: "2 Years",
};

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  await connectDB();

  const categories = await Category.find({ userId: user.id as never })
    .sort({ type: 1, order: 1, name: 1 })
    .lean();

  const { hasAccess, isTrial, currentPlan, activeUntil } = user.access;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, categories, and preferences.
        </p>
      </div>

      {/* Billing shortcut */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <CreditCard className="size-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {PLAN_LABELS[currentPlan] ?? currentPlan} plan
              <Badge
                variant={hasAccess ? (isTrial ? "warning" : "success") : "danger"}
                className="ml-2"
              >
                {hasAccess ? (isTrial ? "Free trial" : "Active") : "Expired"}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              {hasAccess
                ? `Access until ${formatDate(activeUntil.toISOString(), user.dateFormat)} — prepaid, never auto-renewed.`
                : "Access expired — your data is preserved."}
            </p>
          </div>
          <Link
            href="/settings/billing"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Billing & history
          </Link>
        </CardContent>
      </Card>

      <SettingsView
        user={{
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: user.dateFormat,
          monthlyIncome: user.monthlyIncome,
          monthlySavingsGoal: user.monthlySavingsGoal,
          notificationPrefs: {
            billReminders: user.notificationPrefs.billReminders,
            budgetAlerts: user.notificationPrefs.budgetAlerts,
            savingsMilestones: user.notificationPrefs.savingsMilestones,
            monthlySummary: user.notificationPrefs.monthlySummary,
          },
        }}
        categories={categories.map((c) => ({
          id: String(c._id),
          name: c.name,
          type: c.type,
          priority: c.priority,
          color: c.color,
          order: c.order,
          isDefault: c.isDefault,
        }))}
      />
    </div>
  );
}
