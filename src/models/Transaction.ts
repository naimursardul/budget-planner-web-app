import mongoose, { Schema, type Model } from "mongoose";
import type { TransactionType } from "@/types";

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  categoryId: mongoose.Types.ObjectId | null;
  categoryName: string;
  subcategory: string;
  description: string;
  amount: number; // positive number; type determines direction
  date: Date;
  account: string;
  recurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["income", "expense", "savings", "bill", "debt"],
      required: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    categoryName: { type: String, required: true, trim: true, maxlength: 50 },
    subcategory: { type: String, trim: true, maxlength: 50, default: "" },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    account: { type: String, default: "Main" },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Spec-recommended indexes for the transaction queries the app runs
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, categoryName: 1, date: -1 });

export const Transaction: Model<ITransaction> =
  (mongoose.models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
