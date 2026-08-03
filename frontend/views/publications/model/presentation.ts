import type { Publication, PublicationKind } from "@/entities/publication";

export const KIND_LABEL: Record<PublicationKind, string> = {
  "field-note": "FIELD NOTE",
  research: "RESEARCH",
  whitepaper: "WHITEPAPER",
};

/// The verb states the format. A dispatch you watch and a report you read are
/// different things, and the label should not pretend otherwise.
export function ctaFor(publication: Publication): string {
  switch (publication.cover?.type) {
    case "video":
    case "youtube":
      return "WATCH THE NOTE";
    case "image":
      return "READ THE NOTE";
    case undefined:
      return publication.kind === "whitepaper"
        ? "READ THE WHITEPAPER"
        : "READ THE REPORT";
  }
}

export function href(publication: Publication): string {
  return `/publications/${publication.slug}`;
}

// The whitepaper has its own flake and lands at public/whitepaper.pdf, not
// alongside the blog-built documents — next.config's noindex rules encode the
// same split.
export function pdfHref(publication: Publication): string {
  return publication.kind === "whitepaper"
    ? "/whitepaper.pdf"
    : `/publications/${publication.slug}.pdf`;
}
