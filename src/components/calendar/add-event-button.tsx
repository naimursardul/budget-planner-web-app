"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/calendar/event-form";

/** Per-day "+" in the calendar grid — opens the event form preset to that date. */
export function AddEventButton({ date, className }: { date: string; className?: string }) {
  return (
    <EventFormDialog
      defaultDate={date}
      trigger={
        <Button variant="ghost" size="icon-sm" className={className} aria-label={`Add event on ${date}`}>
          <Plus aria-hidden />
        </Button>
      }
    />
  );
}
