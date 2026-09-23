"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createDebtAction, updateDebtAction, payDebtAction } from "@/actions/debts";
import { debtSchema, type DebtInput } from "@/lib/validations/debt";

export const DEBT_TYPES = [
  "Credit Card",
  "Student Loan",
  "Car Loan",
  "Mortgage",
  "Personal Loan",
  "Medical Debt",
  "Other",
];

export interface DebtRecord {
  id: string;
  name: string;
  type: string;
  originalBalance: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
}

export function DebtFormDialog({
  trigger,
  editRecord,
}: {
  trigger: React.ReactNode;
  editRecord?: DebtRecord;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DebtInput>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: "",
      type: "Credit Card",
      originalBalance: undefined as unknown as number,
      currentBalance: undefined as unknown as number,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: 1,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: editRecord?.name ?? "",
      type: editRecord?.type ?? "Credit Card",
      originalBalance: editRecord?.originalBalance ?? (undefined as unknown as number),
      currentBalance: editRecord?.currentBalance ?? (undefined as unknown as number),
      interestRate: editRecord?.interestRate ?? 0,
      minimumPayment: editRecord?.minimumPayment ?? 0,
      dueDate: editRecord?.dueDate ?? 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRecord]);

  async function onSubmit(values: DebtInput) {
    const formData = new FormData();
    if (editRecord) formData.set("id", editRecord.id);
    Object.entries(values).forEach(([k, v]) => formData.set(k, String(v)));

    const result = editRecord
      ? await updateDebtAction(undefined, formData)
      : await createDebtAction(undefined, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editRecord ? "Debt updated" : "Debt saved");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit debt" : "Track a debt"}</DialogTitle>
          <DialogDescription>
            Record the balance you owe — payments reduce it automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-name">Name</Label>
              <Input id="debt-name" placeholder="e.g. Visa Card" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-type">Type</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
                <SelectTrigger id="debt-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-original">Original balance</Label>
              <Input id="debt-original" type="number" min="0" step="0.01" placeholder="0.00" {...register("originalBalance")} />
              {errors.originalBalance && (
                <p className="text-xs text-danger">{errors.originalBalance.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-current">Current balance</Label>
              <Input id="debt-current" type="number" min="0" step="0.01" placeholder="0.00" {...register("currentBalance")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-rate">Interest %</Label>
              <Input id="debt-rate" type="number" min="0" max="100" step="0.1" {...register("interestRate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-min">Min payment</Label>
              <Input id="debt-min" type="number" min="0" step="0.01" {...register("minimumPayment")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-due">Due day</Label>
              <Input id="debt-due" type="number" min="1" max="31" {...register("dueDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              {editRecord ? "Save changes" : "Add debt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PayDebtDialog({ debt }: { debt: DebtRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(debt.minimumPayment || ""));
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const formData = new FormData();
    formData.set("id", debt.id);
    formData.set("amount", amount);
    const result = await payDebtAction(undefined, formData);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment recorded");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="soft">
          <Plus aria-hidden /> Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay {debt.name}</DialogTitle>
          <DialogDescription>
            Payments reduce the balance and appear in your transactions.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Amount</Label>
            <Input
              id="pay-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !amount}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
