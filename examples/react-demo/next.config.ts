import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    forceSwcTransforms: false,
  },
  allowedDevOrigins: ['192.168.1.37', 'localhost:3000']
};

export default nextConfig;
