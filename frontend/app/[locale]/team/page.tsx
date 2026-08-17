import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import type { Locale } from "@evinvest/i18n";
import { TeamPageView } from "@/views/team";
import { pageMetadata } from "@/shared/seo/page-metadata";

// generateMetadata, not a static `metadata`, only so the canonical can carry the
// locale prefix — the page itself still takes no request data and prerenders for
// every locale via the layout's generateStaticParams.
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
    title: t("meta.team.title"),
    description: t("meta.team.description"),
    path: "/team",
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TeamPageView locale={locale as Locale} />;
}
