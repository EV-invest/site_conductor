import type { Locale } from "@evinvest/i18n";

// The BCP-47 tag each locale formats under. `@evinvest/i18n` deliberately owns
// no number or date policy (see its module doc), so this app keeps one map and
// every Intl formatter reads it — a second map would let the hero and the
// publication cards disagree on what "17.09.2026" means.
//
// `en` maps to en-GB, not `en`: day-month-year, which is what this site has
// always shown and what the rest of its copy assumes.
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  vi: "vi-VN",
  fr: "fr-FR",
  de: "de-DE",
};

/** A fixed-precision decimal in the locale's digits — "16.4" vs "16,4". */
export function formatDecimal(
  value: number,
  locale: Locale,
  fractionDigits: number
): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * A calendar date ("2026-09-17") in the locale's long form. Parsed at UTC
 * midnight so the day never shifts for a reader west of Greenwich; an
 * unparseable input comes back verbatim rather than as "Invalid Date".
 */
export function formatCalendarDate(iso: string, locale: Locale): string {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(at);
}
