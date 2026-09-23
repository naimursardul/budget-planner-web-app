"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Polls /api/access until the verified webhook activates the purchase
 * (typically seconds after Lemon Squeezy confirms payment), then links to
 * the app. The browser never marks anything as paid — it only observes.
 */
export function ActivationPoller({ initiallyActive }: { initiallyActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initiallyActive);
  const [checking, setChecking] = useState(!initiallyActive);

  useEffect(() => {
    if (active) return;
    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/access", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json.hasAccess) {
          setActive(true);
          setChecking(false);
          router.refresh();
        }
      } catch {
        // Keep polling — transient network errors shouldn't stop activation detection.
      }
    }, 3000);

    const stop = setTimeout(() => {
      clearInterval(interval);
      if (!cancelled) setChecking(false);
    }, 120_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [active, router]);

  if (active) {
    return (
      <a
        href="/dashboard"
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
      >
        <CheckCircle2 aria-hidden /> Go to your planner
      </a>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        disabled
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground opacity-50 sm:w-auto"
      >
        <Loader2 className="animate-spin" aria-hidden />
        {checking ? "Waiting for payment confirmation…" : "Still processing"}
      </button>
      <p className="text-xs text-muted-foreground">
        Activation is automatic — this page will update the moment our payment provider
        confirms your order. You can also safely leave and come back later.
      </p>
    </div>
  );
}
