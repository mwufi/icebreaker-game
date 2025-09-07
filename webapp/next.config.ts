import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide Next.js dev overlay popup
  devIndicators: false,
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
