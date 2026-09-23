import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/services/access";
import { cn } from "@/lib/utils";

export const metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "Is Smart Budget Planner free?",
    a: `Every new account gets ${TRIAL_DAYS} days of full access — every feature, no card required. After the trial, you can buy a prepaid access period (1 year or 2 years) to keep using the app.`,
  },
  {
    q: "Is it a subscription?",
    a: "No. Access is a one-time prepaid purchase. We never store your card and never auto-charge you. When your period ends, your workspace pauses until you choose to buy again.",
  },
  {
    q: "What happens to my data when access expires?",
    a: "Nothing is deleted — ever. Your transactions, budgets, bills, goals, and debt records stay safely stored. The workspace unlocks again the moment you restore access.",
  },
  {
    q: "If I renew early, do I lose my remaining days?",
    a: "No. Renewals extend from your current expiry date, not from the purchase date. Buy a year with 60 days left and you get 425 days of access.",
  },
  {
    q: "How do payments work?",
    a: "Checkout and payment processing are handled by Lemon Squeezy, our payment provider. Your purchase is confirmed only by a cryptographically verified webhook from them — never by anything your browser claims.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. The Reports page exports every transaction in any date range to CSV. We believe your data is yours.",
  },
  {
    q: "Which currencies are supported?",
    a: "USD, EUR, GBP, CAD, AUD, BDT, INR, and JPY. You can change your currency anytime in Settings — every amount in the app reformats instantly.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes — the app is fully responsive from 320px phones to large desktops, with a mobile bottom navigation bar and touch-friendly forms.",
  },
  {
    q: "Is there a dark mode?",
    a: "Yes — light, dark, and system-following themes, switchable in Settings → Appearance.",
  },
  {
    q: "Do you give financial advice?",
    a: "No. Smart Budget Planner shows you your real numbers and trends so you can make your own decisions. It deliberately does not recommend specific investments or products.",
  },
  {
    q: "Can I use it with my partner or family?",
    a: "Currently each account is a single user's workspace. Shared budgets are on our roadmap.",
  },
  {
    q: "How do I delete my account?",
    a: "Contact support from your registered email and we'll remove your account and all associated data.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Everything people ask before starting their free trial.
        </p>
      </div>

      <div className="mt-12 space-y-3">
        {FAQS.map((item) => (
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

      <div className="mt-14 rounded-2xl border bg-accent/40 p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight">Still deciding?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Try it free for {TRIAL_DAYS} days — you can even start with sample data and
          explore every feature before entering a single real number.
        </p>
        <Link href="/register" className={cn(buttonVariants(), "mt-6")}>
          Start free trial <ArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
