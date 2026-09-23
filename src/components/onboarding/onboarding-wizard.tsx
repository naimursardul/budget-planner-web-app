"use client";

import { useActionState, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  ListChecks,
  Rocket,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboardingAction, type OnboardingState } from "@/actions/onboarding";
import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Welcome", icon: Sparkles },
  { title: "Currency", icon: Coins },
  { title: "Income", icon: Wallet },
  { title: "Categories", icon: ListChecks },
  { title: "Savings goal", icon: Target },
  { title: "Ready", icon: Rocket },
];

const CATEGORY_PREVIEW: [string, string[]][] = [
  ["Income", ["Salary", "Freelance", "Business", "Dividends"]],
  ["Expenses", ["Groceries", "Housing", "Transportation", "Dining Out", "…and 15 more"]],
  ["Bills", ["Electricity", "Water", "Internet", "Phone", "…and 7 more"]],
  ["Savings", ["Emergency Fund", "Vacation", "Retirement", "Car"]],
  ["Debt", ["Credit Card", "Student Loan", "Mortgage", "…and 4 more"]],
];

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    {}
  );

  const [step, setStep] = useState(0);
  const [sampleData, setSampleData] = useState<boolean | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [income, setIncome] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");

  const incomeValue = Number.parseFloat(income);
  const canAdvance =
    step === 0
      ? sampleData !== null
      : step === 1
        ? Boolean(currency)
        : step === 2
          ? income.trim() !== "" && Number.isFinite(incomeValue) && incomeValue >= 0
          : true;

  const lastStep = STEPS.length - 1;

  return (
    <div className="w-full max-w-xl">
      {/* Brand */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
          SB
        </div>
        <p className="text-sm text-muted-foreground">Smart Budget Planner</p>
      </div>

      {/* Step indicator */}
      <ol className="mb-4 flex items-center justify-center gap-1.5" aria-label="Onboarding progress">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/15 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground"
              )}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            {i < lastStep && <span className="h-px w-3 bg-border sm:w-6" aria-hidden />}
          </li>
        ))}
      </ol>

      <Card className="border-border/60 shadow-lg shadow-primary/5">
        <CardContent className="p-6 sm:p-8">
          <form action={formAction} className="space-y-6">
            {/* Values carried regardless of visible step */}
            <input type="hidden" name="currency" value={currency} />
            <input type="hidden" name="dateFormat" value={dateFormat} />
            <input type="hidden" name="monthlyIncome" value={income || "0"} />
            <input type="hidden" name="monthlySavingsGoal" value={savingsGoal || "0"} />
            <input type="hidden" name="sampleData" value={sampleData ? "true" : "false"} />

            {step === 0 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome, {firstName}!
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Let&apos;s set up your budgeting workspace in about a minute.
                    How would you like to start?
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSampleData(true)}
                    aria-pressed={sampleData === true}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors hover:bg-accent/50",
                      sampleData === true && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <Sparkles className="mb-2 size-5 text-primary" aria-hidden />
                    <span className="block text-sm font-semibold">Start with sample data</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Explore the app with a realistic example month — transactions, bills,
                      goals, and a budget you can edit or delete anytime.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSampleData(false)}
                    aria-pressed={sampleData === false}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors hover:bg-accent/50",
                      sampleData === false && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <Wallet className="mb-2 size-5 text-primary" aria-hidden />
                    <span className="block text-sm font-semibold">Start fresh</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      A clean workspace with just your default categories. Add your own
                      transactions as you go.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Currency & dates</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Used for every amount and date across the app. You can change this
                    later in Settings.
                  </p>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Currency</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code)}
                        aria-pressed={currency === c.code}
                        className={cn(
                          "rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-colors hover:bg-accent/50",
                          currency === c.code && "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                      >
                        {c.code}
                        <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                          {c.label.replace(/\s*\(.*\)$/, "")}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Date format</legend>
                  <div className="flex gap-2">
                    {(["MM/DD/YYYY", "DD/MM/YYYY"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setDateFormat(f)}
                        aria-pressed={dateFormat === f}
                        className={cn(
                          "rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
                          dateFormat === f && "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                      >
                        {f === "MM/DD/YYYY" ? "09/15/2026 (MM/DD)" : "15/09/2026 (DD/MM)"}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Your monthly income</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    A typical month, after tax. This anchors your budget and savings
                    recommendations.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="income">Monthly income</Label>
                  <Input
                    id="income"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 4200"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter 0 if you&apos;d rather add income as transactions later.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Your categories</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    We&apos;ve prepared a set of default categories to get you started —
                    rename, reorder, or add your own anytime in Settings.
                  </p>
                </div>
                <div className="space-y-3">
                  {CATEGORY_PREVIEW.map(([group, names]) => (
                    <div key={group} className="rounded-lg border p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group}
                      </p>
                      <p className="mt-1 text-sm">{names.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Set a savings goal</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    How much would you like to put aside each month? Your dashboard will
                    track your progress against it.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="savingsGoal">Monthly savings target</Label>
                  <Input
                    id="savingsGoal"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 500"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(e.target.value)}
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    A common starting point is 20% of income. Skip this if you&apos;re not
                    sure yet.
                  </p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="size-7" aria-hidden />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">You&apos;re all set!</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {sampleData
                      ? "We'll load a realistic example month so you can explore right away."
                      : "Your workspace is ready. Add your first transaction from the dashboard."}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-2 rounded-lg border p-4 text-sm">
                  <dt className="text-muted-foreground">Currency</dt>
                  <dd className="text-right font-medium">{currency}</dd>
                  <dt className="text-muted-foreground">Monthly income</dt>
                  <dd className="text-right font-medium">{income || "0"}</dd>
                  <dt className="text-muted-foreground">Savings target</dt>
                  <dd className="text-right font-medium">{savingsGoal || "0"}</dd>
                  <dt className="text-muted-foreground">Sample data</dt>
                  <dd className="text-right font-medium">{sampleData ? "Yes" : "No"}</dd>
                </dl>
              </div>
            )}

            {state.error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || isPending}
              >
                <ArrowLeft aria-hidden /> Back
              </Button>
              {step < lastStep ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
                  Continue <ArrowRight aria-hidden />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Setting things up…" : "Go to Dashboard"}{" "}
                  <Rocket aria-hidden />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Step {step + 1} of {STEPS.length} — {STEPS[step].title}
      </p>
    </div>
  );
}
