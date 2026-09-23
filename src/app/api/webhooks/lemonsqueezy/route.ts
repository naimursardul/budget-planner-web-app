import { NextResponse } from "next/server";
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/lemonsqueezy";

/**
 * Lemon Squeezy webhook. The raw body is read as text (never parsed first) so
 * the HMAC-SHA256 signature is computed over the exact bytes that were sent.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Missing secret, missing header, or tampered payload — reject hard.
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const summary = await processWebhookEvent(payload as Parameters<typeof processWebhookEvent>[0]);
    console.log(`[lemonsqueezy] ${summary}`);
    // 200 only after the event is fully processed (or deliberately ignored).
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[lemonsqueezy] processing failed:", error);
    // 500 → Lemon Squeezy retries; processing is idempotent on providerOrderId.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
