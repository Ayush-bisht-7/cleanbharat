import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for sqlite3 native module in server-side code
  serverExternalPackages: ["sqlite3", "bcryptjs"],
  // Silence the turbopack/webpack co-existence warning
  turbopack: {},
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
