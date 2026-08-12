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
  // The /rea zone is a Dioxus app under base_path "rea": its WebHistory strips
  // the "/rea" prefix, so `/rea/?q` → `/?q` (matches) but `/rea?q` → `?q` (route
  // parse fails). Next's default trailing-slash redirect turns `/rea/?q` into
  // `/rea?q`, breaking every deep link. Serve URLs as-is so the trailing slash
  // survives to the proxy — our own links never rely on the redirect.
  skipTrailingSlashRedirect: true,
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
  // /blogs and /whitepaper were separate shelves for the same thing: documents
  // the fund publishes. They are now one route, so the old paths keep working
  // forever as 308s — inbound links, the old sitemap and anything already
  // bookmarked must not break. 308 (not 307) so the method and the SEO signal
  // both transfer.
  async redirects() {
    return [
      { source: "/blogs", destination: "/publications", permanent: true },
      {
        source: "/blogs/:path*",
        destination: "/publications/:path*",
        permanent: true,
      },
      {
        source: "/whitepaper",
        destination: "/publications/whitepaper",
        permanent: true,
      },
      // Collapse the explicit /en/* form onto the unprefixed one so each page has
      // exactly one canonical URL. Cannot loop with the locale rewrite below:
      // this is external and matched against the incoming request, while the
      // rewrite is internal and never re-enters the redirect pipeline. Every
      // source here is itself /en-prefixed, so an unprefixed path never matches.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
  // The raw flake-built documents in public/ (whitepaper.*.html,
  // publications/*.html, *.pdf) duplicate the branded /publications routes that
  // compose them (shared/mfe RemoteDocument). Keep them fetchable — the routes
  // read/mount them — but out of the index as standalone URLs. Do NOT
  // robots.txt-Disallow instead: a noindex header only works on crawlable URLs.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
    return [
      { source: "/whitepaper.:variant(dark|light).html", headers: noindex },
      {
        source: "/publications/:slug.:variant(dark|light).html",
        headers: noindex,
      },
      { source: "/whitepaper.pdf", headers: noindex },
      { source: "/publications/:slug.pdf", headers: noindex },
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
      // Section art under public/assets is served raw (the hero paints
      // quynhon_future as a CSS background, outside the next/image pipeline),
      // and Next's default for public/ is max-age=0 — a revalidation round trip
      // on every repeat visit for the largest above-the-fold byte. These
      // filenames are not content-hashed, so no `immutable`: a day of freshness
      // plus a month of stale-while-revalidate serves instantly and still picks
      // a replacement up in the background.
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
      // Article covers and self-hosted footage. Unlike /assets these ARE
      // effectively immutable: a dispatch's media is written once by the blog
      // flake and a correction ships under a new slug, so a year is safe and
      // keeps the weak VPS out of the video path on repeat visits.
      {
        // `:file+`, not `:file*` — the star form makes the whole segment group
        // optional, so it also matched `/publications/<slug>` itself and pinned
        // every article page in caches for a year, immutably, defeating its
        // `dynamic = "force-dynamic"`.
        source: "/publications/:slug/:file+",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    // The VPS is weak and re-encoding is the expensive half of next/image.
    // Next's default TTL expires optimized variants within hours, so the same
    // team portraits get re-encoded all week; a month of on-disk cache means
    // each size is produced once.
    minimumCacheTTL: 2592000,
    // YouTube-backed dispatches fall back to YouTube's own thumbnail when the
    // article ships no local poster. Only the thumbnail host — the player is a
    // click-to-load iframe on youtube-nocookie.com, never an <Image>.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
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
    // Serves the default locale at unprefixed paths, so no indexed English URL
    // moves and the site still ships no proxy.ts.
    //
    // MUST be `fallback`, and this is the one thing that is easy to get wrong
    // because the broken version half-works. Next's order is:
    //   redirects → beforeFiles → filesystem → afterFiles → DYNAMIC ROUTES → fallback
    // `afterFiles` runs before dynamic routes, and the whole app/[locale] tree IS
    // a dynamic route — so an afterFiles rule fires before [locale] is ever
    // tried, rewriting /ru/team to /en/ru/team (404) while /team still resolves
    // and hides the bug. `fallback` runs last, after dynamic routes have had
    // their chance, which is the semantics actually wanted. Verified on 16.2.9 in
    // dev and a production build — see docs/i18n-routing-spike.md.
    //
    // Inlined rather than `localeRewrites()` from @evinvest/i18n/next — same
    // reason as the Sentry exception above: this file is loaded as CJS, and the
    // package is ESM-only, so requiring the subpath dies with
    // ERR_PACKAGE_PATH_NOT_EXPORTED. The helper is still the source of truth for
    // app-side code (localeStaticParams in app/[locale]/layout.tsx); only the
    // config boundary has to restate it.
    return {
      beforeFiles,
      afterFiles: [],
      fallback: [{ source: "/:path*", destination: "/en/:path*" }],
    };
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
