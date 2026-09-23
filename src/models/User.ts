import mongoose, { Schema, type Model } from "mongoose";
import type { AccessStatus, DateFormat, Plan, ThemePreference } from "@/types";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  dateFormat: DateFormat;
  theme: ThemePreference;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  onboardingCompleted: boolean;
  isDemo: boolean;
  notificationPrefs: {
    billReminders: boolean;
    budgetAlerts: boolean;
    savingsMilestones: boolean;
    monthlySummary: boolean;
  };
  // Cached access state — Purchase collection is the authoritative history
  accessStatus: AccessStatus;
  currentPlan: Plan | "free";
  activeUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // select: false → the hash is never loaded unless a caller explicitly asks
    // with .select("+passwordHash"), so ordinary reads can't leak it.
    passwordHash: { type: String, required: true, select: false },
    currency: { type: String, default: "USD" },
    dateFormat: { type: String, enum: ["MM/DD/YYYY", "DD/MM/YYYY"], default: "MM/DD/YYYY" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    monthlySavingsGoal: { type: Number, default: 0, min: 0 },
    onboardingCompleted: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false, index: true },
    notificationPrefs: {
      billReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      savingsMilestones: { type: Boolean, default: true },
      monthlySummary: { type: Boolean, default: true },
    },
    accessStatus: { type: String, enum: ["trialing", "active", "expired"], default: "trialing" },
    currentPlan: { type: String, enum: ["free", "one_year", "two_year"], default: "free" },
    activeUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

UserSchema.index({ isDemo: 1, email: 1 });

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
