import Link from "next/link";
import { ArrowLeft, CalendarClock, CreditCard, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BuyButton } from "@/components/commerce/buy-button";
import { requireOnboardedUser } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Purchase } from "@/models/Purchase";
import { getPlanPrices } from "@/lib/lemonsqueezy";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Billing" };

const PLAN_LABELS: Record<string, string> = {
  free: "Free trial",
  one_year: "1 Year",
  two_year: "2 Years",
};

export default async function BillingPage() {
  const user = await requireOnboardedUser();

  await connectDB();
  const purchases = await Purchase.find({ userId: user.id as never })
    .sort({ purchasedAt: -1 })
    .lean();

  const { hasAccess, status, currentPlan, activeUntil, isTrial } = user.access;
  const prices = getPlanPrices();
  const daysLeft = Math.max(
    0,
    Math.ceil((activeUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link
            href={hasAccess ? "/settings" : "/"}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {hasAccess ? "Back to settings" : "Back to home"}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Billing & access</h1>
          <Link href="/pricing" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Compare plans
          </Link>
        </div>

        {/* Current status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-muted-foreground" aria-hidden />
              Current access
            </CardTitle>
            <CardDescription>Prepaid access — never auto-renewed.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Plan</dt>
                <dd className="mt-0.5 text-lg font-semibold">
                  {PLAN_LABELS[currentPlan] ?? currentPlan}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <Badge variant={hasAccess ? (isTrial ? "warning" : "success") : "danger"}>
                    {hasAccess
                      ? isTrial
                        ? "Free trial"
                        : status === "active"
                          ? "Active"
                          : "Trialing"
                      : "Expired"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {hasAccess ? "Active until" : "Ended"}
                </dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold">
                  <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
                  {formatDate(activeUntil.toISOString(), user.dateFormat)}
                  {hasAccess && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            {(!hasAccess || daysLeft <= 30) && (
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-accent/40 p-4">
                <p className="flex-1 text-sm text-muted-foreground">
                  {hasAccess
                    ? "Your access window is ending soon. Renew now and the new period extends from your current expiry — you never lose paid days."
                    : "Restore access to reopen your workspace. Everything you entered is still safely stored."}
                </p>
                <BuyButton plan="one_year" label={`1 year — $${prices.oneYear}`} size="sm" />
                <BuyButton
                  plan="two_year"
                  label={`2 years — $${prices.twoYear}`}
                  size="sm"
                  variant="soft"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-muted-foreground" aria-hidden />
              Purchase history
            </CardTitle>
            <CardDescription>
              Records are created by verified payment webhooks only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No purchases yet — you&apos;re on the free trial.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Date</th>
                      <th className="pb-2 pr-4 font-medium">Plan</th>
                      <th className="pb-2 pr-4 font-medium">Amount</th>
                      <th className="pb-2 pr-4 font-medium">Access until</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={String(p._id)} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-4">
                          {formatDate(p.purchasedAt.toISOString(), user.dateFormat)}
                        </td>
                        <td className="py-2.5 pr-4">{PLAN_LABELS[p.plan] ?? p.plan}</td>
                        <td className="py-2.5 pr-4 tabular-nums">
                          {p.currency} {p.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-4">
                          {formatDate(p.expiresAt.toISOString(), user.dateFormat)}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              p.status === "active"
                                ? "success"
                                : p.status === "refunded"
                                  ? "danger"
                                  : "secondary"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
