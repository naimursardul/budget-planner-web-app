import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            Back to home
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
