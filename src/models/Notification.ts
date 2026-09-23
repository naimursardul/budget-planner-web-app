import mongoose, { Schema, type Model } from "mongoose";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "bill_due" | "budget_near" | "budget_over" | "savings_milestone" | "new_month";
  title: string;
  message: string;
  read: boolean;
  dedupKey: string; // e.g. "bill_due:<billId>:<dueDateISO>" — prevents spam
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["bill_due", "budget_near", "budget_over", "savings_milestone", "new_month"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 400 },
    read: { type: Boolean, default: false },
    dedupKey: { type: String, required: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, dedupKey: 1 }, { unique: true });

export const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema);
