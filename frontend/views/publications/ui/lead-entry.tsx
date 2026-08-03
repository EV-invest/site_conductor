import Link from "next/link";

import {
  formatPublicationDate,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { cn } from "@/shared/lib/utils";
import { MediaPlate } from "@/shared/ui/media-plate";

import { ctaFor, href, KIND_LABEL } from "../model/presentation";
import { EntryCard } from "./entry-card";

/**
 * The newest entry, given the room to be read rather than scanned. Falls back
 * to the ordinary card when the lead has no cover — a document lead in a
 * two-column media layout would leave exactly the picture-shaped hole the card
 * species split exists to avoid.
 */
export function LeadEntry({
  publication,
  className,
  id,
}: {
  publication: Publication;
  className?: string;
  id?: string;
}) {
  const cover = toPlateCover(publication);
  if (!cover) {
    return <EntryCard publication={publication} className={className} id={id} />;
  }

  return (
    <article
      id={id}
      className={cn("grid gap-8 lg:grid-cols-12 lg:gap-10", className)}
    >
      <div className="lg:col-span-7">
        <MediaPlate
          cover={cover}
          size="wide"
          caption={publication.cover?.caption}
          plateLabel="Plate 01"
        />
      </div>
      <div className="flex flex-col lg:col-span-5">
        <div className="flex items-center justify-between gap-4 font-mono-tech text-[11px] tracking-[0.19em]">
          <span className="flex items-center gap-2.5 text-main-accent-t1">
            <span aria-hidden className="size-[7px] bg-main-accent-t1" />
            LATEST DISPATCH
          </span>
          <span className="text-main-mist/40">
            {formatPublicationDate(publication.date, "long")}
          </span>
        </div>
        <h2 className="mt-5 font-serif-display text-3xl leading-tight font-bold text-white sm:text-4xl">
          {publication.title}
        </h2>
        <p className="mt-4 flex-1 leading-relaxed font-light text-main-mist/70">
          {publication.dek}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-main-mist/10 pt-5">
          {publication.author && (
            <span className="font-mono-tech text-[10px] tracking-[0.14em] text-main-mist/45 uppercase">
              {publication.author}
              {publication.role ? ` · ${publication.role}` : ""}
            </span>
          )}
          <Link
            href={href(publication)}
            className="inline-flex items-center gap-2 bg-main-accent-t1 px-5 py-3 font-mono-tech text-[11px] tracking-[0.15em] text-main-black transition-colors hover:bg-main-mist hover:text-main-brand"
          >
            {ctaFor(publication)} →
          </Link>
        </div>
        <span className="sr-only">{KIND_LABEL[publication.kind]}</span>
      </div>
    </article>
  );
}
