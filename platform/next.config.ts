import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Separate build folders let the e2e suite run a test-env and a prod-env build side by side.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
