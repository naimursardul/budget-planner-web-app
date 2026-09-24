"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearFinancialDataAction, type ActionState } from "@/actions/settings";
import { CLEAR_DATA_PHRASE } from "@/lib/validations/settings";

/**
 * The switch from onboarding's sample data to real numbers. Destructive, so
 * it takes a typed confirmation and says plainly what survives beforehand.
 */
export function DataManager({ isDemo }: { isDemo: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    clearFinancialDataAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
      setConfirm("");
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start from scratch</CardTitle>
        <CardDescription>
          Clear the sample data from onboarding — or any data you&apos;ve outgrown — and begin
          entering your real numbers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/80 p-4 text-sm">
          <p className="font-medium">This removes</p>
          <p className="text-muted-foreground">
            Every transaction, budget, bill, calendar event, savings goal, debt and notification.
          </p>
          <p className="mt-3 font-medium">This keeps</p>
          <p className="text-muted-foreground">
            Your account, categories, currency and date preferences, and any access you&apos;ve
            paid for.
          </p>
        </div>

        {isDemo ? (
          <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            This is the shared demo account, so its data is kept intact. Register your own account
            to start with a clean workspace.
          </p>
        ) : (
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Clear all financial data
          </Button>
        )}

        {state?.error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>Clear all financial data?</DialogTitle>
              <DialogDescription>
                This can&apos;t be undone. Your categories and settings stay, but every
                transaction, budget, bill, goal and debt is deleted.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <Label htmlFor="confirm-clear">
                Type <span className="font-mono font-semibold">{CLEAR_DATA_PHRASE}</span> to
                confirm
              </Label>
              <Input
                id="confirm-clear"
                name="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending || confirm !== CLEAR_DATA_PHRASE}
              >
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                {pending ? "Clearing…" : "Clear everything"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
