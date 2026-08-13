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
  const base = pageMetadata({
    title: "Field Notes & Research",
    description:
      "EV Investment publications — field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate.",
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

export default function Page() {
  return <PublicationsView />;
}
