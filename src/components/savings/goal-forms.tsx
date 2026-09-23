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
  createGoalAction,
  updateGoalAction,
  addContributionAction,
} from "@/actions/savings";
import { savingsGoalSchema, type SavingsGoalInput } from "@/lib/validations/savings";

const COLOR_CHOICES = ["#B8DDB0", "#C9BCE8", "#B9E3EA", "#F6C1CC", "#F6C49C"];

export interface GoalRecord {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  color: string;
}

function GoalFormFields({
  register,
  watch,
  setValue,
  errors,
}: {
  register: ReturnType<typeof useForm<SavingsGoalInput>>["register"];
  watch: ReturnType<typeof useForm<SavingsGoalInput>>["watch"];
  setValue: ReturnType<typeof useForm<SavingsGoalInput>>["setValue"];
  errors: Record<string, { message?: string }>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="goal-name">Goal name</Label>
        <Input id="goal-name" placeholder="e.g. Emergency Fund" {...register("name")} />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target amount</Label>
          <Input id="goal-target" type="number" min="0" step="0.01" placeholder="0.00" {...register("targetAmount")} />
          {errors.targetAmount && <p className="text-xs text-danger">{errors.targetAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-current">Already saved</Label>
          <Input id="goal-current" type="number" min="0" step="0.01" placeholder="0.00" {...register("currentAmount")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="goal-monthly">Monthly contribution</Label>
          <Input id="goal-monthly" type="number" min="0" step="0.01" placeholder="0.00" {...register("monthlyContribution")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-deadline">Deadline (optional)</Label>
          <Input id="goal-deadline" type="date" {...register("deadline")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2" role="radiogroup" aria-label="Goal color">
          {COLOR_CHOICES.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={watch("color") === color}
              aria-label={`Color ${color}`}
              onClick={() => setValue("color", color)}
              className="size-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: color,
                boxShadow: watch("color") === color ? "0 0 0 2px var(--card), 0 0 0 4px var(--foreground)" : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function GoalFormDialog({ trigger, editRecord }: { trigger: React.ReactNode; editRecord?: GoalRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalInput>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: { name: "", targetAmount: undefined as unknown as number, currentAmount: 0, deadline: "", monthlyContribution: 0, color: "#B8DDB0" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: editRecord?.name ?? "",
      targetAmount: editRecord?.targetAmount ?? (undefined as unknown as number),
      currentAmount: editRecord?.currentAmount ?? 0,
      deadline: editRecord?.deadline ?? "",
      monthlyContribution: editRecord?.monthlyContribution ?? 0,
      color: editRecord?.color ?? "#B8DDB0",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRecord]);

  async function onSubmit(values: SavingsGoalInput) {
    const formData = new FormData();
    if (editRecord) formData.set("id", editRecord.id);
    formData.set("name", values.name);
    formData.set("targetAmount", String(values.targetAmount));
    formData.set("currentAmount", String(values.currentAmount ?? 0));
    formData.set("deadline", values.deadline ?? "");
    formData.set("monthlyContribution", String(values.monthlyContribution ?? 0));
    formData.set("color", values.color);

    const result = editRecord
      ? await updateGoalAction(undefined, formData)
      : await createGoalAction(undefined, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editRecord ? "Goal updated" : "Goal created");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>
            Set a target and track your progress toward it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <GoalFormFields register={register} watch={watch} setValue={setValue} errors={errors} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              {editRecord ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContributionDialog({ goal }: { goal: GoalRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const formData = new FormData();
    formData.set("goalId", goal.id);
    formData.set("amount", amount);
    const result = await addContributionAction(undefined, formData);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Contribution added");
    setAmount("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="soft">
          <Plus aria-hidden /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to {goal.name}</DialogTitle>
          <DialogDescription>
            Contributions are recorded as savings transactions automatically.
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
            <Label htmlFor="contrib-amount">Amount</Label>
            <Input
              id="contrib-amount"
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
              Add contribution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
