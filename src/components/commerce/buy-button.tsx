"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

interface BuyButtonProps extends Omit<ButtonProps, "onClick"> {
  plan: "one_year" | "two_year";
  label: string;
}

/**
 * Starts a Lemon Squeezy checkout via our server. The plan name is the only
 * thing sent — the server resolves the variant, price, and user identity.
 */
export function BuyButton({ plan, label, ...buttonProps }: BuyButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok || !json?.url) {
        toast.error(json?.error ?? "We couldn't start checkout. Please try again.");
        return;
      }
      // Redirect to the provider-hosted checkout page.
      window.location.href = json.url as string;
    } catch {
      toast.error("Network error — please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={pending} {...buttonProps}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {pending ? "Creating secure checkout…" : label}
    </Button>
  );
}
