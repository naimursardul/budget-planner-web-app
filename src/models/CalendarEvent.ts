import mongoose, { Schema, type Model } from "mongoose";
import type { CalendarEventType } from "@/types";

export interface ICalendarEvent {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  color: string;
  type: CalendarEventType;
  notes: string;
  completed: boolean;
  sourceId: mongoose.Types.ObjectId | null; // originating bill, if any
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: Date, required: true },
    color: { type: String, default: "#C9BCE8" },
    type: {
      type: String,
      enum: ["bill", "income", "debt", "savings", "custom"],
      default: "custom",
    },
    notes: { type: String, trim: true, maxlength: 300, default: "" },
    completed: { type: Boolean, default: false },
    sourceId: { type: Schema.Types.ObjectId, ref: "Bill", default: null },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ userId: 1, date: 1 });

export const CalendarEvent: Model<ICalendarEvent> =
  (mongoose.models.CalendarEvent as Model<ICalendarEvent>) ||
  mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
