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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const publication = findPublication(slug);
  if (!publication) {
    return { title: "Publication not found", robots: { index: false } };
  }
  // og:type=article + the cover as the share image, so a dispatch posted to
  // LinkedIn or X carries its own art and dateline instead of the site card.
  return pageMetadata({
    title: publication.title,
    description: publication.dek,
    path: `/publications/${slug}`,
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = findPublication(slug);
  if (!publication) notFound();
  return <PublicationArticleView publication={publication} />;
}
