import mongoose, { Schema, type Model } from "mongoose";

export interface ISavingsGoal {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  monthlyContribution: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, default: null },
    monthlyContribution: { type: Number, default: 0, min: 0 },
    color: { type: String, default: "#B8DDB0" },
  },
  { timestamps: true }
);

export const SavingsGoal: Model<ISavingsGoal> =
  (mongoose.models.SavingsGoal as Model<ISavingsGoal>) ||
  mongoose.model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema);
