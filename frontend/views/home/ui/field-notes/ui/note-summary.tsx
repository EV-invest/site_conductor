import Link from "next/link";

import { formatPublicationDate, type Publication } from "@/entities/publication";
import { cn } from "@/shared/lib/utils";
import { MediaPlate } from "@/shared/ui/media-plate";

import type { NoteView } from "../model/to-note-view";

/// One dispatch: the plate, then the type set on the page beneath it. `lead`
/// only changes scale — the anatomy is identical, so the two never read as
/// different components.
export function NoteSummary({
  note,
  publication,
  lead = false,
  eyebrow,
}: {
  note: NoteView;
  publication: Publication;
  lead?: boolean;
  eyebrow: string;
}) {
  return (
    <article className="flex flex-col">
      <div className="flex items-center justify-between gap-4 pb-3.5 font-mono-tech text-[11px] tracking-[0.19em]">
        <span
          className={cn(
            "flex items-center gap-2.5",
            lead ? "text-main-accent-t1" : "text-main-mist/40"
          )}
        >
          {lead && <span aria-hidden className="size-[7px] bg-main-accent-t1" />}
          {eyebrow}
        </span>
        <span className="text-main-mist/40">
          {formatPublicationDate(publication.date, "long")}
        </span>
      </div>

      <MediaPlate
        cover={note.cover}
        size={lead ? "wide" : "inline"}
        caption={publication.cover?.caption}
        plateLabel={note.plateLabel}
      />

      <h3
        className={cn(
          "mt-5 font-serif-display font-bold text-white",
          lead ? "text-2xl sm:text-3xl" : "text-xl"
        )}
      >
        {publication.title}
      </h3>
      <p className="mt-2.5 leading-relaxed font-light text-main-mist/70">
        {publication.dek}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-main-mist/10 pt-4">
        {publication.author && (
          <span className="font-mono-tech text-[10px] tracking-[0.14em] text-main-mist/45 uppercase">
            {publication.author}
            {publication.role ? ` · ${publication.role}` : ""}
          </span>
        )}
        <Link
          href={note.href}
          className="font-mono-tech text-[11px] tracking-[0.15em] text-main-accent-t1 transition-colors hover:text-main-mist"
        >
          {note.cta} →
        </Link>
      </div>
    </article>
  );
}
