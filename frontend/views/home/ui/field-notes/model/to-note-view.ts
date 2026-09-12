import { toPlateCover, type Publication } from "@/entities/publication";
import type { T } from "@/shared/config/i18n";
import type { MediaPlateCover } from "@/shared/ui/media-plate";

export type NoteView = {
  publication: Publication;
  cover: MediaPlateCover;
  href: string;
  cta: string;
  plateLabel: string;
};

/// The band only shows dispatches that have something to show. A text-only entry
/// belongs on /publications as a document card, not inside a section built
/// entirely around footage — so it is dropped here rather than rendered as a
/// placeholder.
export function toNoteViews(publications: Publication[], t: T): NoteView[] {
  return publications.flatMap((publication, index) => {
    const cover = toPlateCover(publication);
    if (!cover) return [];
    return [
      {
        publication,
        cover,
        href: `/publications/${publication.slug}`,
        cta:
          cover.type === "image"
            ? t("publications.cta.readNote", "READ THE NOTE")
            : t("publications.cta.watchNote", "WATCH THE NOTE"),
        plateLabel: t("publications.plate", "Plate {n}", {
          n: String(index + 1).padStart(2, "0"),
        }),
      },
    ];
  });
}
