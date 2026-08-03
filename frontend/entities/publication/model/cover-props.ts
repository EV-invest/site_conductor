import type { MediaPlateCover } from "@/shared/ui/media-plate";

import type { Publication } from "./types";

/**
 * Entity `Cover` → `MediaPlate` props.
 *
 * `shared/` cannot import `entities/` (FSD direction), so the plate declares its
 * own structurally-identical cover union and the two are reconciled here — the
 * one place allowed to see both, since entities may depend on shared. Every
 * caller (the index, the article page, the homepage band) shares this so the
 * mapping cannot drift between them.
 *
 * Returns `undefined` for a publication with no cover. That is a text entry, a
 * first-class format — callers render a document card, never a placeholder.
 */
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
      // `frames` counts a photo essay and lives on the publication, but only the
      // plate's badge ever shows it.
      return {
        type: "image",
        src: cover.src,
        alt: cover.alt,
        frames: publication.frames,
      };
  }
}
