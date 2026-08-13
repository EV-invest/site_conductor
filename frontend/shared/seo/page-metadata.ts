import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  isLocale,
  localePath,
  type Locale,
} from "@evinvest/i18n";
import { SITE } from "@/shared/config/site";

// Why every page must call this instead of setting `title` + `description`
// alone: Next.js does NOT merge `openGraph` field-by-field. A page that omits
// the key inherits the root block *whole* — so /team used to ship the
// homepage's og:title, og:description AND og:url, telling every social crawler
// that the team page is the homepage. Same rule for `twitter`. Declaring both
// blocks per page is the only fix, and doing it through one helper keeps them
// from drifting out of step with the title/description they mirror.
//
// The OG image defaults to the site card built by scripts/build-og.tsx; pages
// with their own art (a publication's cover) pass `image`.

export type PageImage = { url: string; alt: string };

const DEFAULT_IMAGE: PageImage = {
  url: "/opengraph-image.png",
  alt: `${SITE.tagline}. ${SITE.description}`,
};

// og:locale takes language_TERRITORY, unlike hreflang's bare language code.
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  vi: "vi_VN",
  fr: "fr_FR",
  de: "de_DE",
};

export type PageMetadataInput = {
  /// Page title WITHOUT the site name — the root `title.template` appends it.
  title: string;
  description: string;
  /// Locale-FREE, root-relative, no trailing slash (e.g. "/publications/x").
  /// The locale prefix is applied for you — never pass "/ru/team".
  path: string;
  /// The rendering locale, straight from the route's `params`. Determines the
  /// canonical and og:url: `en` is unprefixed, every other locale is `/xx/…`.
  ///
  /// Omitting it (or passing an unrecognised string) falls back to the default
  /// locale, which is right for the routes that live outside app/[locale].
  locale?: string;
  /// Defaults to the site OG card. Pass a publication cover to give an article
  /// its own preview.
  image?: PageImage;
  /// "article" unlocks the published-time / author / section OG fields below.
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    authors?: string[];
    section?: string;
  };
};

export function pageMetadata({
  title,
  description,
  path,
  locale,
  image = DEFAULT_IMAGE,
  type = "website",
  article,
}: PageMetadataInput): Metadata {
  // The template only applies to the document <title>; og:title is a plain
  // string, so mirror the resolved form by hand or social cards lose the brand.
  const resolvedTitle = `${title} | ${SITE.name}`;

  // Self-referencing per locale. A locale-blind canonical is a trap rather than
  // a live bug today — only `en` is in INDEXED_LOCALES, and the other four are
  // noindexed by app/[locale]/layout.tsx, so nothing they claim is read. But
  // shared/config/i18n promises that adding a locale to INDEXED_LOCALES is the
  // ONE change needed to launch it, and a canonical pointing at the English URL
  // would make that locale deindex itself the moment it went live — silently.
  const resolved: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const url = localePath(resolved, path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE.name,
      title: resolvedTitle,
      description,
      url,
      // og:locale wants the underscored territory form ("en_US", "de_DE"), not
      // the bare hreflang code. Only en has a territory we actually publish
      // from, so the rest map to the language with its conventional region.
      locale: OG_LOCALES[resolved],
      images: [
        {
          url: image.url,
          // Only the generated site card is guaranteed 1200×630; a publication
          // cover is whatever the blog flake produced, so declaring dimensions
          // for it would be a guess. Omitted ⇒ crawlers measure it themselves.
          ...(image.url === DEFAULT_IMAGE.url
            ? { width: 1200, height: 630 }
            : {}),
          alt: image.alt,
        },
      ],
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            authors: article.authors,
            section: article.section,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [image.url],
      ...(SITE.twitterHandle
        ? { site: SITE.twitterHandle, creator: SITE.twitterHandle }
        : {}),
    },
  };
}
