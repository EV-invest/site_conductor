import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale, localePath } from "@evinvest/i18n";
import { metadata as baseMetadata } from "@/application/metadata";
import { alternateLocales, hreflangAlternates } from "@/shared/seo/hreflang";
import { ogLocaleFields } from "@/shared/seo/page-metadata";
import { HomeView } from "@/views/home";

// The homepage does its own metadata instead of calling pageMetadata: its title
// is the root `title.default` ("EV Investment: <tagline>"), not a page title the
// `%s | EV Investment` template appends to. Everything else it needs — canonical,
// hreflang, og:locale — is built from the same helpers, so the two cannot drift.
//
// Self-referencing canonical collapses UTM / analytics query-string duplicates
// (PostHog/Umami params) onto the clean URL. Resolved against metadataBase.
// Declared here rather than in the root metadata so it can't cascade into
// noindexed routes or the 404. Per locale: `/ru` points at itself, not at `/`,
// or the Russian homepage deindexes itself into the English one.
//
// The openGraph block is spread from the root rather than inherited, because
// Next replaces `openGraph` wholesale and does not merge it: inheriting gave
// every localised homepage `og:url=/` and `og:locale=en_US` — the English
// homepage's identity on all five.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const url = localePath(resolved, "/");
  const languages = hreflangAlternates("/");
  return {
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      ...baseMetadata.openGraph,
      url,
      ...ogLocaleFields(resolved, alternateLocales()),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomeView locale={isLocale(locale) ? locale : DEFAULT_LOCALE} />;
}
