import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import type { Locale } from "@evinvest/i18n";
import { ContactView } from "@/views/contact";
import { pageMetadata } from "@/shared/seo/page-metadata";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Titles and descriptions are what a reader sees in the browser tab and in a
  // shared link — the one place the page's language shows before its body does.
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translator(messagesFor(resolved), resolved);
  return pageMetadata({
    title: t("meta.contact.title"),
    description: t("meta.contact.description"),
    path: "/contact",
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContactView locale={locale as Locale} />;
}
