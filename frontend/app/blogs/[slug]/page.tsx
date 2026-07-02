import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RemoteDocument } from "@/shared/mfe";
import { articleTitle } from "@/entities/article";

// Reading the static doc off disk per request, so the latest flake-copied file
// is served (the page is cheap: one file read + inject).
export const dynamic = "force-dynamic";

// Confines the [slug] to a safe segment before it reaches the filesystem reader.
const isSlug = (s: string) => /^[a-z0-9_]+$/.test(s);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = articleTitle(slug);
  return {
    title,
    description: `EV Investment research — ${title}`,
    alternates: { canonical: `/blogs/${slug}` },
  };
}

// Research articles are self-contained static HTML builds (blog flake → public/),
// composed into the page as *document microfrontends* — no iframe. They carry no
// styles of their own, so they mount in the light DOM and inherit the host's
// reading typography (prose). Dark is the default variant.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const title = articleTitle(slug);
  return (
    <main className="mt-24 min-h-[60vh] px-6 py-16">
      {/* The article HTML starts at <h2>; give the page its <h1> for heading
          hierarchy (sr-only — the article repeats the title in its body). */}
      <h1 className="sr-only">{title}</h1>
      <RemoteDocument
        src={`/blogs/${slug}.dark.html`}
        className="prose prose-invert mx-auto max-w-3xl prose-headings:font-serif-display prose-headings:text-white prose-a:text-main-accent-t1 prose-strong:text-main-mist"
        fallback={
          <p className="mx-auto max-w-3xl text-main-mist/60">
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
    </main>
  );
}
