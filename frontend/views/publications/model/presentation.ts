import type { Translate } from "@evinvest/i18n";

import type { Publication, PublicationKind } from "@/entities/publication";

const KIND_KEY: Record<PublicationKind, string> = {
  "field-note": "publications.kind.fieldNote",
  research: "publications.kind.research",
  whitepaper: "publications.kind.whitepaper",
};

export function kindLabel(kind: PublicationKind, t: Translate): string {
  return t(KIND_KEY[kind]);
}

/// The verb states the format. A dispatch you watch and a report you read are
/// different things, and the label should not pretend otherwise.
export function ctaFor(publication: Publication, t: Translate): string {
  switch (publication.cover?.type) {
    case "video":
    case "youtube":
      return t("publications.cta.watchNote");
    case "image":
      return t("publications.cta.readNote");
    case undefined:
      return publication.kind === "whitepaper"
        ? t("publications.cta.readWhitepaper")
        : t("publications.cta.readReport");
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
