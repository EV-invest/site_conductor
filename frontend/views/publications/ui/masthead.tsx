import { formatPublicationDate } from "@/entities/publication";

/// Counts come from the caller so this stays a dumb server component and the
/// view keeps a single read of the catalogue.
export function Masthead({
  fieldNoteCount,
  researchCount,
  whitepaperCount,
  updatedAt,
}: {
  fieldNoteCount: number;
  researchCount: number;
  whitepaperCount: number;
  updatedAt?: string;
}) {
  const stats = [
    `${fieldNoteCount} FIELD NOTES`,
    `${researchCount} REPORTS`,
    whitepaperCount > 0 ? `${whitepaperCount} WHITEPAPER` : null,
    updatedAt
      ? `UPDATED ${formatPublicationDate(updatedAt, "short")}`
      : null,
  ].filter(Boolean);

  return (
    <header>
      <span className="block font-mono-tech text-xs tracking-[0.3em] text-main-accent-t1 uppercase">
        EV Investment · Publications
      </span>
      <h1 className="mt-4 font-serif-display text-4xl leading-tight font-light text-white sm:text-6xl">
        Field Notes{" "}
        <span className="font-serif italic text-main-accent-t1">
          &amp; Research
        </span>
      </h1>
      <p className="mt-5 max-w-3xl leading-relaxed font-light text-main-mist/70">
        Three kinds of evidence. Research is the desk work — macro models, land
        sweeps, yield decomposition, published as citable PDFs. Field notes are
        the ground truth: our people filming the districts we underwrite. The
        whitepaper is the standing document behind both.
      </p>
      <p className="mt-8 border-y border-main-mist/15 py-4 font-mono-tech text-[11px] tracking-[0.15em] text-main-mist/50">
        {stats.join("   ·   ")}
      </p>
    </header>
  );
}
