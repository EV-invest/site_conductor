import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale, localePath } from "@evinvest/i18n";
import { HomeView } from "@/views/home";

// Self-referencing canonical collapses UTM / analytics query-string duplicates
// (PostHog/Umami params) onto the clean URL. Resolved against metadataBase.
// Declared here rather than in the root metadata so it can't cascade into
// noindexed routes or the 404.
//
// Per locale, for the same reason as every other page: `/ru` must point at
// itself, not at `/`, or the Russian homepage deindexes itself the day ru joins
// INDEXED_LOCALES. See shared/seo/page-metadata.ts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return { alternates: { canonical: localePath(resolved, "/") } };
}

export default function Page() {
  return <HomeView />;
}
