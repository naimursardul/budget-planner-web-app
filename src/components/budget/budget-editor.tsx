"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBudgetAction, copyPreviousBudgetAction } from "@/actions/budgets";
import type { Priority } from "@/types";
import { cn } from "@/lib/utils";

export interface BudgetCategory {
  id: string;
  name: string;
  priority: Priority;
}

const PRIORITY_DOT: Record<Priority, string> = {
  essential: "bg-danger",
  high: "bg-warning",
  moderate: "bg-[var(--viz-1)]",
  low: "bg-sage",
  avoidable: "bg-muted-foreground",
};

interface BudgetEditorProps {
  year: number;
  month: number;
  categories: BudgetCategory[];
  currentBudget: Record<string, number>; // categoryId → budgeted amount
  currencySymbol: string;
}

export function BudgetEditor({
  year,
  month,
  categories,
  currentBudget,
  currencySymbol,
}: BudgetEditorProps) {
  const router = useRouter();
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(
      categories.map((c) => [c.id, currentBudget[c.id] ? String(currentBudget[c.id]) : ""])
    )
  );
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => Object.values(amounts).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [amounts]
  );

  async function handleSave() {
    setSaving(true);
    const payload = categories
      .map((c) => ({ categoryId: c.id, amount: Number(amounts[c.id]) || 0 }))
      .filter((i) => i.amount > 0);

    const formData = new FormData();
    formData.set("year", String(year));
    formData.set("month", String(month));
    formData.set("payload", JSON.stringify(payload));

    const result = await saveBudgetAction(undefined, formData);
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Budget saved");
      router.refresh();
    }
  }

  async function handleCopy() {
    const formData = new FormData();
    formData.set("year", String(year));
    formData.set("month", String(month));
    const result = await copyPreviousBudgetAction(undefined, formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Previous budget copied");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Monthly budget</CardTitle>
          <CardDescription>
            Set a planned amount per category — progress updates as you spend.
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total budgeted</p>
          <p className="text-lg font-bold tabular-nums">
            {currencySymbol}
            {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <span
                className={cn("size-2.5 shrink-0 rounded-full", PRIORITY_DOT[category.priority])}
                aria-hidden
                title={`${category.priority} priority`}
              />
              <Label
                htmlFor={`budget-${category.id}`}
                className="flex-1 truncate text-sm font-medium"
              >
                {category.name}
                <span className="sr-only"> ({category.priority} priority)</span>
              </Label>
              <div className="relative w-32">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id={`budget-${category.id}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="pl-7"
                  value={amounts[category.id] ?? ""}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [category.id]: e.target.value }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy aria-hidden /> Copy previous month
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            Save budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
