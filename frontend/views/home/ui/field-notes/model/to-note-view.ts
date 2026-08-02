import type { Publication } from "@/entities/publication";
import type { MediaPlateCover } from "@/shared/ui/media-plate";

export type NoteView = {
  cover: MediaPlateCover;
  href: string;
  cta: string;
  plateLabel: string;
};

/// The section only shows dispatches that have something to show. A text-only
/// entry belongs on /publications as a document card, not here inside a band
/// built entirely around footage — so callers filter on the returned value
/// rather than rendering a placeholder.
export function toNoteView(
  publication: Publication,
  index: number
): NoteView | undefined {
  const cover = publication.cover;
  if (!cover) return undefined;

  const plate: MediaPlateCover =
    cover.type === "video"
      ? {
          type: "video",
          src: cover.src,
          poster: cover.poster,
          alt: cover.alt,
          duration: cover.duration,
        }
      : cover.type === "youtube"
        ? {
            type: "youtube",
            videoId: cover.videoId,
            poster: cover.poster,
            alt: cover.alt,
            duration: cover.duration,
          }
        : {
            type: "image",
            src: cover.src,
            alt: cover.alt,
            frames: publication.frames,
          };

  return {
    cover: plate,
    href: `/publications/${publication.slug}`,
    cta: cover.type === "image" ? "READ THE NOTE" : "WATCH THE NOTE",
    plateLabel: `Plate ${String(index + 1).padStart(2, "0")}`,
  };
}
