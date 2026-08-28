import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { pageMetadata } from "./page-metadata";

/** The props Next hands a page (and its `generateMetadata`) under app/[locale]. */
export type LocaleParams = { params: Promise<{ locale: string }> };

// One `generateMetadata` for every static page under app/[locale] whose title
// and description are a single catalogue pair.
//
// Why those pages export `generateMetadata` at all, rather than a static
// `metadata` object: only so the canonical can carry the locale prefix — the
// pages themselves take no request data and still prerender for every locale
// via the layout's `generateStaticParams`.
//
// And why the two strings are translated even on routes whose body copy is not
// yet: titles and descriptions are what a reader sees in the browser tab and in
// a shared link — the one place the page's language shows before its body does.
//
// `keyStem` names the catalogue pair `meta.<keyStem>.title` /
// `meta.<keyStem>.description`; `path` is locale-free and root-relative, since
// `pageMetadata` applies the prefix (never pass "/ru/team").
export function localizedMetadata(keyStem: string, path: string) {
  return async function generateMetadata({
    params,
  }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
    const t = translator(messagesFor(resolved), resolved);
    return pageMetadata({
      title: t(`meta.${keyStem}.title`),
      description: t(`meta.${keyStem}.description`),
      path,
      locale,
    });
  };
}
