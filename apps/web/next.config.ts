// apps/web/next.config.ts
import path from "path";
import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  experimental: {},
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  allowedDevOrigins: [
    "modulon.local",
    "*.modulon.local",
  ],
};

export default nextConfig;
