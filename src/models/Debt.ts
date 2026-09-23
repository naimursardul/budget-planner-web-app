import mongoose, { Schema, type Model } from "mongoose";

export interface IDebt {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  originalBalance: number;
  currentBalance: number;
  interestRate: number; // annual percentage
  minimumPayment: number;
  dueDate: number; // day of month (1-31)
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, required: true, trim: true, maxlength: 50 },
    originalBalance: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, default: 0, min: 0, max: 100 },
    minimumPayment: { type: Number, default: 0, min: 0 },
    dueDate: { type: Number, default: 1, min: 1, max: 31 },
  },
  { timestamps: true }
);

export const Debt: Model<IDebt> =
  (mongoose.models.Debt as Model<IDebt>) || mongoose.model<IDebt>("Debt", DebtSchema);
