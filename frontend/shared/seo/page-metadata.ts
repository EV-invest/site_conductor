import type { Metadata } from "next";
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

export type PageMetadataInput = {
  /// Page title WITHOUT the site name — the root `title.template` appends it.
  title: string;
  description: string;
  /// Root-relative, no trailing slash (e.g. "/publications/vietnam_coastal_2026").
  path: string;
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
  image = DEFAULT_IMAGE,
  type = "website",
  article,
}: PageMetadataInput): Metadata {
  // The template only applies to the document <title>; og:title is a plain
  // string, so mirror the resolved form by hand or social cards lose the brand.
  const resolvedTitle = `${title} | ${SITE.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE.name,
      title: resolvedTitle,
      description,
      url: path,
      locale: "en_US",
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
