import type { Locale } from "@evinvest/i18n";
import { TeamPageView } from "@/views/team";
import { localizedMetadata } from "@/shared/seo/localized-metadata";

export const generateMetadata = localizedMetadata("team", "/team");

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TeamPageView locale={locale as Locale} />;
}
