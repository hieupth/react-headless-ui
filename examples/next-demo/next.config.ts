import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Next 16 removed the `eslint` next.config key — ESLint no longer runs
  // during `next build`. Type-checking is now enforced (the package ships
  // .d.ts again — type debt cleared, dts re-enabled in tsup).
};

export default nextConfig;
