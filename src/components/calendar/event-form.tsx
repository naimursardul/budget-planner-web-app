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
import { Textarea } from "@/components/ui/input";
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
import { createEventAction, updateEventAction } from "@/actions/events";
import { calendarEventSchema, type CalendarEventInput } from "@/lib/validations/event";
import type { CalendarEventType } from "@/types";

export interface CalendarEventRecord {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  color: string;
  notes: string;
  completed: boolean;
  fromBill: boolean;
}

const TYPE_LABELS: Record<CalendarEventType, string> = {
  bill: "Bill",
  income: "Income",
  debt: "Debt payment",
  savings: "Savings",
  custom: "Custom",
};

const COLOR_CHOICES = ["#C9BCE8", "#B8DDB0", "#B9E3EA", "#F6C1CC", "#F6C49C", "#252329"];

interface EventFormDialogProps {
  trigger?: React.ReactNode;
  editRecord?: CalendarEventRecord;
  defaultDate?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EventFormDialog({
  trigger,
  editRecord,
  defaultDate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EventFormDialogProps) {
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
  } = useForm<CalendarEventInput>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: "",
      date: defaultDate ?? new Date().toISOString().slice(0, 10),
      type: "custom",
      color: "#C9BCE8",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: editRecord?.title ?? "",
      date: editRecord?.date ?? defaultDate ?? new Date().toISOString().slice(0, 10),
      type: editRecord?.type ?? "custom",
      color: editRecord?.color ?? "#C9BCE8",
      notes: editRecord?.notes ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRecord, defaultDate]);

  async function onSubmit(values: CalendarEventInput) {
    const formData = new FormData();
    if (editRecord) formData.set("id", editRecord.id);
    formData.set("title", values.title);
    formData.set("date", values.date);
    formData.set("type", values.type);
    formData.set("color", values.color);
    formData.set("notes", values.notes ?? "");

    const result = editRecord
      ? await updateEventAction(undefined, formData)
      : await createEventAction(undefined, formData);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editRecord ? "Event updated" : "Event saved");
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
          <DialogTitle>{editRecord ? "Edit event" : "Add event"}</DialogTitle>
          <DialogDescription>
            Custom events live alongside your bills and recurring payments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input id="event-title" placeholder="e.g. Payday" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input id="event-date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as CalendarEventType)}
              >
                <SelectTrigger id="event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as CalendarEventType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Event color">
              {COLOR_CHOICES.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={watch("color") === color}
                  aria-label={`Color ${color}`}
                  onClick={() => setValue("color", color)}
                  className="size-8 rounded-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    background: color,
                    boxShadow: watch("color") === color ? "0 0 0 2px var(--card), 0 0 0 4px var(--foreground)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-notes">Notes (optional)</Label>
            <Textarea id="event-notes" placeholder="Anything to remember…" {...register("notes")} />
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
              {editRecord ? "Save changes" : "Add event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
