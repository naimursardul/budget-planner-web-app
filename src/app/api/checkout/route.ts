import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createCheckout, isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";

const bodySchema = z.object({
  plan: z.enum(["one_year", "two_year"]),
});

export async function POST(request: Request) {
  // Identity always comes from the verified session — never the request body.
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to purchase." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  await connectDB();
  const user = await User.findById(userId).select("email").lean();
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 401 });
  }

  try {
    const checkout = await createCheckout({
      plan: parsed.data.plan,
      userId,
      email: user.email,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[checkout] creation failed:", error);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again in a moment." },
      { status: 502 }
    );
  }
}
