import { type ReactNode } from "react";
import { Download } from "lucide-react";
import { Container } from "@evinvest/uikit";

import { RemoteDocument } from "@/shared/mfe";

export interface DocumentReaderProps {
  /** sr-only page heading — the doc body supplies its own visible title. */
  title: string;
  /** Same-origin path to the doc's html build, passed straight to `RemoteDocument`. */
  htmlSrc: string;
  /** Same-origin path to the doc's PDF build — the bail-out download. */
  pdfSrc: string;
  /** Forwarded to `RemoteDocument` — self-styled docs (the whitepaper) isolate in a shadow root. */
  isolate?: boolean;
  /** Forwarded to `RemoteDocument` as `className` (e.g. `prose` for unstyled blog docs). */
  bodyClassName?: string;
  /** Shown in place of the doc if its build can't be loaded. Defaults to a PDF-download note. */
  fallback?: ReactNode;
}

const downloadLinkClassName =
  "inline-flex shrink-0 items-center gap-1.5 border border-main-accent-t1/30 px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider text-main-accent-t1 transition-colors hover:border-main-accent-t1 hover:text-main-mist";

/**
 * The read/download framework for a `RemoteDocument`-backed page: the doc body
 * plus a toolbar — sticky under the fixed `Header` — that lets the reader bail
 * out to the PDF at any point, the way a browser's own PDF viewer chrome does.
 * `/whitepaper` and `/blogs/[slug]` both render through this so the two never
 * drift into their own copies of the same read/download interaction.
 */
export function DocumentReader({
  title,
  htmlSrc,
  pdfSrc,
  isolate = false,
  bodyClassName,
  fallback,
}: DocumentReaderProps) {
  return (
    <main className="mt-24 min-h-[60vh]">
      {/* The doc supplies its own heading inside the body; this is only for the
          a11y/heading landmark on the host page. */}
      <h1 className="sr-only">{title}</h1>

      <div className="sticky top-24 z-40 border-b border-main-mist/10 bg-main-black/90 backdrop-blur-md">
        <Container className="flex items-center justify-end py-3">
          <a href={pdfSrc} download className={downloadLinkClassName}>
            Download PDF
            <Download className="size-3.5" />
          </a>
        </Container>
      </div>

      <RemoteDocument
        src={htmlSrc}
        isolate={isolate}
        className={bodyClassName ?? "block"}
        fallback={
          fallback ?? (
            <Container className="py-24 text-main-mist/60">
              This document isn’t available right now —{" "}
              <a href={pdfSrc} className="text-main-accent-t1 underline">
                download the PDF
              </a>
              .
            </Container>
          )
        }
      />
    </main>
  );
}
