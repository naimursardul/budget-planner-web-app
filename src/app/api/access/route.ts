import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

/** Lightweight access check used by the checkout success page to poll activation. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: user.access.status,
    hasAccess: user.access.hasAccess,
    activeUntil: user.access.activeUntil.toISOString(),
    currentPlan: user.access.currentPlan,
  });
}
