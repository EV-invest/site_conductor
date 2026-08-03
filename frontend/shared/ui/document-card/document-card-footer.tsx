import Link from "next/link";
import { ArrowRight, FileDown } from "lucide-react";

export interface DocumentCardFooterProps {
  pages?: number;
  readingMinutes?: number;
  href: string;
  pdfHref?: string;
  cta: string;
  /** Used for the download link's accessible name. */
  title: string;
}

/**
 * The format label states what the document IS — page count, read time, file
 * kind. It must never phrase an absence ("no video", "text only"): the whole
 * point of this card is that a text dispatch is a complete object, not a media
 * card with a hole in it.
 */
function formatLabel({ pages, readingMinutes, pdfHref }: DocumentCardFooterProps) {
  const terms = [
    pages ? `${pages} PP` : null,
    readingMinutes ? `${readingMinutes} MIN READ` : null,
    pdfHref ? "PDF" : null,
  ].filter(Boolean);
  return terms.length ? terms.join(" · ") : "FULL REPORT";
}

export function DocumentCardFooter(props: DocumentCardFooterProps) {
  const { href, pdfHref, cta, title } = props;
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-main-mist/10 pt-5">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/40">
        {formatLabel(props)}
      </span>
      <div className="flex items-center gap-4">
        {pdfHref ? (
          <a
            href={pdfHref}
            download
            aria-label={`Download ${title} as PDF`}
            className="relative z-10 inline-flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45 motion-safe:transition-colors hover:text-main-accent-t1"
          >
            <FileDown className="size-3.5" />
            PDF
          </a>
        ) : null}
        {/* Stretched link: the pseudo-element makes the whole card the hit area,
            so the card needs no nested/duplicate anchor around its title. */}
        <Link
          href={href}
          className="inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t1 motion-safe:transition-colors hover:text-main-mist after:absolute after:inset-0 after:content-['']"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
