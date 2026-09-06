import { LOCALES, type Locale, type Messages } from "@evinvest/i18n";
import {
  resolveCatalogue,
  type TranslatedCatalogue,
} from "@evinvest/i18n/policy";
import en from "@/messages/en/common.json";
import ru from "@/messages/ru/common.json";
import vi from "@/messages/vi/common.json";
import fr from "@/messages/fr/common.json";
import de from "@/messages/de/common.json";

// Static imports, not a dynamic `import(\`../messages/${locale}\`)`: every locale
// is prerendered at build, so there is nothing to defer, and a template import
// defeats bundling and turns a missing catalogue into a runtime 500 instead of a
// build error.
const AUTHORED: Record<Exclude<Locale, "en">, TranslatedCatalogue> = {
  ru,
  vi,
  fr,
  de,
};

// Policy applied once at module scope, not per request. `resolveCatalogue` is
// pure over static input, so the result is identical for every render — doing it
// per call would re-validate every plural on every page.
const RESOLVED = Object.fromEntries(
  (Object.keys(AUTHORED) as Exclude<Locale, "en">[]).map(locale => [
    locale,
    resolveCatalogue(locale, en, AUTHORED[locale]),
  ])
);

export const messagesFor = (locale: Locale): Messages =>
  locale === "en" ? en : (RESOLVED[locale]?.messages ?? en);

/** Per-locale policy outcome — read by `npm run i18n:check`. */
export const catalogueReport = () => Object.values(RESOLVED);

// Which locales have enough translated copy to be worth indexing.
//
// All five. The list was held at `["en"]` while the long-form page copy was
// still English behind a translated shell — five near-duplicate URLs earn a
// duplicate-content penalty rather than five rankings. That condition is gone:
// `npm run i18n:check` reports 100% coverage on ru/vi/fr/de with no drift, so a
// reader landing on /de reads German, and the four locales are now worth the
// crawl budget they ask for.
//
// `i18n:check` is the gate, not a formality. It is what makes this list
// truthful, so if a locale ever regresses to wholesale English fallback, take it
// out of here before shipping — a `noindex` locale costs nothing, whereas a
// locale advertising a translation it no longer has is what teaches Google to
// distrust the whole hreflang cluster.
//
// One thing this list deliberately does NOT speak for: content this repo does
// not translate. A publication's Typst *document* is English-only unless
// `Publication.locales` says otherwise, and those pages narrow their own
// alternates via `contentLocales` — see shared/seo/hreflang.ts. Vacancies need
// no such carve-out; the backend localises them per request.
export const INDEXED_LOCALES: readonly Locale[] = LOCALES;

export const isIndexed = (locale: Locale) => INDEXED_LOCALES.includes(locale);
