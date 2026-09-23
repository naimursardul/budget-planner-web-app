import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Auth.js v5 configuration.
 * Credentials (email + password) today; Google OAuth can be enabled later
 * by adding the provider here plus GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 * JWT sessions keep MongoDB off the session hot path.
 *
 * Shared, edge-safe settings live in lib/auth.config.ts so the middleware can
 * reuse them without pulling mongoose/bcrypt into the Edge runtime.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() }).select(
          "+passwordHash"
        );
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
    // Google provider — enable when credentials are configured:
    // Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
  ],
  // `callbacks` (jwt/session → session.user.id) come from authConfig above so
  // the middleware and the server runtime read identity exactly the same way.
});
