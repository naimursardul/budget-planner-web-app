import mongoose, { Schema, type Model } from "mongoose";
import type { BillFrequency, BillStatus, Priority } from "@/types";

export interface IBill {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  categoryId: mongoose.Types.ObjectId | null;
  categoryName: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  autoPay: boolean;
  reminderDays: number; // days before due date to notify (0 = off)
  status: BillStatus;
  lastPaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    categoryName: { type: String, required: true, trim: true, maxlength: 50 },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    frequency: {
      type: String,
      enum: ["one_time", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    autoPay: { type: Boolean, default: false },
    reminderDays: { type: Number, default: 2, min: 0, max: 14 },
    status: { type: String, enum: ["upcoming", "paid", "overdue"], default: "upcoming" },
    lastPaidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BillSchema.index({ userId: 1, dueDate: 1 });

export const Bill: Model<IBill> =
  (mongoose.models.Bill as Model<IBill>) || mongoose.model<IBill>("Bill", BillSchema);
