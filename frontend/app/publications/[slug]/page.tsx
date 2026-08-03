import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findPublication } from "@/entities/publication";
import { PublicationArticleView } from "@/views/publications";

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
  return {
    title: publication.title,
    description: publication.dek,
    alternates: { canonical: `/publications/${slug}` },
  };
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
