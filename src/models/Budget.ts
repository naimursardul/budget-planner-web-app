import mongoose, { Schema, type Model } from "mongoose";
import type { BudgetItem } from "@/types";

export interface IBudget {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  year: number;
  month: number; // 1-12
  items: BudgetItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BudgetItemSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true, trim: true, maxlength: 50 },
    amount: { type: Number, required: true, min: 0 },
    priority: {
      type: String,
      enum: ["essential", "high", "moderate", "low", "avoidable"],
      default: "moderate",
    },
  },
  { _id: false }
);

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    items: { type: [BudgetItemSchema], default: [] },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const Budget: Model<IBudget> =
  (mongoose.models.Budget as Model<IBudget>) || mongoose.model<IBudget>("Budget", BudgetSchema);
