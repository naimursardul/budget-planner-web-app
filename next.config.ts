import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MongoDB + bcryptjs must run server-side only; keep them out of client bundles.
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
