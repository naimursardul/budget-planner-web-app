"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transactions";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { TRANSACTION_TYPES, type CategoryType, type TransactionType } from "@/types";
import { ACCOUNTS } from "@/lib/currencies";

export interface CategoryOption {
  id: string;
  name: string;
  type: CategoryType;
}

export interface TransactionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  /** Display-only — populated by the transactions page; the edit dialog uses categoryId. */
  categoryName?: string;
  subcategory: string;
  description: string;
  amount: number;
  account: string;
  recurring: boolean;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  savings: "Savings",
  bill: "Bill",
  debt: "Debt payment",
};

interface TransactionFormProps {
  categories: CategoryOption[];
  trigger?: React.ReactNode;
  defaultType?: TransactionType;
  editRecord?: TransactionRecord;
  /** Controlled mode — used when the dialog lives outside a dropdown menu. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TransactionFormDialog({
  categories,
  trigger,
  defaultType = "expense",
  editRecord,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TransactionFormProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;
  const [type, setType] = useState<TransactionType>(editRecord?.type ?? defaultType);
  const open = controlledOpen ?? uncontrolledOpen;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: editRecord?.date ?? toDateInput(new Date()),
      type: editRecord?.type ?? defaultType,
      categoryId: editRecord?.categoryId ?? "",
      subcategory: editRecord?.subcategory ?? "",
      description: editRecord?.description ?? "",
      amount: editRecord?.amount ?? (undefined as unknown as number),
      account: editRecord?.account ?? "Main",
      recurring: editRecord?.recurring ?? false,
    },
  });

  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  const recurring = watch("recurring");

  useEffect(() => {
    setValue("type", type);
    setValue("categoryId", "");
  }, [type, setValue]);

  useEffect(() => {
    if (!open) return;
    const t = editRecord?.type ?? defaultType;
    setType(t);
    reset({
      date: editRecord?.date ?? toDateInput(new Date()),
      type: t,
      categoryId: editRecord?.categoryId ?? "",
      subcategory: editRecord?.subcategory ?? "",
      description: editRecord?.description ?? "",
      amount: editRecord?.amount ?? (undefined as unknown as number),
      account: editRecord?.account ?? "Main",
      recurring: editRecord?.recurring ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRecord]);

  async function onSubmit(values: TransactionInput) {
    const formData = new FormData();
    if (editRecord) formData.set("id", editRecord.id);
    formData.set("date", values.date);
    formData.set("type", values.type);
    formData.set("categoryId", values.categoryId);
    formData.set("subcategory", values.subcategory ?? "");
    formData.set("description", values.description ?? "");
    formData.set("amount", String(values.amount));
    formData.set("account", values.account);
    formData.set("recurring", values.recurring ? "on" : "");

    const result = editRecord
      ? await updateTransactionAction(undefined, formData)
      : await createTransactionAction(undefined, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editRecord ? "Transaction updated" : "Transaction saved");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (controlledOnOpenChange ?? setUncontrolledOpen)(next)}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            {editRecord ? "Update the details below." : "Track money moving in or out."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                <SelectTrigger id="tx-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">Date</Label>
              <Input id="tx-date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-category">Category</Label>
              <Select
                value={watch("categoryId") || undefined}
                onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="tx-category">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {typeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-danger">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-subcategory">Sub-category (optional)</Label>
              <Input id="tx-subcategory" placeholder="e.g. Weekly groceries" {...register("subcategory")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount")}
              />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-account">Account</Label>
              <Select
                value={watch("account")}
                onValueChange={(v) => setValue("account", v)}
              >
                <SelectTrigger id="tx-account">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNTS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-description">Description (optional)</Label>
            <Input id="tx-description" placeholder="What was this for?" {...register("description")} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label htmlFor="tx-recurring">Recurring</Label>
              <p className="text-xs text-muted-foreground">Repeats every month</p>
            </div>
            <Switch
              id="tx-recurring"
              checked={recurring}
              onCheckedChange={(v) => setValue("recurring", v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              {editRecord ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
