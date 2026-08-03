import Link from "next/link";
import { Container } from "@evinvest/uikit";

import {
  formatPublicationDate,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { DocumentReader } from "@/shared/ui/document-reader";
import { MediaPlate } from "@/shared/ui/media-plate";

import { KIND_LABEL, pdfHref } from "../model/presentation";

/**
 * An article is a header, at most one cover, and the compiled document.
 *
 * The cover is a property of the publication, declared in its manifest — it is
 * deliberately NOT embedded in the typst source. That is what keeps the whole
 * document pipeline (lib.typ, RemoteDocument, the PDF) untouched by media: the
 * document below never contains a `<figure>` we have to parse or hydrate.
 */
export function PublicationArticleView({
  publication,
}: {
  publication: Publication;
}) {
  const cover = toPlateCover(publication);

  return (
    <main className="min-h-screen bg-main-black pt-32 text-main-mist">
      <Container>
        <header className="mx-auto max-w-3xl">
          <Link
            href="/publications"
            className="font-mono-tech text-[11px] tracking-[0.15em] text-main-mist/45 transition-colors hover:text-main-mist"
          >
            ← All publications
          </Link>
          <div className="mt-8 flex items-center justify-between gap-4 font-mono-tech text-[11px] tracking-[0.19em]">
            <span className="flex items-center gap-2.5 text-main-accent-t1">
              <span aria-hidden className="size-[7px] bg-main-accent-t1" />
              {KIND_LABEL[publication.kind]}
            </span>
            <span className="text-main-mist/40">
              {formatPublicationDate(publication.date, "long")}
            </span>
          </div>
          <h1 className="mt-5 font-serif-display text-4xl leading-tight font-bold text-white sm:text-5xl">
            {publication.title}
          </h1>
          <p className="mt-5 font-serif-display text-lg leading-relaxed text-main-mist/90 italic">
            {publication.dek}
          </p>
          {publication.author && (
            <p className="mt-7 border-t border-main-mist/12 pt-5 font-mono-tech text-[11px] tracking-[0.14em] text-main-mist/50 uppercase">
              {publication.author}
              {publication.role ? ` · ${publication.role}` : ""}
            </p>
          )}
        </header>

        {cover && (
          <div className="mt-12">
            <MediaPlate
              cover={cover}
              size="wide"
              caption={publication.cover?.caption}
              plateLabel="Plate 01"
              className="mx-auto"
            />
          </div>
        )}
      </Container>

      <DocumentReader
        title={publication.title}
        htmlSrc={`/publications/${publication.slug}.dark.html`}
        pdfSrc={pdfHref(publication)}
        bodyClassName="prose prose-invert mx-auto max-w-3xl px-6 py-16 prose-headings:font-serif-display prose-headings:text-white prose-a:text-main-accent-t1 prose-strong:text-main-mist"
        fallback={
          <p className="mx-auto max-w-3xl px-6 py-16 text-main-mist/60">
            This publication isn’t available right now —{" "}
            <a
              href={pdfHref(publication)}
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
