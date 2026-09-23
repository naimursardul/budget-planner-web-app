import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the auth config.
 *
 * The middleware runs on the Edge runtime, where mongoose and bcrypt cannot
 * load — so the Credentials provider (which needs both) stays in lib/auth.ts
 * and only this JWT-shaped config is shared with the middleware.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
