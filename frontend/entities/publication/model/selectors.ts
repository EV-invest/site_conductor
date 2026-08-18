import type { Locale } from "@evinvest/i18n";
import { PUBLICATIONS } from "./catalogue";
import { localizePublication } from "./translations";
import type { Publication, PublicationKind } from "./types";

// `undefined` (not a fallback entry) so an uncatalogued slug is a hard miss the
// caller must turn into a 404 — never a silently rendered soft-404 (#105).
export function findPublication(
  slug: string,
  locale: Locale
): Publication | undefined {
  const found = PUBLICATIONS.find(p => p.slug === slug);
  return found && localizePublication(found, locale);
}

// The whole catalogue in canonical English, newest first.
//
// For machine surfaces only — the sitemap, the RSS feed, the site-wide
// structured data — which describe the catalogue itself rather than a page a
// reader is looking at, and would otherwise have to pick a language to be
// "the" catalogue in. Anything a reader sees goes through `publicationsFor`.
export function allPublications(): readonly Publication[] {
  return PUBLICATIONS;
}

// The catalogue as one reader sees it: card copy resolved for `locale`.
export function publicationsFor(locale: Locale): readonly Publication[] {
  return PUBLICATIONS.map(p => localizePublication(p, locale));
}

export function publicationsByKind(
  kind: PublicationKind,
  locale: Locale
): Publication[] {
  return PUBLICATIONS.filter(p => p.kind === kind).map(p =>
    localizePublication(p, locale)
  );
}

// Rule 1.3 was once applied here by hiding untranslated publications. It is not
// any more, and the reason is worth recording rather than rediscovering.
//
// The rule exists so a reader never meets an English essay under Russian chrome
// and concludes the locale is a veneer. Hiding satisfies that — but with no
// document translated into anything, hiding meant `/ru/publications` was an
// empty page, and an empty research index says something worse about a fund than
// an English one does. (In practice the selector that did the hiding was
// exported and never called, so the site had been serving English cards under
// translated chrome all along: the rule was documented, not enforced.)
//
// What ships instead answers the same worry directly: the *card* — title, dek,
// quote, category — is translated from `translations.json`, so the index reads
// in the reader's language, and the article page states plainly that the report
// below it is in English. The reader is told, rather than shown an empty shelf
// or left to work it out.
//
// `availableIn` with "hide" remains the right call for content compiled
// per-locale; when the blog build starts publishing translated documents and
// declaring them in `locales`, this is where that logic belongs again.

export function fieldNotes(locale: Locale, n?: number): Publication[] {
  const notes = publicationsByKind("field-note", locale);
  return n === undefined ? notes : notes.slice(0, n);
}

// The reader's locale, and UTC. Both halves matter and for different reasons.
//
// The locale is passed in rather than read from the environment: this formats on
// the server and again on the client, and a host-derived locale would differ
// between the two — a hydration mismatch. An explicit argument is the same value
// in both places. Before this took a locale it was pinned to en-GB, which meant
// a Russian page dated its articles "1 May 2026".
//
// UTC because a date-only string has no zone, and letting the runtime apply one
// moves the article a day backwards for any reader west of Greenwich.
//
// `en` maps to en-GB, not `en`: day-month-year, which is what this site has
// always shown and what the rest of its copy assumes.
const LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  vi: "vi-VN",
  fr: "fr-FR",
  de: "de-DE",
};

// Constructing an Intl formatter is not cheap and these are called per card, so
// each (locale, style) pair is built once and kept.
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: Locale, style: "long" | "short"): Intl.DateTimeFormat {
  const key = `${locale}:${style}`;
  const cached = FORMATTERS.get(key);
  if (cached) return cached;
  const built = new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? "en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
  FORMATTERS.set(key, built);
  return built;
}

// `locale` is required, with no default. A default would make forgetting it
// silent — English dates on a Russian page, which is exactly the bug this
// parameter was added to fix, and invisible to anyone not reading that locale.
export function formatPublicationDate(
  iso: string,
  style: "long" | "short",
  locale: Locale
): string {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  if (style === "long") return formatter(locale, "long").format(at);

  // The short form is a mono-tech label — "1 MAY 2026" — so it wants the three
  // fields and no punctuation. Built from parts rather than by stripping
  // characters out of the formatted string: `replace(/\./g, "")` was an en-GB
  // assumption that turned Russian's era suffix "2026 г." into a dangling
  // "2026 Г". Keeping only day/month/year drops every locale's literals while
  // preserving its field *order*, which is the part that actually differs.
  return formatter(locale, "short")
    .formatToParts(at)
    .filter(part => part.type === "day" || part.type === "month" || part.type === "year")
    .map(part => part.value)
    .join(" ")
    .toUpperCase();
}
