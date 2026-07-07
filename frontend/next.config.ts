import { execSync } from "node:child_process";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { config } from "./config";

// The Nix/CI build injects NEXT_PUBLIC_BUILD_VERSION (the release tag). A bare
// `npm run dev` has no such env, so fall back to git so the footer still shows a
// version; "unknown" only when git is absent too (e.g. the hermetic sandbox,
// where the env var is always set anyway).
const git = (cmd: string, fallback: string) => {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
};

const buildVersion =
  config.public.buildVersion ??
  git("git describe --tags --always", "unknown");
// Full SHA the footer link resolves to, kept separate from the display version.
const buildCommit =
  config.public.buildCommit || git("git rev-parse HEAD", "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
    NEXT_PUBLIC_BUILD_COMMIT: buildCommit,
  },
  reactStrictMode: true,
  // Dev-only: Next 16 blocks its dev resources (incl. the HMR socket) for any
  // origin but `localhost`, and a dead HMR socket means the client runtime
  // never boots — pages hydrate on localhost but are inert on 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  // Self-contained production server (.next/standalone) so the weak VPS runs
  // `node server.js` without an `npm install` — we can't build there.
  output: "standalone",
  // Enables the `forbidden()` / `unauthorized()` interrupts and their
  // `forbidden.tsx` / `unauthorized.tsx` file conventions (still experimental).
  experimental: {
    authInterrupts: true,
  },
  // The raw flake-built documents in public/ (whitepaper.*.html, blogs/*.html,
  // *.pdf) duplicate the branded /whitepaper and /blogs/[slug] routes that
  // compose them (shared/mfe RemoteDocument). Keep them fetchable — the routes
  // read/mount them — but out of the index as standalone URLs. Do NOT
  // robots.txt-Disallow instead: a noindex header only works on crawlable URLs.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
    return [
      { source: "/whitepaper.:variant(dark|light).html", headers: noindex },
      { source: "/blogs/:slug.:variant(dark|light).html", headers: noindex },
      { source: "/whitepaper.pdf", headers: noindex },
      { source: "/blogs/:slug.pdf", headers: noindex },
    ];
  },
  // Multi-zone mount: the cabinet is its own Next.js deployment (basePath
  // "/cabinet", so pages AND its /_next assets all live under the one prefix);
  // the conductor proxies that whole path space to it. Unset ⇒ no rewrites, so
  // /cabinet 404s instead of half-proxying (the header CTA only points here
  // when NEXT_PUBLIC_CABINET_PATH is set alongside). See PATTERNS.md §9.
  async rewrites() {
    const cabinet = config.cabinetZoneUrl?.replace(/\/+$/, "");
    if (!cabinet) return [];
    return [
      { source: "/cabinet", destination: `${cabinet}/cabinet` },
      { source: "/cabinet/:path+", destination: `${cabinet}/cabinet/:path+` },
    ];
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
  org: config.sentryOrg,
  project: config.sentryProject,
  authToken: config.sentryAuthToken,
  silent: !config.isCi,
  widenClientFileUpload: true,
  sourcemaps: {
    // Delete local source maps after upload so they don't ship in the bundle.
    filesToDeleteAfterUpload: [".next/**/*.map"],
  },
});
