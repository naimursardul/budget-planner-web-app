import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CreditCard,
  Download,
  Layers,
  ListOrdered,
  PiggyBank,
  Target,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Features" };

const SECTIONS = [
  {
    icon: Wallet,
    name: "Dashboard",
    text: "Your whole month at a glance — income, expenses, savings, and remaining balance with month-over-month trends, plus quick actions for recording money as it moves.",
    points: [
      "4 live stat cards with trend arrows",
      "Income vs. expenses over 6 months",
      "Spending breakdown donut",
      "Budget progress and savings tracking",
    ],
  },
  {
    icon: Wallet,
    name: "Transactions",
    text: "Every dollar, recorded once and reused everywhere. Income, expenses, savings transfers, bill payments, and debt payments all live in one searchable history.",
    points: [
      "Filter by date range, type, category, and account",
      "Full-text search and pagination",
      "Recurring transaction flag",
      "Edit and delete with instant dashboard updates",
    ],
  },
  {
    icon: Layers,
    name: "Budgets",
    text: "Set a limit for every category, each month. Progress bars turn amber at 80% and red over budget — and you can copy last month's budget in one click.",
    points: [
      "Per-category monthly limits",
      "Under / near / over status at a glance",
      "One-click copy from the previous month",
      "Unbudgeted-category detection",
    ],
  },
  {
    icon: CreditCard,
    name: "Bills",
    text: "Never get surprised again. Track recurring bills with frequencies and reminders, and mark them paid — which records the transaction and advances the schedule automatically.",
    points: [
      "Overdue, upcoming, and paid sections",
      "Weekly / monthly / quarterly / yearly frequencies",
      "Auto-pay flag and reminder days",
      "Paid bills create matching transactions",
    ],
  },
  {
    icon: Calendar,
    name: "Calendar",
    text: "A month grid that combines bill due dates and your own events — paydays, planned purchases, anything. Color-coded by type, completable with a click.",
    points: [
      "Bills appear automatically from schedules",
      "Custom events with color, type, and notes",
      "Mark items complete as you handle them",
      "Per-day quick-add",
    ],
  },
  {
    icon: Target,
    name: "Savings goals",
    text: "Name what you're saving for, set a target and a monthly contribution, and watch progress fill up — with a projected completion date based on your pace.",
    points: [
      "Multiple named goals with colors",
      "Contribution history per goal",
      "Deadline-aware pacing",
      "Contributions record as savings transactions",
    ],
  },
  {
    icon: PiggyBank,
    name: "Debt tracking",
    text: "Record balances, interest rates, and minimum payments. Every payment lowers the balance and feeds the debt-reduction chart — no advice, just your real trend.",
    points: [
      "Total / paid / remaining overview",
      "Per-debt detail with progress",
      "Debt-reduction trend chart",
      "Payments record as debt transactions",
    ],
  },
  {
    icon: ListOrdered,
    name: "Priorities",
    text: "Every category carries a priority from Essential to Avoidable. The priorities view rolls your actual spending up by tier, so you always know where the flex is.",
    points: [
      "Essential → Avoidable tiering",
      "Spending rollup by priority level",
      "Works with the default or your custom categories",
    ],
  },
  {
    icon: BarChart3,
    name: "Reports",
    text: "Pick any period — this month, quarter, year, or a custom range — and see totals, category breakdowns, budget performance, and cash flow. Export to CSV anytime.",
    points: [
      "Preset and custom date ranges",
      "Category, budget, and cash-flow views",
      "CSV export of every transaction in range",
      "Computed live from your real data",
    ],
  },
  {
    icon: Download,
    name: "Settings & data",
    text: "Your workspace, your way — and your data stays yours.",
    points: [
      "8 currencies and 2 date formats",
      "Light / dark / system themes",
      "Custom categories with rename and reorder",
      "Per-type notification controls",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Every feature, built around one idea
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter your money once — every view, chart, and report works from the same data.
          No busywork, no duplication.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.name} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" aria-hidden />
              </div>
              <h2 className="font-semibold">{s.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              <ul className="mt-4 space-y-1.5">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
          Try it free <ArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
