"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { resetPasswordAction, type AuthActionState } from "@/actions/auth";

/**
 * The token travels in the URL and rides along as a hidden field. The server
 * action is what actually validates it — expiry and single-use are re-checked
 * there, never here.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState | undefined, FormData>(
    resetPasswordAction,
    undefined
  );

  if (!token) {
    return (
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Link not valid</CardTitle>
          <CardDescription>This reset link is missing its token.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-2 text-center">
          <TriangleAlert className="size-10 text-warning" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Reset links expire after an hour. Request a fresh one and use the newest email.
          </p>
          <Link href="/forgot-password" className={cn(buttonVariants({ variant: "outline" }))}>
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state?.notice === "reset") {
    return (
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Password updated</CardTitle>
          <CardDescription>You can sign in with your new password now.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-2 text-center">
          <CheckCircle2 className="size-10 text-success" aria-hidden />
          <Link href="/login" className={cn(buttonVariants(), "w-full")}>
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        <CardDescription>At least 8 characters, with a letter and a number.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="token" value={token} />

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
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
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
