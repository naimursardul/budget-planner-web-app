import Link from "next/link";
import { CheckCircle2, Hourglass } from "lucide-react";
import { ActivationPoller } from "@/components/commerce/activation-poller";
import { getCurrentUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Purchase received" };

export default async function CheckoutSuccessPage() {
  const user = await getCurrentUser();

  // Session lost (e.g. different browser) — the purchase still applies to the
  // account; signing back in shows the activated state.
  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Thanks for your purchase!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to the account you purchased with and your access will be active.
          </p>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full sm:w-auto")}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const active = user.access.hasAccess;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          {active ? (
            <CheckCircle2 className="size-8" aria-hidden />
          ) : (
            <Hourglass className="size-8" aria-hidden />
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {active ? "You're all set!" : "Thanks for your purchase!"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {active
            ? "Your prepaid access is active. Every feature is unlocked — head back to your planner and keep building your future."
            : "We've received your order and are confirming it with our payment provider. Activation happens automatically — usually within a few seconds."}
        </p>

        <div className="flex justify-center">
          <ActivationPoller initiallyActive={active} />
        </div>

        <Link
          href="/settings/billing"
          className={cn(buttonVariants({ variant: "ghost" }), "mt-4")}
        >
          View billing details
        </Link>
      </div>
    </div>
  );
}
