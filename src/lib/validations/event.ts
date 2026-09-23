import { z } from "zod";
import { CALENDAR_EVENT_TYPES } from "@/types";

const isoDate = z
  .string()
  .min(1, "Date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const calendarEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  date: isoDate,
  type: z.enum(CALENDAR_EVENT_TYPES).default("custom"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#C9BCE8"),
  notes: z.string().trim().max(300, "Notes are too long").optional().default(""),
});

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
