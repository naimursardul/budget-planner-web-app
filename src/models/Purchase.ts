import mongoose, { Schema, type Model } from "mongoose";
import type { Plan, PurchaseStatus } from "@/types";

export interface IPurchase {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  plan: Plan;
  provider: string; // "lemonsqueezy"
  providerOrderId: string;
  providerSubscriptionId: string | null;
  providerProductId: string | null;
  providerVariantId: string | null;
  status: PurchaseStatus;
  purchasedAt: Date;
  startsAt: Date;
  expiresAt: Date;
  amount: number;
  currency: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["one_year", "two_year"], required: true },
    provider: { type: String, required: true, default: "lemonsqueezy" },
    // unique → webhook processing is idempotent (duplicate events are no-ops)
    providerOrderId: { type: String, required: true, unique: true },
    providerSubscriptionId: { type: String, default: null },
    providerProductId: { type: String, default: null },
    providerVariantId: { type: String, default: null },
    status: { type: String, enum: ["active", "expired", "refunded", "cancelled"], default: "active" },
    purchasedAt: { type: Date, required: true },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    email: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Purchase: Model<IPurchase> =
  (mongoose.models.Purchase as Model<IPurchase>) ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
