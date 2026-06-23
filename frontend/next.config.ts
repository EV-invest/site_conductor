import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enables the `forbidden()` / `unauthorized()` interrupts and their
  // `forbidden.tsx` / `unauthorized.tsx` file conventions (still experimental).
  experimental: {
    authInterrupts: true,
  },
};

// Build-time Sentry integration (source-map upload + server instrumentation
// injection). This is the one Sentry seam that stays on `@sentry/nextjs`
// directly rather than `@evinvest/error-monitoring/next`'s `withSentry`: Next
// transpiles `next.config.ts` to CommonJS to load it, and the package is
// ESM-only (its `./next` export has no `require` condition), so a static import
// of it from the config can't resolve. `withSentry` is a 1:1 passthrough to
// `withSentryConfig`, so behaviour is identical. App/runtime code
// (`instrumentation.ts`, the providers) uses the package as ESM.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    // Delete local source maps after upload so they don't ship in the bundle.
    filesToDeleteAfterUpload: [".next/**/*.map"],
  },
});
