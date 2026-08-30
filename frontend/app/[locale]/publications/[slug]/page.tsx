import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { coverStill, findPublication } from "@/entities/publication";
import { PublicationArticleView } from "@/views/publications";
import { pageMetadata } from "@/shared/seo/page-metadata";

// Reading the static doc off disk per request, so the latest flake-copied file
// is served (the page is cheap: one file read + inject).
export const dynamic = "force-dynamic";

// Only catalogued slugs resolve — anything else is a real 404 with an explicit
// noindex (the robots backstop keeps the page unindexable even if a future
// streaming boundary locks the status at 200), never a soft-404 (#105).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const publication = findPublication(slug, resolved);
  if (!publication) {
    const t = translator(messagesFor(resolved), resolved);
    return { title: t("meta.publication.notFound"), robots: { index: false } };
  }
  // og:type=article + the cover as the share image, so a dispatch posted to
  // LinkedIn or X carries its own art and dateline instead of the site card.
  return pageMetadata({
    title: publication.title,
    description: publication.dek,
    path: `/publications/${slug}`,
    locale,
    // The card is translated (title, dek); the *document* usually is not — it is
    // a compiled Typst report from the blog repo, and `locales` is its record of
    // where it exists. So the locales it does not cover canonicalise to the
    // English URL rather than advertising five language versions of one English
    // body — the duplicate-content trap shared/config/i18n.ts is guarding
    // against, and the one place indexing all five locales could have sprung it.
    contentLocales: publication.locales,
    image: coverStill(publication),
    type: "article",
    article: {
      publishedTime: publication.date,
      authors: publication.author ? [publication.author] : undefined,
      section: publication.category,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const publication = findPublication(slug, resolved);
  if (!publication) notFound();
  return <PublicationArticleView publication={publication} locale={resolved} />;
}
