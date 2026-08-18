import Link from "next/link";
import { Container } from "@evinvest/uikit";
import { localePath, translator, type Locale } from "@evinvest/i18n";

import {
  hasTranslatedDocument,
  formatPublicationDate,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { DocumentReader } from "@/shared/ui/document-reader";
import { MediaPlate } from "@/shared/ui/media-plate";
import { messagesFor } from "@/shared/config/i18n";

import { kindLabel, pdfHref } from "../model/presentation";
import { PublicationStructuredData } from "./publication-structured-data";

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
  locale,
}: {
  publication: Publication;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  const cover = toPlateCover(publication);

  return (
    <main className="min-h-screen bg-main-black pt-32 text-main-mist">
      <PublicationStructuredData publication={publication} />
      <Container>
        <header className="mx-auto max-w-3xl">
          <Link
            href={localePath(locale, "/publications")}
            className="font-mono-tech text-[11px] tracking-[0.15em] text-main-mist/45 transition-colors hover:text-main-mist"
          >
            ← {t("publications.allPublications")}
          </Link>
          <div className="mt-8 flex items-center justify-between gap-4 font-mono-tech text-[11px] tracking-[0.19em]">
            <span className="flex items-center gap-2.5 text-main-accent-t1">
              <span aria-hidden className="size-[7px] bg-main-accent-t1" />
              {kindLabel(publication.kind, t)}
            </span>
            {/* <time> so the dateline is machine-readable on its own, not only
                inside the JSON-LD block. */}
            <time dateTime={publication.date} className="text-main-mist/40">
              {formatPublicationDate(publication.date, "long", locale)}
            </time>
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
              plateLabel={t("publications.plate", { n: "01" })}
              className="mx-auto"
            />
          </div>
        )}
      </Container>

      {/* Sits exactly at the seam: everything above is translated card copy,
          everything below is the compiled report, which is English. Saying so
          here is what keeps the translated heading from implying a translated
          document — and it disappears on its own once the blog build publishes
          a translated document and declares it in `locales`. */}
      {!hasTranslatedDocument(publication, locale) && (
        <Container>
          <p
            role="note"
            className="mx-auto mt-12 max-w-3xl border-t border-main-mist/12 pt-5 text-xs text-main-mist/55"
          >
            {t("publications.documentInEnglish")}
          </p>
        </Container>
      )}

      <DocumentReader
        title={publication.title}
        downloadLabel={t("publications.downloadPdf")}
        downloadAriaLabel={t("document.downloadAria", {
          title: publication.title,
        })}
        htmlSrc={`/publications/${publication.slug}.dark.html`}
        pdfSrc={pdfHref(publication)}
        bodyClassName="prose prose-invert mx-auto max-w-3xl px-6 py-16 prose-headings:font-serif-display prose-headings:text-white prose-a:text-main-accent-t1 prose-strong:text-main-mist"
        fallback={
          <p className="mx-auto max-w-3xl px-6 py-16 text-main-mist/60">
            {t("publications.unavailable")}{" "}
            <a
              href={pdfHref(publication)}
              className="text-main-accent-t1 underline"
            >
              {t("publications.downloadPdf")}
            </a>
            .
          </p>
        }
      />
    </main>
  );
}
