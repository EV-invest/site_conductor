import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import { pageMetadata } from "@/shared/seo/page-metadata";
import type en from "@/messages/en/common.json";

// Every static page under app/[locale] wants the same five steps: resolve the
// route's locale, build a translator, and hand pageMetadata a title and
// description from `meta.<namespace>.*` plus a locale-free path. Only the
// namespace and the path differ, so they live here as arguments rather than as
// five copies that drift apart — which is the real risk, not the line count: a
// page whose title says one thing and whose canonical points somewhere else is
// invisible until a crawler tells you.
//
// Routes that need request data to build their metadata (the [slug] pages fetch
// a record and branch on 404) are deliberately NOT expressed here — they share
// the shape but not the logic, and folding them in would mean a helper with a
// switch in it.

/// Namespaces the English catalogue actually defines BOTH halves of. Derived
/// rather than hand-listed so a typo is a build error instead of a raw
/// `meta.teem.title` shipped into a <title> — the one failure copy-paste made
/// easy and nothing here caught.
export type MetaNamespace = {
  [K in keyof typeof en]: K extends `meta.${infer N}.title`
    ? `meta.${N}.description` extends keyof typeof en
      ? N
      : never
    : never;
}[keyof typeof en];

/// The metadata itself, for pages that need to extend the result (e.g.
/// /publications spreads an RSS `alternates.types` onto it).
///
/// `locale` is passed through raw, exactly as pageMetadata expects: it does its
/// own fallback, and handing it the resolved value would be a second, silent
/// place for the fallback rule to live.
export function metadataFor(locale: string, ns: MetaNamespace, path: string) {
  // Titles and descriptions are what a reader sees in the browser tab and in a
  // shared link — the one place the page's language shows before its body does.
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translator(messagesFor(resolved), resolved);
  return pageMetadata({
    title: t(`meta.${ns}.title`),
    description: t(`meta.${ns}.description`),
    path,
    locale,
  });
}

/// Ready to re-export from a route: `export const generateMetadata =
/// localeMetadata("team", "/team")`.
///
/// A factory rather than a plain function so the route's `params` signature —
/// pure Next.js ceremony, identical on every page — stays here too instead of
/// being retyped five times.
export function localeMetadata(ns: MetaNamespace, path: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    return metadataFor(locale, ns, path);
  };
}
