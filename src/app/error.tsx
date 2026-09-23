"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Never surface raw errors to users — log server-side diagnostics only.
    console.error("[app] unexpected error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <RefreshCcw className="size-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error interrupted things. Your data is safe — try again, and if the
          problem persists, sign out and back in.
        </p>
        <Button onClick={reset} size="lg" className="mt-8 w-full sm:w-auto">
          <RefreshCcw aria-hidden /> Try again
        </Button>
      </div>
    </div>
  );
}
