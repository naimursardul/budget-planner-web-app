"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EventFormDialog,
  type CalendarEventRecord,
} from "@/components/calendar/event-form";
import { toggleEventCompletedAction, deleteEventAction } from "@/actions/events";

export function EventActions({ event }: { event: CalendarEventRecord }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleComplete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", event.id);
      await toggleEventCompletedAction(formData);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", event.id);
      try {
        await deleteEventAction(formData);
        toast.success("Event deleted");
        router.refresh();
      } catch {
        toast.error("We couldn't delete that event. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={toggleComplete}
        disabled={pending}
        aria-label={event.completed ? "Mark incomplete" : "Mark complete"}
        className={event.completed ? "text-success" : ""}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => setEditOpen(true)}
        aria-label={`Edit ${event.title}`}
        disabled={event.fromBill}
        title={event.fromBill ? "Bill events are managed on the Bills page" : "Edit"}
      >
        <Pencil aria-hidden />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={pending || event.fromBill}
        aria-label={`Delete ${event.title}`}
        className="text-destructive"
        title={event.fromBill ? "Bill events are managed on the Bills page" : "Delete"}
      >
        <Trash2 aria-hidden />
      </Button>

      <EventFormDialog editRecord={event} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
