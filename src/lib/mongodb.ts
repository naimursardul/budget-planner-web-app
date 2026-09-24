import "server-only";
import mongoose from "mongoose";
import dns from "node:dns/promises";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

/**
 * Read at connect time, not at import time. A module-level `const` + throw
 * looks equivalent, but TypeScript discards that narrowing inside the
 * `connectDB` closure — and reading it lazily also means importing this module
 * during `next build` can't hard-fail when the variable isn't in the build
 * environment.
 */
function mongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB Atlas connection string.",
    );
  }
  return uri;
}

/**
 * Cached connection — survives hot reloads in dev and reuses a single
 * connection pool per serverless instance in production.
 */
const cached =
  global.mongooseCache ??
  (global.mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri(), {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Mongoose casts `find` / `findOne` / `updateOne` filters against the schema,
 * but **aggregation pipelines are passed through raw** — a `$match` on a
 * string `userId` silently matches zero documents against an ObjectId field.
 * Always wrap the id with this in an aggregation.
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}
