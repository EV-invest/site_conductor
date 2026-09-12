import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale, localePath } from "@evinvest/i18n";
import { metadata as baseMetadata } from "@/application/metadata";
import { translate } from "@/shared/config/i18n";
import { SITE } from "@/shared/config/site";
import { alternateLocales, hreflangAlternates } from "@/shared/seo/hreflang";
import { ogLocaleFields } from "@/shared/seo/page-metadata";
import { HomeView } from "@/views/home";

// The homepage can't go through `pageMetadata` (shared/seo/page-metadata.ts):
// its title is the root `title.default` shape ("EV Investment: <tagline>"), not
// a page title the `%s | EV Investment` template appends to. That is also why
// `title`/`description` used to be left out entirely and left to fall through to
// `application/metadata.ts`'s root `title.default` / `description` — which are
// SITE.tagline/SITE.description, English constants, so /ru, /vi, /fr and /de
// rendered a localised <h1> under an English <title> and meta description. Fixed
// by translating `meta.home.tagline`/`meta.home.description` here, the same way
// every other page's title comes from `meta.<ns>.title`.
//
// `title: { absolute }` (not a plain string) because a plain string is treated
// as filling `title.template`'s `%s` — it would come out
// "<tagline> | EV Investment", double-stamping the brand that's already the
// first half of the tagline string. `absolute` bypasses the template.
//
// Self-referencing canonical collapses UTM / analytics query-string duplicates
// (PostHog/Umami params) onto the clean URL. Resolved against metadataBase.
// Declared here rather than in the root metadata so it can't cascade into
// noindexed routes or the 404. Per locale: `/ru` points at itself, not at `/`,
// or the Russian homepage deindexes itself into the English one.
//
// The openGraph and twitter blocks are built in full rather than inherited,
// because Next replaces both wholesale and does not merge them field-by-field:
// inheriting gave every localised homepage `og:url=/`, `og:locale=en_US` and the
// English title/description — the English homepage's identity on all five.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const url = localePath(resolved, "/");
  const languages = hreflangAlternates("/");
  const t = translate(resolved);
  const tagline = t("meta.home.tagline", "Invest in China+1 narrative");
  const description = t(
    "meta.home.description",
    "Through Vietnam, with Quy-Nhon based fund, - we have direct pulse on Real Estate and tourist flows. Follow the money."
  );
  const title = `${SITE.name}: ${tagline}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url,
      // The OG art itself stays the one English render scripts/build-og.tsx
      // produces (a per-locale image is a build-pipeline change, not a metadata
      // one) — only its alt text, which is read aloud and by crawlers, is worth
      // localising here.
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: `${tagline}. ${description}`,
        },
      ],
      ...ogLocaleFields(resolved, alternateLocales()),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image.png"],
      ...(SITE.twitterHandle
        ? { site: SITE.twitterHandle, creator: SITE.twitterHandle }
        : {}),
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
