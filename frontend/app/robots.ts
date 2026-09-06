import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@evinvest/i18n";
import { SITE } from "@/shared/config/site";

// Static route — reads only build-time env, so it stays statically generated
// (and cached) even though the page is dynamic via the layout's await cookies().
export const dynamic = "force-static";

// AI answer/citation + training crawlers the brand explicitly WANTS (owner chose
// "allow all" for maximum visibility in ChatGPT / Perplexity / Gemini answers).
// Listing them by name documents intent and is robust to default-policy changes;
// to block training later, move the trainers to a `disallow: "/"` group.
const AI_CRAWLERS = [
  // OpenAI: live search, user-initiated fetch, training
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Google (Gemini / Vertex) + Apple AI
  "Google-Extended",
  "Applebot-Extended",
  // Common Crawl (feeds many models) + Amazon
  "CCBot",
  "Amazonbot",
];

// The cabinet zone mounts at `/cabinet` (English, unprefixed) AND
// `/{locale}/cabinet` for every other locale (PATTERNS.md §9) — both are real
// route trees, not redirects, so both need the disallow. A crawler restricted
// by robots.txt never fetches the page at all, which `X-Robots-Tag` (the
// header the cabinet proxy route now sets — see shared/zone-proxy.ts) cannot do
// on its own; the two are complementary, same as the raw-document carve-out in
// next.config.ts's headers().
const CABINET_PATHS = LOCALES.map(locale => localePath(locale, "/cabinet"));

// Repeated into every group rather than written once, because robots.txt has no
// inheritance: a crawler obeys the ONE group that names it and ignores the `*`
// group entirely. So the named AI groups below, carrying `allow: "/"` and
// nothing else, were exempt from the `*` group's `/api/` disallow — and would
// have been exempt from the cabinet's too. "Allowed everywhere the default
// crawler is" is what those groups mean; it is not "allowed more than it".
const DISALLOW = ["/api/", ...CABINET_PATHS];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
