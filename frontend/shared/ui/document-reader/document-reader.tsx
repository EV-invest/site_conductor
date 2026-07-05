import { type ReactNode } from "react";
import { FileDown } from "lucide-react";
import { Container } from "@evinvest/uikit";

import { HeaderAction } from "@/shared/ui/header-actions";
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

/**
 * The read/download framework for a `RemoteDocument`-backed page: the doc body
 * plus a PDF-download action mounted into the top bar for the duration of the
 * read. `/whitepaper` and `/blogs/[slug]` both render through this so the two
 * never drift into their own copies of the same read/download interaction.
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

      <HeaderAction>
        <a
          href={pdfSrc}
          download
          aria-label={`Download ${title} as PDF`}
          title="Download PDF"
          className="inline-flex shrink-0 items-center border border-main-accent-t1/30 p-2 text-main-accent-t1 transition-colors hover:border-main-accent-t1 hover:text-main-mist"
        >
          <FileDown className="size-4" />
        </a>
      </HeaderAction>

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
