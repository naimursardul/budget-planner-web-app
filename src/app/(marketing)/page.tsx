import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  BarChart3,
  Bell,
  Check,
  CreditCard,
  FileBarChart,
  Layers,
  LineChart,
  Lock,
  PiggyBank,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BuyButton } from "@/components/commerce/buy-button";
import { getPlanPrices } from "@/lib/lemonsqueezy";
import { TRIAL_DAYS } from "@/services/access";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Wallet,
    title: "Transactions",
    text: "Log income, expenses, savings, and debt payments in seconds. Filter, search, and sort your full history.",
  },
  {
    icon: Layers,
    title: "Smart budgets",
    text: "Set limits per category each month and watch under / near / over status update with every transaction.",
  },
  {
    icon: CreditCard,
    title: "Bills & reminders",
    text: "Track recurring bills, mark them paid, and see them appear automatically on your calendar.",
  },
  {
    icon: Target,
    title: "Savings goals",
    text: "Emergency fund, vacation, a new car — set targets, contribute monthly, and see projected completion.",
  },
  {
    icon: PiggyBank,
    title: "Debt tracking",
    text: "Record balances and payments, and watch your total debt trend downward month over month.",
  },
  {
    icon: BarChart3,
    title: "Reports & export",
    text: "Cash-flow, category, and budget reports for any period — export everything to CSV anytime.",
  },
];

const PROBLEMS = [
  "Money disappears and you can't say where it went",
  "Spreadsheets start strong, then get abandoned by March",
  "Bills surprise you; savings goals stay 'someday'",
];

const SOLUTIONS = [
  "Every transaction lands in one place, so your spending is always visible",
  "A guided monthly rhythm — budget, track, review — that takes minutes, not hours",
  "Bills, goals, and debt live beside your budget, not in five separate apps",
];

const STEPS = [
  {
    title: "Create your workspace",
    text: `Sign up free — ${TRIAL_DAYS} days of full access, no card required. Pick your currency and you're ready in under a minute.`,
  },
  {
    title: "Add your money",
    text: "Log income and expenses as they happen, or start with realistic sample data to explore first.",
  },
  {
    title: "Plan your month",
    text: "Set category budgets and a savings target. Priorities show what's essential vs. avoidable at a glance.",
  },
  {
    title: "Watch it work",
    text: "Dashboards update with every entry. Reports turn your data into decisions — and your plan into your future.",
  },
];

const FAQ = [
  {
    q: "Is this a subscription?",
    a: "No. Access is prepaid — buy one year or two, and it never auto-renews. Renew before expiry and the new period stacks onto your existing end date, so you never lose paid days.",
  },
  {
    q: "What happens when my access ends?",
    a: "Your workspace pauses, but nothing is deleted. Every transaction, budget, bill, and goal is preserved and unlocks the moment you return.",
  },
  {
    q: "Can I try it before paying?",
    a: `Yes — every new account gets ${TRIAL_DAYS} days of full access with no card required. You can also start with sample data to see every feature in action.`,
  },
  {
    q: "Can I export my data?",
    a: "Always. Transactions and reports export to CSV from the Reports page. Your data is yours.",
  },
  {
    q: "Which currencies are supported?",
    a: "US Dollar, Euro, British Pound, Canadian and Australian Dollar, Bangladeshi Taka, Indian Rupee, and Japanese Yen — switchable anytime in Settings.",
  },
];

