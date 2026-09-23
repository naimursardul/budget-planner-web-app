"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { CalendarEvent } from "@/models";
import { requireUser } from "@/lib/session";
import { calendarEventSchema } from "@/lib/validations/event";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function createEventAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = calendarEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    type: formData.get("type"),
    color: formData.get("color"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    await CalendarEvent.create({
      userId: user.id,
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
  } catch {
    return { error: "We couldn't save that event. Please try again." };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: "Event saved" };
}

export async function updateEventAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing event reference." };

  const parsed = calendarEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    type: formData.get("type"),
    color: formData.get("color"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await connectDB();
    const result = await CalendarEvent.updateOne(
      { _id: id, userId: user.id as never },
      { $set: { ...parsed.data, date: new Date(parsed.data.date) } }
    );
    if (result.matchedCount === 0) return { error: "Event not found." };
  } catch {
    return { error: "We couldn't update that event. Please try again." };
  }

  revalidatePath("/calendar");
  return { success: "Event updated" };
}

export async function toggleEventCompletedAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await connectDB();
  const event = await CalendarEvent.findOne({ _id: id, userId: user.id as never });
  if (!event) return;
  event.completed = !event.completed;
  await event.save();

  revalidatePath("/calendar");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await connectDB();
  // sourceId set → this event belongs to a bill; bills manage their own events
  await CalendarEvent.deleteOne({ _id: id, userId: user.id as never, sourceId: null });
  revalidatePath("/calendar");
}
