import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

/**
 * GET /logout — drop the session cookie and return to the login page.
 *
 * Normal sign-out goes through `logoutAction`. This route exists for the case
 * where the cookie holds a valid JWT for a user that no longer exists (account
 * deleted, or the database reseeded): `requireUser()` sends those visitors here
 * so the stale cookie is cleared instead of ping-ponging between /login and the
 * page they asked for.
 */
export async function GET(request: Request) {
  const target = new URL("/login?signedOut=1", request.url);

  try {
    await signOut({ redirect: false });
  } catch {
    // Fall through — the explicit cookie deletion below is the real guarantee.
  }

  const response = NextResponse.redirect(target);
  // Belt and braces: never leave the visitor holding the cookie that sent them
  // here, whichever name this deployment uses (http vs https).
  for (const name of [
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ]) {
    response.cookies.delete(name);
  }
  return response;
}
