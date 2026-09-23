"use client";

import { useEffect, useState } from "react";
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
import { createBillAction, updateBillAction } from "@/actions/bills";
import { billSchema, type BillInput } from "@/lib/validations/bill";
import type { BillFrequency } from "@/types";

export interface BillCategoryOption {
  id: string;
  name: string;
}

export interface BillRecord {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  autoPay: boolean;
  reminderDays: number;
}

const FREQ_LABELS: Record<BillFrequency, string> = {
  one_time: "One-time",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface BillFormDialogProps {
  categories: BillCategoryOption[];
  trigger?: React.ReactNode;
  editRecord?: BillRecord;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BillFormDialog({
  categories,
  trigger,
  editRecord,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BillFormDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      amount: undefined as unknown as number,
      dueDate: toDateInput(new Date()),
      frequency: "monthly",
      autoPay: false,
      reminderDays: 2,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: editRecord?.name ?? "",
      categoryId: editRecord?.categoryId ?? "",
      amount: editRecord?.amount ?? (undefined as unknown as number),
      dueDate: editRecord?.dueDate ?? toDateInput(new Date()),
      frequency: editRecord?.frequency ?? "monthly",
      autoPay: editRecord?.autoPay ?? false,
      reminderDays: editRecord?.reminderDays ?? 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRecord]);

  async function onSubmit(values: BillInput) {
    const formData = new FormData();
    if (editRecord) formData.set("id", editRecord.id);
    formData.set("name", values.name);
    formData.set("categoryId", values.categoryId);
    formData.set("amount", String(values.amount));
    formData.set("dueDate", values.dueDate);
    formData.set("frequency", values.frequency);
    formData.set("autoPay", values.autoPay ? "on" : "");
    formData.set("reminderDays", String(values.reminderDays));

    const result = editRecord
      ? await updateBillAction(undefined, formData)
      : await createBillAction(undefined, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editRecord ? "Bill updated" : "Bill saved");
    (controlledOnOpenChange ?? setUncontrolledOpen)(false);
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
          <DialogTitle>{editRecord ? "Edit bill" : "Add bill"}</DialogTitle>
          <DialogDescription>
            Bills appear automatically on your calendar and remind you before they&apos;re due.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="bill-name">Name</Label>
            <Input id="bill-name" placeholder="e.g. Electricity" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bill-category">Category</Label>
              <Select
                value={watch("categoryId") || undefined}
                onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="bill-category">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
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
              <Label htmlFor="bill-amount">Amount</Label>
              <Input
                id="bill-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount")}
              />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bill-due">Next due date</Label>
              <Input id="bill-due" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-danger">{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-frequency">Frequency</Label>
              <Select
                value={watch("frequency")}
                onValueChange={(v) => setValue("frequency", v as BillFrequency)}
              >
                <SelectTrigger id="bill-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FREQ_LABELS) as BillFrequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {FREQ_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="bill-reminder">Remind me (days before)</Label>
              <Input id="bill-reminder" type="number" min="0" max="14" {...register("reminderDays")} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label htmlFor="bill-autopay">Auto-pay</Label>
                <p className="text-xs text-muted-foreground">Paid automatically</p>
              </div>
              <Switch
                id="bill-autopay"
                checked={watch("autoPay")}
                onCheckedChange={(v) => setValue("autoPay", v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => (controlledOnOpenChange ?? setUncontrolledOpen)(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              {editRecord ? "Save changes" : "Add bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
