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
  config.public.buildVersion ?? git("git describe --tags --always", "unknown");
// Full SHA the footer link resolves to, kept separate from the display version.
const buildCommit = config.public.buildCommit || git("git rev-parse HEAD", "");

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
  // Next's automatic 308 strips trailing slashes, but the Dioxus zone's router
  // strips its base_path from the pathname — `/rea/` → `/` matches, `/rea` → ""
  // never can. So no automatic stripping; the /rea route handler canonicalises
  // the bare prefix INTO the slash (a redirects() source would match both
  // shapes and loop). Conductor's own routes match either shape.
  skipTrailingSlashRedirect: true,
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
      // AppShell assets are content-hashed by scripts/build-shell.mts — one
      // fetch, then cached across conductor pages and every zone.
      {
        source: "/shell/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Multi-zone mounts (PATTERNS.md §9): asset/API traffic goes straight to the
  // zone over native rewrites; zone *HTML* goes through the shell-injecting
  // proxy route handlers (app/cabinet/…, app/rea/…) instead, which is
  // why these must be beforeFiles — a bare array is afterFiles, which would
  // shadow the catch-all handlers. Env unset ⇒ no rewrites and the handler
  // 404s, a deliberate "zone disabled" state.
  async rewrites() {
    const beforeFiles = [];
    const cabinet = config.cabinetZoneUrl?.replace(/\/+$/, "");
    if (cabinet) {
      beforeFiles.push(
        {
          source: "/cabinet/_next/:path*",
          destination: `${cabinet}/cabinet/_next/:path*`,
        },
        {
          source: "/cabinet/api/:path*",
          destination: `${cabinet}/cabinet/api/:path*`,
        },
        {
          source: "/cabinet/mfe/:path*",
          destination: `${cabinet}/cabinet/mfe/:path*`,
        }
      );
    }
    const rea = config.reaZoneUrl?.replace(/\/+$/, "");
    if (rea) {
      beforeFiles.push(
        {
          source: "/rea/assets/:path*",
          destination: `${rea}/rea/assets/:path*`,
        },
        {
          source: "/rea/api/:path*",
          destination: `${rea}/rea/api/:path*`,
        }
      );
    }
    // Auth is shell-owned but concierge-implemented: login/callback/session live
    // on THIS origin (cookies land first-party for every zone) and rewrite to the
    // concierge plane's auth web surface. Zones never run OAuth — they link to
    // /api/auth/login and verify the shared access-JWT cookie.
    const auth = config.authWebUrl?.replace(/\/+$/, "");
    if (auth) {
      beforeFiles.push(
        { source: "/api/auth/:path*", destination: `${auth}/auth/:path*` },
        {
          source: "/api/callback/auth/:path*",
          destination: `${auth}/callback/auth/:path*`,
        }
      );
    }
    return { beforeFiles, afterFiles: [], fallback: [] };
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
