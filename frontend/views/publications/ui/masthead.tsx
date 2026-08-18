import { translator, type Locale } from "@evinvest/i18n";

import { formatPublicationDate } from "@/entities/publication";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

/// Counts come from the caller so this stays a dumb server component and the
/// view keeps a single read of the catalogue.
export function Masthead({
  fieldNoteCount,
  researchCount,
  whitepaperCount,
  updatedAt,
  locale,
}: {
  fieldNoteCount: number;
  researchCount: number;
  whitepaperCount: number;
  updatedAt?: string;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  // A zero count is not a fact worth stating — "0 FIELD NOTES" reads as a
  // section that broke rather than one that has not started.
  // Real ICU plurals: Russian needs one/few/many/other for these counts, which
  // string concatenation cannot express.
  const stats = [
    fieldNoteCount > 0
      ? t("publications.stat.fieldNotes", { count: fieldNoteCount })
      : null,
    researchCount > 0
      ? t("publications.stat.reports", { count: researchCount })
      : null,
    whitepaperCount > 0
      ? t("publications.stat.whitepapers", { count: whitepaperCount })
      : null,
    updatedAt
      ? t("publications.stat.updated", {
          date: formatPublicationDate(updatedAt, "short", locale),
        })
      : null,
  ].filter(Boolean);

  return (
    <header>
      <span className="block font-mono-tech text-xs tracking-[0.3em] text-main-accent-t1 uppercase">
        {t("publications.eyebrow")}
      </span>
      <h1 className="mt-4 font-serif-display text-4xl leading-tight font-light text-white sm:text-6xl">
        <Accented text={t("publications.title")} />
      </h1>
      <p className="mt-5 max-w-3xl leading-relaxed font-light text-main-mist/70">
        {t("publications.intro")}
      </p>
      <p className="mt-8 border-y border-main-mist/15 py-4 font-mono-tech text-[11px] tracking-[0.15em] text-main-mist/50">
        {stats.join("   ·   ")}
      </p>
    </header>
  );
}
