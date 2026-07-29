import type { NextConfig } from "next";

// The build script pins `next build --webpack` (legacy webpack) rather than
// Next 16's default Turbopack. This static-export docs/showcase site relies on
// the MDX + RSC (`next-mdx-remote/rsc`) static-render path, which is exercised
// and stable on webpack; the Turbopack static-export path is newer and the
// `--webpack` fallback is slated for removal in a future Next 16.x minor. When
// that removal lands, switch to Turbopack (drop `--webpack`) after confirming
// the MDX/RSC export still pre-renders every page.
// basePath targets the deploy URL. An explicit BASE_PATH wins (so a second
// deploy target, e.g. a custom domain, can set `BASE_PATH=` to disable it).
// Otherwise use the GitHub Pages production URL
// (<user>.github.io/react-headless-ui) only when building inside GitHub
// Actions, and '' in every other environment (local builds, other CI, custom
// hosts) so the export serves from any root.
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
