import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import { Container } from "@evinvest/uikit";

import { DocumentReader } from "@/shared/ui/document-reader";
import { localeMetadata } from "@/shared/seo/locale-metadata";
import { PageGraph } from "@/shared/seo/page-graph";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export const generateMetadata = localeMetadata(
  "whitepaper",
  "/publications/whitepaper"
);

// Filed under /publications with the research it underpins, but it is not a
// blog-flake article: it has its own flake and lands at public/whitepaper.*, so
// it keeps a static route of its own rather than resolving through [slug].
//
// It ships complete styles (bare-tag selectors, its own fonts), so it mounts
// isolated in a shadow root (`isolate`) instead of taking the host's prose.
// That is also why it stays out of the sitemap — see shared/config/site.ts.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translator(messagesFor(resolved), resolved);
  return (
    <>
      {/* The body is shadow-mounted and so unreadable to a crawler (which is
          why this URL stays out of the sitemap), but the page still exists and
          is linked — the graph at least gives it an identity and a trail rather
          than leaving a blank in the site's structure. */}
      <PageGraph
        path="/publications/whitepaper"
        name={t("whitepaper.name")}
        description={t("meta.whitepaper.description")}
        trail={[
          { name: t("nav.publications"), path: "/publications" },
          { name: t("whitepaper.name"), path: "/publications/whitepaper" },
        ]}
      />
      <DocumentReader
        title={t("whitepaper.title")}
        downloadLabel={t("publications.downloadPdf")}
        downloadAriaLabel={t("document.downloadAria", {
          title: t("whitepaper.title"),
        })}
        htmlSrc="/whitepaper.dark.html"
        pdfSrc="/whitepaper.pdf"
        isolate
        fallback={
          <Container className="py-24 text-main-mist/60">
            {t("whitepaper.loading")}{" "}
            <a href="/whitepaper.pdf" className="text-main-accent-t1 underline">
              {t("publications.downloadPdf")}
            </a>
            .
          </Container>
        }
      />
    </>
  );
}
