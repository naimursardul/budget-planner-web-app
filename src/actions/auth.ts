"use server";

import { AuthError } from "next-auth";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { ensureDefaultCategories } from "@/services/categories";
import { trialEndDate } from "@/services/access";
import { isMailConfigured, sendPasswordResetEmail } from "@/lib/mailer";

export interface AuthActionState {
  error?: string;
  /** Non-error outcomes the form renders differently. */
  notice?: "sent" | "unconfigured" | "reset";
}

/** Reset links live for one hour. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Only same-site relative paths are allowed as a post-login destination.
 * Anything else (absolute URLs, protocol-relative "//evil.com") falls back to
 * the dashboard — an attacker can't turn our login form into an open redirect.
 */
function safeRedirect(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  return target;
}

/** The database stores this, never the token itself. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  try {
    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return {
        error:
          "An account with this email already exists. Try signing in instead.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      activeUntil: trialEndDate(),
      accessStatus: "trialing",
    });
    await ensureDefaultCategories(user._id.toString());
  } catch (error) {
    console.log(error);
    return {
      error: "We couldn't create your account right now. Please try again.",
    };
  }

  // Sign the new user in — errors here are sign-in failures, not validation
  try {
    await signIn("credentials", { email, password, redirectTo: "/onboarding" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Account created, but we couldn't sign you in. Please sign in manually.",
      };
    }
    throw error; // re-throw redirect
  }
  return {};
}

export async function loginAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw redirect
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * Sends a reset link. The response is deliberately identical whether or not
 * the address is registered, so this form can't be used to discover who has an
 * account. When email isn't configured we say exactly that instead of claiming
 * a message is on its way.
 */
export async function forgotPasswordAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!isMailConfigured()) {
    return { notice: "unconfigured" };
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    if (user) {
      const token = randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

      const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendPasswordResetEmail(
        user.email,
        new URL(`/reset-password?token=${token}`, base).toString(),
      );
    }
  } catch (error) {
    // Logged for us, invisible to the visitor — a failure here must not reveal
    // whether the address exists.
    console.error("[forgotPassword]", error);
  }

  return { notice: "sent" };
}

/** Redeems a reset link: single use, one hour, and it re-checks both here. */
export async function resetPasswordAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await connectDB();
    const record = await PasswordResetToken.findOne({
      tokenHash: hashToken(parsed.data.token),
    });

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      return {
        error: "This reset link has expired or was already used. Request a new one.",
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await User.updateOne({ _id: record.userId }, { $set: { passwordHash } });

    record.usedAt = new Date();
    await record.save();
    // Any other outstanding link for this account stops working too.
    await PasswordResetToken.deleteMany({ userId: record.userId, usedAt: null });
  } catch (error) {
    console.error("[resetPassword]", error);
    return { error: "We couldn't reset your password right now. Please try again." };
  }

  return { notice: "reset" };
}
