import { Purchase, type IPurchase } from "@/models/Purchase";
import { User } from "@/models/User";
import type { Plan } from "@/types";

export const PLAN_DAYS: Record<Plan, number> = {
  one_year: 365,
  two_year: 730,
};

export interface PurchaseEventData {
  plan: Plan;
  providerOrderId: string;
  providerSubscriptionId?: string | null;
  providerProductId?: string | null;
  providerVariantId?: string | null;
  amount: number;
  currency: string;
  email: string;
  purchasedAt: Date;
}

export interface ApplyPurchaseResult {
  purchase: IPurchase;
  expiresAt: Date;
  /** true when the purchase stacked onto an unexpired window (spec §43 renewal rule). */
  extendedFromExisting: boolean;
  /** false when this providerOrderId was already processed — nothing changed. */
  created: boolean;
}

/**
 * Record a verified purchase and extend the user's prepaid access window.
 * Renewals extend from the *current* activeUntil when still active, so a user
 * who renews early never loses paid days. Idempotent on providerOrderId.
 */
export async function applyPurchase(
  userId: string,
  event: PurchaseEventData
): Promise<ApplyPurchaseResult | null> {
  // Idempotency: the unique index makes a duplicate webhook event a no-op.
  const existing = await Purchase.findOne({ providerOrderId: event.providerOrderId });
  if (existing) {
    return {
      purchase: existing,
      expiresAt: existing.expiresAt,
      extendedFromExisting: false,
      created: false,
    };
  }

  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const days = PLAN_DAYS[event.plan];

  // Extend from existing expiry while still active; otherwise from today.
  const base = user.activeUntil > now ? new Date(user.activeUntil) : now;
  const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  const extendedFromExisting = base > now;

  const purchase = await Purchase.create({
    userId,
    plan: event.plan,
    provider: "lemonsqueezy",
    providerOrderId: event.providerOrderId,
    providerSubscriptionId: event.providerSubscriptionId ?? null,
    providerProductId: event.providerProductId ?? null,
    providerVariantId: event.providerVariantId ?? null,
    status: "active",
    purchasedAt: event.purchasedAt,
    startsAt: base,
    expiresAt,
    amount: event.amount,
    currency: event.currency,
    email: event.email,
  });

  // Only ever move activeUntil forward — never shorten paid access.
  if (expiresAt > user.activeUntil) {
    user.activeUntil = expiresAt;
  }
  user.accessStatus = "active";
  user.currentPlan = event.plan;
  await user.save();

  return { purchase, expiresAt, extendedFromExisting, created: true };
}

/** Mark a purchase refunded and recompute the access window from remaining purchases. */
export async function refundPurchase(providerOrderId: string): Promise<boolean> {
  const purchase = await Purchase.findOne({ providerOrderId, status: "active" });
  if (!purchase) return false;

  purchase.status = "refunded";
  await purchase.save();

  // Recompute the window from the user's other active purchases.
  const userId = purchase.userId;
  const user = await User.findById(userId);
  if (!user) return true;

  const remaining = await Purchase.find({ userId, status: "active" }).sort({ expiresAt: -1 });
  const latestExpiry = remaining[0]?.expiresAt;
  const now = new Date();

  if (latestExpiry && latestExpiry > now) {
    user.activeUntil = latestExpiry;
    user.accessStatus = "active";
    user.currentPlan = remaining[0].plan;
  } else {
    user.activeUntil = now;
    user.accessStatus = "expired";
    user.currentPlan = "free";
  }
  await user.save();
  return true;
}
