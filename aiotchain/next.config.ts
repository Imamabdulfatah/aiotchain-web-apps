import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Required by Next.js 16: tells Turbopack that the webpack config (added by
  // next-pwa plugin) is intentional and should be silenced.
  turbopack: {},
};

export default withPWA(nextConfig);
