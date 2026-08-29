import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import {
  hasTranslatedDocument,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { DocumentReader } from "@/shared/ui/document-reader";
import { MediaPlate } from "@/shared/ui/media-plate";
import { messagesFor } from "@/shared/config/i18n";

import { pdfHref } from "../model/presentation";
import { PublicationArticleHeader } from "./publication-article-header";
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
        <PublicationArticleHeader publication={publication} locale={locale} />

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
