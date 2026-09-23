import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              SB
            </span>
            <span className="hidden sm:inline">Smart Budget Planner</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <Link href="/features" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              Features
            </Link>
            <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              Pricing
            </Link>
            <Link href="/faq" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:block">
              FAQ
            </Link>
            {user ? (
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "ml-1")}>
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                  Sign in
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "ml-1")}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Smart Budget Planner. All rights reserved.</p>
          <nav className="flex gap-4" aria-label="Footer">
            <Link href="/features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
