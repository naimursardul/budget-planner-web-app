import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BuyButton } from "@/components/commerce/buy-button";
import { getPlanPrices } from "@/lib/lemonsqueezy";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Shown when a user's prepaid access window has ended. Their data is fully
 * preserved — this screen only blocks the workspace until access is restored.
 */
export function AccessExpiredScreen({ name }: { name: string }) {
  const prices = getPlanPrices();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
          SB
        </div>
        <Badge variant="warning" className="mb-4">
          <Lock aria-hidden /> Access expired
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {name.split(" ")[0]} — your planner is waiting
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Your prepaid access period has ended, so the workspace is paused.{" "}
          <strong>Nothing has been deleted</strong> — every transaction, budget, bill, and
          goal is exactly where you left it, and all of it unlocks the moment you return.
        </p>

        <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <p className="font-semibold">1 Year</p>
            <p className="mt-1 text-3xl font-bold">${prices.oneYear}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ${(prices.oneYear / 12).toFixed(2)}/month · prepaid, no renewal
            </p>
            <BuyButton plan="one_year" label="Restore for 1 year" className="mt-4 w-full" />
          </div>
          <div className="rounded-xl border border-primary bg-card p-5 ring-1 ring-primary">
            <p className="font-semibold">
              2 Years <span className="text-xs font-medium text-primary">Best value</span>
            </p>
            <p className="mt-1 text-3xl font-bold">${prices.twoYear}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ${(prices.twoYear / 24).toFixed(2)}/month · save $
              {(prices.oneYear * 2 - prices.twoYear).toFixed(0)}
            </p>
            <BuyButton plan="two_year" label="Restore for 2 years" className="mt-4 w-full" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link href="/settings/billing" className={cn(buttonVariants({ variant: "outline" }))}>
            View billing & history
          </Link>
          <Link href="/pricing" className={cn(buttonVariants({ variant: "ghost" }))}>
            Compare plans
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
