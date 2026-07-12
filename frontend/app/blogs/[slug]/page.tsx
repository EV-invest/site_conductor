import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentReader } from "@/shared/ui/document-reader";
import { findArticle } from "@/entities/article";

// Reading the static doc off disk per request, so the latest flake-copied file
// is served (the page is cheap: one file read + inject).
export const dynamic = "force-dynamic";

// Only catalogued articles resolve — anything else is a real 404 with an
// explicit noindex (the robots backstop keeps the page unindexable even if a
// future streaming boundary locks the status at 200), never a soft-404 (#105).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  const { title } = article;
  return {
    title,
    description: `EV Investment research — ${title}`,
    alternates: { canonical: `/blogs/${slug}` },
  };
}

// Research articles are self-contained static HTML builds (blog flake → public/),
// composed into the page as *document microfrontends* — no iframe. They mount in
// the light DOM and take the host's reading typography (prose); the standalone
// stylesheet they carry is stripped by the light-DOM path. Dark is the default
// variant.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();
  const { title } = article;
  return (
    <DocumentReader
      title={title}
      htmlSrc={`/blogs/${slug}.dark.html`}
      pdfSrc={`/blogs/${slug}.pdf`}
      bodyClassName="prose prose-invert mx-auto max-w-3xl px-6 py-16 prose-headings:font-serif-display prose-headings:text-white prose-a:text-main-accent-t1 prose-strong:text-main-mist"
      fallback={
        <p className="mx-auto max-w-3xl px-6 py-16 text-main-mist/60">
          This article isn’t available right now —{" "}
          <a
            href={`/blogs/${slug}.pdf`}
            className="text-main-accent-t1 underline"
          >
            download the PDF
          </a>
          .
        </p>
      }
    />
  );
}
