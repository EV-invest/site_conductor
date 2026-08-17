import { messagesFor } from "@/shared/config/i18n";
import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { PublicationsView } from "@/views/publications";
import { pageMetadata } from "@/shared/seo/page-metadata";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Titles and descriptions are what a reader sees in the browser tab and in a
  // shared link — the one place the page's language shows before its body does.
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translator(messagesFor(resolved), resolved);
  const base = pageMetadata({
    title: t("meta.publications.title"),
    description: t("meta.publications.description"),
    path: "/publications",
    locale,
  });

  // `types` adds <link rel="alternate" type="application/rss+xml">, which is how
  // newsreaders and aggregators discover the feed from the hub page. Spread onto
  // the helper's `alternates` so the self-canonical it sets is preserved.
  //
  // One feed, not one per locale: the articles themselves are English, so a
  // per-locale feed would carry identical items under five URLs.
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": "/publications/feed.xml" },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <PublicationsView locale={isLocale(locale) ? locale : DEFAULT_LOCALE} />
  );
}
