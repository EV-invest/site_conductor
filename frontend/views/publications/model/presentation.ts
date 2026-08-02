import type { Publication, PublicationKind } from "@/entities/publication";
import type { MediaPlateCover } from "@/shared/ui/media-plate";

export const KIND_LABEL: Record<PublicationKind, string> = {
  "field-note": "FIELD NOTE",
  research: "RESEARCH",
  whitepaper: "WHITEPAPER",
};

/// `shared/` cannot import `entities/` (FSD direction), so the two cover shapes
/// are declared independently and reconciled here. The one real difference:
/// `frames` counts a photo essay and lives on the publication, but only the
/// plate's badge ever shows it.
export function toPlateCover(
  publication: Publication
): MediaPlateCover | undefined {
  const cover = publication.cover;
  if (!cover) return undefined;
  switch (cover.type) {
    case "video":
      return {
        type: "video",
        src: cover.src,
        poster: cover.poster,
        alt: cover.alt,
        duration: cover.duration,
      };
    case "youtube":
      return {
        type: "youtube",
        videoId: cover.videoId,
        poster: cover.poster,
        alt: cover.alt,
        duration: cover.duration,
      };
    case "image":
      return {
        type: "image",
        src: cover.src,
        alt: cover.alt,
        frames: publication.frames,
      };
  }
}

/// The verb states the format. A dispatch you watch and a report you read are
/// different things, and the label should not pretend otherwise.
export function ctaFor(publication: Publication): string {
  switch (publication.cover?.type) {
    case "video":
    case "youtube":
      return "WATCH THE NOTE";
    case "image":
      return "READ THE NOTE";
    default:
      return publication.kind === "whitepaper"
        ? "READ THE WHITEPAPER"
        : "READ THE REPORT";
  }
}

export function href(publication: Publication): string {
  return `/publications/${publication.slug}`;
}

export function pdfHref(publication: Publication): string {
  return `/publications/${publication.slug}.pdf`;
}
