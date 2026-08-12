import { PublicationsView } from "@/views/publications";
import { pageMetadata } from "@/shared/seo/page-metadata";

const base = pageMetadata({
  title: "Field Notes & Research",
  description:
    "EV Investment publications — field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate.",
  path: "/publications",
});

// `types` adds <link rel="alternate" type="application/rss+xml">, which is how
// newsreaders and aggregators discover the feed from the hub page. Spread onto
// the helper's `alternates` so the self-canonical it sets is preserved.
export const metadata = {
  ...base,
  alternates: {
    ...base.alternates,
    types: { "application/rss+xml": "/publications/feed.xml" },
  },
};

export default function Page() {
  return <PublicationsView />;
}
