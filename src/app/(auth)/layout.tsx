import Link from "next/link";
import { PiggyBank } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-cream to-lavender/25 px-4 py-10 dark:from-background dark:to-background">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-semibold text-ink dark:text-foreground"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-lavender/60">
          <PiggyBank className="size-5" aria-hidden />
        </span>
        Smart Budget Planner
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
