import type { Locale } from "@evinvest/i18n";
import { RiskDisclosureView } from "@/views/legal";
import { localeMetadata } from "@/shared/seo/locale-metadata";
import { LEGAL_CONTENT_LOCALES } from "@/shared/config/site";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx. The body is English-only (views/legal/model), so
// the other locales canonicalise to the English URL rather than claiming four
// translations of one English document.
export const generateMetadata = localeMetadata(
  "risk",
  "/risk",
  LEGAL_CONTENT_LOCALES
);

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RiskDisclosureView locale={locale as Locale} />;
}
