import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BuyButton } from "@/components/commerce/buy-button";
import { getPlanPrices, isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { TRIAL_DAYS } from "@/services/access";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pricing" };

const INCLUDED = [
  "Unlimited transactions & accounts",
  "Monthly budgets with category limits",
  "Bills, calendar & reminders",
  "Savings goals & debt tracking",
  "Priority-based spending insights",
  "Reports with CSV export",
  "8 currencies & dark mode",
  "Your data, exportable anytime",
];

export default function PricingPage() {
  const prices = getPlanPrices();
  const configured = isLemonSqueezyConfigured();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles aria-hidden /> Simple, prepaid pricing — no subscriptions
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pay once. Plan for years.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every new account starts with a free {TRIAL_DAYS}-day trial — full access, no card
          required. When it ends, pick a prepaid access period. No recurring charges, no
          surprise renewals.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {/* Trial */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <h2 className="font-semibold">Free trial</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Full access while you decide.
            </p>
            <p className="mt-6 text-4xl font-bold">
              $0
              <span className="text-base font-normal text-muted-foreground">
                {" "}· {TRIAL_DAYS} days
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {INCLUDED.slice(0, 5).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full")}
            >
              Start free trial
            </Link>
          </CardContent>
        </Card>

        {/* 1 year */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <h2 className="font-semibold">1 Year</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One payment, a full year of planning.
            </p>
            <p className="mt-6 text-4xl font-bold">
              ${prices.oneYear}
              <span className="text-base font-normal text-muted-foreground"> / year</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              That&apos;s ${(prices.oneYear / 12).toFixed(2)} per month.
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <BuyButton
              plan="one_year"
              label={`Buy 1 year — $${prices.oneYear}`}
              className="mt-6 w-full"
              size="lg"
            />
          </CardContent>
        </Card>

        {/* 2 years */}
        <Card className="relative flex flex-col border-primary shadow-lg shadow-primary/10 ring-1 ring-primary">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best value</Badge>
          <CardContent className="flex flex-1 flex-col p-6">
            <h2 className="font-semibold">2 Years</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Lock in two years and save.
            </p>
            <p className="mt-6 text-4xl font-bold">
              ${prices.twoYear}
              <span className="text-base font-normal text-muted-foreground"> / 2 years</span>
            </p>
            <p className="mt-1 text-xs font-medium text-success">
              Save ${(prices.oneYear * 2 - prices.twoYear).toFixed(0)} vs two 1-year
              purchases — ${(prices.twoYear / 24).toFixed(2)} per month.
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <BuyButton
              plan="two_year"
              label={`Buy 2 years — $${prices.twoYear}`}
              className="mt-6 w-full"
              size="lg"
            />
          </CardContent>
        </Card>
      </div>

      {!configured && (
        <p className="mx-auto mt-8 max-w-xl rounded-xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
          Online checkout is being set up right now. If a purchase button
          doesn&apos;t work yet, please check back shortly — or reach out and
          we&apos;ll activate your access manually.
        </p>
      )}

      <div className="mx-auto mt-14 max-w-2xl space-y-3 text-center">
        <p className="text-sm font-medium">Good to know</p>
        <p className="text-sm text-muted-foreground">
          Purchases are <strong>prepaid access periods, not subscriptions</strong> — we never
          auto-charge your card. Renewing before your access ends extends it from the current
          expiry date, so you never lose paid days. If your access lapses, everything you&apos;ve
          entered is safely preserved and unlocks again the moment you return.
        </p>
      </div>
    </div>
  );
}
