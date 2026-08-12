import type { Locale, Messages } from "@evinvest/i18n";
import en from "@/messages/en/common.json";
import ru from "@/messages/ru/common.json";
import vi from "@/messages/vi/common.json";
import fr from "@/messages/fr/common.json";
import de from "@/messages/de/common.json";

// Static imports, not a dynamic `import(\`../messages/${locale}\`)`: every locale
// is prerendered at build, so there is nothing to defer, and a template import
// defeats bundling and turns a missing catalogue into a runtime 500 instead of a
// build error.
const CATALOGUES: Record<Locale, Messages> = { en, ru, vi, fr, de };

export const messagesFor = (locale: Locale): Messages => CATALOGUES[locale];

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
