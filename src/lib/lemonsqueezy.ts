import crypto from "crypto";
import type { Plan } from "@/types";
import { applyPurchase, refundPurchase } from "@/services/billing";
import { User } from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const API_BASE = "https://api.lemonsqueezy.com/v1";

/**
 * All Lemon Squeezy credentials live in env vars — never in code, never in the
 * client bundle (this module is server-only by usage; nothing imports it from
 * a client component).
 */
function variantIdForPlan(plan: Plan): string | undefined {
  return plan === "one_year"
    ? process.env.LEMON_SQUEEZY_ONE_YEAR_VARIANT_ID
    : process.env.LEMON_SQUEEZY_TWO_YEAR_VARIANT_ID;
}

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMON_SQUEEZY_API_KEY &&
      process.env.LEMON_SQUEEZY_STORE_ID &&
      variantIdForPlan("one_year") &&
      variantIdForPlan("two_year")
  );
}

/** Human-readable prices for the pricing page — env-configurable, never hard-coded. */
export function getPlanPrices(): { oneYear: number; twoYear: number } {
  // Tolerates "$29", "29.00", "29 USD", etc. — falls back to sensible defaults.
  const parse = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  return {
    oneYear: parse(process.env.NEXT_PUBLIC_ONE_YEAR_PRICE, 29),
    twoYear: parse(process.env.NEXT_PUBLIC_TWO_YEAR_PRICE, 49),
  };
}

export interface CheckoutResult {
  url: string;
}

/**
 * Create a Lemon Squeezy checkout for a plan. The variant id is resolved
 * server-side from env — the browser never submits variant ids or prices.
 * The authenticated user id rides along as custom_data so the webhook can
 * attribute the order without trusting anything from the browser.
 */
export async function createCheckout(params: {
  plan: Plan;
  userId: string;
  email: string;
}): Promise<CheckoutResult> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY!;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;
  const variantId = variantIdForPlan(params.plan);
  if (!apiKey || !storeId || !variantId) {
    throw new Error("NOT_CONFIGURED");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const testMode = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_MODE === "test";

  const response = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: null, // use the variant's configured price
          test_mode: testMode,
          checkout_options: {
            embed: false,
            dark: false,
          },
          checkout_data: {
            email: params.email,
            custom: { user_id: params.userId },
          },
          product_options: {
            redirect_url: `${appUrl}/checkout/success`,
            receipt_button_text: "Open your planner",
            receipt_thank_you_note:
              "Your prepaid access is activated automatically — no account action needed.",
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Checkout creation failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const json = await response.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("Checkout response contained no URL");
  return { url };
}

/**
 * Verify the X-Signature header against the HMAC-SHA256 digest of the raw
 * request body. Timing-safe compare. Returns false on any mismatch.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface LemonWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string } | null;
  };
  data: {
    id: string;
    attributes: {
      user_email?: string;
      status?: string;
      total?: number; // cents
      currency?: string;
      first_order_item?: { variant_id?: number; product_id?: number; price?: number };
    };
  };
}

function planForVariant(variantId: number | undefined): Plan | null {
  if (variantId && String(variantId) === process.env.LEMON_SQUEEZY_ONE_YEAR_VARIANT_ID) {
    return "one_year";
  }
  if (variantId && String(variantId) === process.env.LEMON_SQUEEZY_TWO_YEAR_VARIANT_ID) {
    return "two_year";
  }
  return null;
}

async function resolveUserId(payload: LemonWebhookPayload): Promise<string | null> {
  // custom_data.user_id was set server-side at checkout creation — preferred.
  const customId = payload.meta.custom_data?.user_id;
  if (customId) {
    const user = await User.findById(customId).select("_id").lean();
    if (user) return String(user._id);
  }
  // Fallback: match the email the order was placed with.
  const email = payload.data.attributes.user_email?.toLowerCase().trim();
  if (email) {
    const user = await User.findOne({ email }).select("_id").lean();
    if (user) return String(user._id);
  }
  return null;
}

/**
 * Handle a signature-verified webhook event. Returns a summary string for
 * logging; throws only on unexpected errors (the route returns 500 then —
 * Lemon Squeezy retries, and processing is idempotent).
 */
export async function processWebhookEvent(payload: LemonWebhookPayload): Promise<string> {
  const eventName = payload.meta?.event_name;
  const orderId = payload.data?.id;
  if (!orderId) throw new Error("Webhook event missing order id");

  if (eventName === "order_refunded") {
    const refunded = await refundPurchase(orderId);
    return refunded ? `order ${orderId} refunded` : `order ${orderId} refund ignored (not active)`;
  }

  if (eventName !== "order_created") {
    return `event ${eventName} ignored`;
  }

  const attrs = payload.data.attributes;
  if (attrs.status && attrs.status !== "paid") {
    return `order ${orderId} not paid (status: ${attrs.status}) — ignored`;
  }

  const plan = planForVariant(attrs.first_order_item?.variant_id);
  if (!plan) {
    throw new Error(`Order ${orderId} references an unknown variant id`);
  }

  await connectDB();
  const userId = await resolveUserId(payload);
  if (!userId) {
    // 200 + log: no user to attribute — retrying won't help.
    return `order ${orderId} matched no user — ignored`;
  }

  const result = await applyPurchase(userId, {
    plan,
    providerOrderId: orderId,
    providerSubscriptionId: null,
    providerProductId: attrs.first_order_item?.product_id
      ? String(attrs.first_order_item.product_id)
      : null,
    providerVariantId: attrs.first_order_item?.variant_id
      ? String(attrs.first_order_item.variant_id)
      : null,
    amount: (attrs.total ?? 0) / 100, // cents → major units
    currency: attrs.currency ?? "USD",
    email: attrs.user_email ?? "",
    purchasedAt: new Date(),
  });

  if (!result) return `order ${orderId}: user ${userId} not found — ignored`;
  return result.created
    ? `order ${orderId} applied: user ${userId} active until ${result.expiresAt.toISOString()}`
    : `order ${orderId} already processed — duplicate ignored`;
}
