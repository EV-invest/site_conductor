import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { PublicationsView } from "@/views/publications";
import {
  localizedMetadata,
  type LocaleParams,
} from "@/shared/seo/localized-metadata";

const hubMetadata = localizedMetadata("publications", "/publications");

export async function generateMetadata(props: LocaleParams) {
  const base = await hubMetadata(props);

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
