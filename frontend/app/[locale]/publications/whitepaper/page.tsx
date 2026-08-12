import { Container } from "@evinvest/uikit";

import { DocumentReader } from "@/shared/ui/document-reader";
import { pageMetadata } from "@/shared/seo/page-metadata";
import { PageGraph } from "@/shared/seo/page-graph";

const DESCRIPTION =
  "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam.";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata({
    title: "Whitepaper",
    description: DESCRIPTION,
    path: "/publications/whitepaper",
    locale,
  });
}

// Filed under /publications with the research it underpins, but it is not a
// blog-flake article: it has its own flake and lands at public/whitepaper.*, so
// it keeps a static route of its own rather than resolving through [slug].
//
// It ships complete styles (bare-tag selectors, its own fonts), so it mounts
// isolated in a shadow root (`isolate`) instead of taking the host's prose.
// That is also why it stays out of the sitemap — see shared/config/site.ts.
export default function Page() {
  return (
    <>
      {/* The body is shadow-mounted and so unreadable to a crawler (which is
          why this URL stays out of the sitemap), but the page still exists and
          is linked — the graph at least gives it an identity and a trail rather
          than leaving a blank in the site's structure. */}
      <PageGraph
        path="/publications/whitepaper"
        name="Whitepaper"
        description={DESCRIPTION}
        trail={[
          { name: "Publications", path: "/publications" },
          { name: "Whitepaper", path: "/publications/whitepaper" },
        ]}
      />
      <DocumentReader
        title="EV Investment Whitepaper"
        htmlSrc="/whitepaper.dark.html"
        pdfSrc="/whitepaper.pdf"
        isolate
        fallback={
          <Container className="py-24 text-main-mist/60">
            Loading the whitepaper… if it doesn’t appear,{" "}
            <a href="/whitepaper.pdf" className="text-main-accent-t1 underline">
              download the PDF
            </a>
            .
          </Container>
        }
      />
    </>
  );
}
