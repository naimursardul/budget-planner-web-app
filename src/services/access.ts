import { User, type IUser } from "@/models/User";
import type { AccessStatus } from "@/types";

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14);

export interface AccessState {
  hasAccess: boolean;
  status: AccessStatus;
  currentPlan: IUser["currentPlan"];
  activeUntil: Date;
  isTrial: boolean;
}

/** Derive access state from the user record — never from the browser. */
export function readAccessState(user: IUser): AccessState {
  const now = new Date();
  const hasAccess = user.activeUntil > now;
  return {
    hasAccess,
    status: hasAccess ? user.accessStatus : "expired",
    currentPlan: user.currentPlan,
    activeUntil: user.activeUntil,
    isTrial: hasAccess && user.accessStatus === "trialing",
  };
}

/** Lapse any user whose prepaid window has ended. Data is never deleted. */
export async function refreshAccessState(userId: string): Promise<AccessState | null> {
  const user = await User.findById(userId);
  if (!user) return null;
  const state = readAccessState(user);
  if (!state.hasAccess && user.accessStatus !== "expired") {
    user.accessStatus = "expired";
    await user.save();
  }
  return state;
}

export function trialEndDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}