function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xl shadow-primary/10 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-blush" />
        <span className="size-2.5 rounded-full bg-peach" />
        <span className="size-2.5 rounded-full bg-sage" />
        <span className="ml-3 text-xs text-muted-foreground">
          smartbudgetplanner.app/dashboard
        </span>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Income", value: "$4,850", icon: ArrowDownCircle, tone: "text-success" },
            { label: "Expenses", value: "$2,912", icon: ArrowUpCircle, tone: "text-danger" },
            { label: "Savings", value: "$450", icon: PiggyBank, tone: "text-primary" },
            { label: "Remaining", value: "$1,938", icon: Wallet, tone: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-background p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <s.icon className="size-3.5" aria-hidden /> {s.label}
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="rounded-xl border bg-background p-3 sm:col-span-3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Income vs Expenses</p>
            <div className="flex h-28 items-end justify-between gap-2 sm:h-36">
              {[
                [30, 22],
                [34, 25],
                [32, 28],
                [38, 24],
                [40, 27],
                [44, 21],
              ].map(([inc, exp], i) => (
                <div key={i} className="flex h-full flex-1 items-end justify-center gap-1">
                  <div
                    className="w-2.5 rounded-t bg-[var(--viz-3)] sm:w-3"
                    style={{ height: `${inc}%` }}
                  />
                  <div
                    className="w-2.5 rounded-t bg-[var(--viz-2)] sm:w-3"
                    style={{ height: `${exp}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3 sm:col-span-2">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Top categories</p>
            <div className="space-y-2.5">
              {[
                ["Housing", "bg-[var(--viz-1)]", "w-full"],
                ["Groceries", "bg-[var(--viz-3)]", "w-2/3"],
                ["Dining Out", "bg-[var(--viz-2)]", "w-1/3"],
                ["Transport", "bg-[var(--viz-4)]", "w-1/4"],
              ].map(([label, color, width]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{label}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className={cn("h-2 rounded-full", color)} style={{ width: width as string }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const prices = getPlanPrices();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background"
          aria-hidden
        />
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 lg:pt-24">
          <Badge variant="secondary" className="mb-5">
            <Sparkles aria-hidden /> Free {TRIAL_DAYS}-day trial · no card required
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Money. Your Plan. Your Future.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A smarter way to organize your income, expenses, savings, bills, and financial
            goals — all in one beautiful budgeting workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Start Budgeting <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Explore Features
            </Link>
          </div>

          <div className="mt-14">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border/60 bg-accent/30 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Sound familiar?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PROBLEMS.map((p) => (
              <Card key={p} className="border-dashed">
                <CardContent className="p-5 text-sm text-muted-foreground">{p}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">
                <LineChart aria-hidden /> The solution
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                One workspace for your whole financial life
              </h2>
              <p className="mt-3 text-muted-foreground">
                Smart Budget Planner replaces the spreadsheet-and-sticky-notes routine with
                a system that keeps itself up to date — so understanding your money takes
                minutes, not weekends.
              </p>
            </div>
            <ul className="space-y-4">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ten connected sections that all work from the same data — enter it once,
              see it everywhere.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-accent/30 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Up and running in minutes
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Bell,
                title: "Stay ahead",
                text: "Smart, deduplicated alerts for due bills, budgets near their limit, and savings milestones.",
              },
              {
                icon: FileBarChart,
                title: "See clearly",
                text: "Priorities roll your spending into Essential → Avoidable tiers, so cutting back is a decision, not a guess.",
              },
              {
                icon: Lock,
                title: "Own your data",
                text: "Your numbers live in your account, exportable to CSV whenever you want them — never held hostage.",
              },
            ].map((b) => (
              <Card key={b.title}>
                <CardContent className="p-6">
                  <b.icon className="mb-3 size-6 text-primary" aria-hidden />
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border/60 bg-accent/30 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Simple, prepaid pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Try everything free for {TRIAL_DAYS} days. Then pay once — never again
              unless you choose to.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold">1 Year</h3>
                <p className="mt-2 text-4xl font-bold">
                  ${prices.oneYear}
                  <span className="text-base font-normal text-muted-foreground"> / year</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ${(prices.oneYear / 12).toFixed(2)}/month · full access
                </p>
                <BuyButton
                  plan="one_year"
                  label={`Buy 1 year — $${prices.oneYear}`}
                  className="mt-5 w-full"
                />
              </CardContent>
            </Card>
            <Card className="relative border-primary ring-1 ring-primary">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Best value</Badge>
              <CardContent className="p-6">
                <h3 className="font-semibold">2 Years</h3>
                <p className="mt-2 text-4xl font-bold">
                  ${prices.twoYear}
                  <span className="text-base font-normal text-muted-foreground"> / 2 years</span>
                </p>
                <p className="mt-1 text-xs text-success">
                  Save ${(prices.oneYear * 2 - prices.twoYear).toFixed(0)} — $
                  {(prices.twoYear / 24).toFixed(2)}/month
                </p>
                <BuyButton
                  plan="two_year"
                  label={`Buy 2 years — $${prices.twoYear}`}
                  className="mt-5 w-full"
                />
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              See full pricing details <ArrowRight className="inline size-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Questions, answered
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium">
                  {item.q}
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            More questions?{" "}
            <Link href="/faq" className="font-medium text-primary hover:underline">
              Read the full FAQ
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
        <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your future self says thanks
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start your free {TRIAL_DAYS}-day trial today. No card, no commitment — just a
            clearer picture of your money.
          </p>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full sm:w-auto")}
          >
            Start Budgeting <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
