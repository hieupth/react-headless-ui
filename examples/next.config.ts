import type { NextConfig } from "next";

// basePath targets the deploy URL. An explicit BASE_PATH wins; otherwise use
// the GitHub Pages URL only when building inside GitHub Actions, and '' in
// every other environment (local builds, other CI, custom hosts).
const basePath =
  process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : process.env.GITHUB_ACTIONS === 'true'
      ? '/react-headless-ui'
      : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
};

export default nextConfig;
