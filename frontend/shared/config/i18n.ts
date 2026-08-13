import type { Locale, Messages } from "@evinvest/i18n";
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
// The routes exist for all five — the switcher works, and a reader who picks
// Deutsch gets a German shell today. But the long-form page copy is still
// English, and advertising five near-duplicate URLs to Google is how a site
// earns a duplicate-content penalty instead of ranking in five languages. So
// non-English locales render but are `noindex` until their catalogue is filled.
//
// Adding a locale here is the ONE change needed to launch it: metadata and the
// sitemap both read this list.
export const INDEXED_LOCALES: readonly Locale[] = ["en"];

export const isIndexed = (locale: Locale) => INDEXED_LOCALES.includes(locale);
