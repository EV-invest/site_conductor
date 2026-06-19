import { createAbMiddleware } from "@evinvest/experiments/next";
import { experiments } from "@/shared/config/experiments";

// Next 16: this file MUST be named `proxy.ts` with a named `proxy` export
// (renamed from `middleware`). Runtime is nodejs (edge unsupported) — fine,
// since `Math.random` bucketing and cookie writes need no edge APIs.
//
// `createAbMiddleware` assigns a sticky weighted `ab_<key>` cookie per
// experiment on first visit, writing it to BOTH the forwarded request (so this
// same render's `cookies()` reads it — no first-paint bias) and the response
// (so the browser persists it for 30 days).
export const proxy = createAbMiddleware(experiments);

// `apps` is excluded alongside `api`: page microfrontends (`/apps/*`) are remote
// app surfaces with no landing experiments, so there is nothing to bucket there.
export const config = {
  // Exclude the SEO/metadata file-convention routes (robots, sitemap, manifest,
  // icons, OG/Twitter images, .well-known, llms.txt): the A/B middleware would
  // otherwise dynamize them and write ab_* cookies onto static assets — Next's
  // docs explicitly warn metadata routes break when caught by the matcher.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|robots.txt|sitemap.xml|llms.txt|\\.well-known).*)",
  ],
};
