import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/** Everything behind the login wall. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/budget",
  "/bills",
  "/calendar",
  "/savings",
  "/debt",
  "/reports",
  "/settings",
  "/onboarding",
];

/** Pages a signed-in user has no reason to see. */
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

/**
 * Redirect-only guard. This is a convenience layer for fast redirects — the
 * authoritative checks are `requireUser()` / `requireOnboardedUser()` inside
 * every server page and action, which read the verified session and scope all
 * queries by userId. Middleware alone is never trusted for authorization.
 */
export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user?.id);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !signedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (signedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budget/:path*",
    "/bills/:path*",
    "/calendar/:path*",
    "/savings/:path*",
    "/debt/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
