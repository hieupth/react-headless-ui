import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disable static export for now
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
