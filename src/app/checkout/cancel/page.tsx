import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="size-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Checkout cancelled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No charge was made. Your planner — and every transaction, budget, and goal in it —
          is exactly as you left it. You can come back to pricing whenever you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/pricing" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            Back to pricing
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
