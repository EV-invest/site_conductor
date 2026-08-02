import type { Metadata } from "next";

import { Container } from "@evinvest/uikit";

import { DocumentReader } from "@/shared/ui/document-reader";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam.",
  alternates: { canonical: "/publications/whitepaper" },
};

// Filed under /publications with the research it underpins, but it is not a
// blog-flake article: it has its own flake and lands at public/whitepaper.*, so
// it keeps a static route of its own rather than resolving through [slug].
//
// It ships complete styles (bare-tag selectors, its own fonts), so it mounts
// isolated in a shadow root (`isolate`) instead of taking the host's prose.
// That is also why it stays out of the sitemap — see shared/config/site.ts.
export default function Page() {
  return (
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
  );
}
