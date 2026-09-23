import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import { readAccessState, refreshAccessState, type AccessState } from "@/services/access";

export interface CurrentUser extends Pick<
  IUser,
  | "name"
  | "email"
  | "currency"
  | "dateFormat"
  | "theme"
  | "monthlyIncome"
  | "monthlySavingsGoal"
  | "onboardingCompleted"
  | "isDemo"
  | "notificationPrefs"
> {
  id: string;
  access: AccessState;
}

/**
 * Why three states instead of a nullable user: a signed-out visitor and a
 * visitor holding a still-valid JWT for a deleted user both have "no user",
 * but they need opposite treatment. Sending the second one to /login would
 * loop forever — the middleware sees the valid cookie and bounces them back.
 */
type SessionState =
  | { kind: "anonymous" }
  | { kind: "stale" }
  | { kind: "user"; user: CurrentUser };

/**
 * Server-side identity for every request. The user id comes from the
 * verified JWT session — a userId sent by the browser is never trusted.
 */
const loadSession = cache(async (): Promise<SessionState> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return { kind: "anonymous" };

  await connectDB();
  const user = await User.findById(id);
  if (!user) return { kind: "stale" };

  // Lapse expired access on read so the guard reflects reality
  if (user.activeUntil <= new Date() && user.accessStatus !== "expired") {
    const state = await refreshAccessState(id);
    if (state && !state.hasAccess) {
      user.accessStatus = "expired";
    }
  }

  return {
    kind: "user",
    user: {
      id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      dateFormat: user.dateFormat,
      theme: user.theme,
      monthlyIncome: user.monthlyIncome,
      monthlySavingsGoal: user.monthlySavingsGoal,
      onboardingCompleted: user.onboardingCompleted,
      isDemo: user.isDemo,
      notificationPrefs: user.notificationPrefs,
      access: readAccessState(user),
    },
  };
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const state = await loadSession();
  return state.kind === "user" ? state.user : null;
});

export async function requireUser(): Promise<CurrentUser> {
  const state = await loadSession();
  // Stale cookie → clear it first, otherwise /login bounces straight back here.
  if (state.kind === "stale") redirect("/logout");
  if (state.kind === "anonymous") redirect("/login");
  return state.user;
}

/** For (app) pages: must be logged in AND have completed onboarding. */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.onboardingCompleted) redirect("/onboarding");
  return user;
}
