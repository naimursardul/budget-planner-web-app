"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
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
import { forgotPasswordAction, type AuthActionState } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthActionState | undefined, FormData>(
    forgotPasswordAction,
    undefined
  );

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the email you registered with and we&apos;ll send reset instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.notice === "unconfigured" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <TriangleAlert className="size-10 text-warning" aria-hidden />
            <p className="text-sm font-medium">Password reset email isn&apos;t set up yet</p>
            <p className="text-sm text-muted-foreground">
              This workspace has no email provider configured, so we can&apos;t send you a link.
              Contact support and we&apos;ll reset it for you.
            </p>
          </div>
        ) : state?.notice === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, reset instructions are on their way. The link
              expires in 1 hour.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4" noValidate>
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

            {state?.error && (
              <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {pending ? "Sending…" : "Send reset instructions"}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
