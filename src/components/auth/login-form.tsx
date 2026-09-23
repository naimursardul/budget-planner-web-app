"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginAction, type AuthActionState } from "@/actions/auth";

/**
 * `callbackUrl` comes from the middleware when a signed-out visitor hits a
 * protected page. The server action validates it before redirecting.
 * `signedOut` is set by /logout after a session was cleared.
 */
export function LoginForm({
  callbackUrl,
  signedOut,
}: {
  callbackUrl?: string;
  signedOut?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AuthActionState | undefined, FormData>(
    loginAction,
    undefined
  );

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your budgeting workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {signedOut && !state?.error && (
          <p className="mb-4 rounded-lg bg-accent px-3 py-2 text-sm text-muted-foreground">
            You&apos;ve been signed out. Sign in again to pick up where you left off.
          </p>
        )}
        <form action={formAction} className="space-y-4" noValidate>
          {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
