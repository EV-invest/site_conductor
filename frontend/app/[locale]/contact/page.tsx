import type { Locale } from "@evinvest/i18n";
import { ContactView } from "@/views/contact";
import { localizedMetadata } from "@/shared/seo/localized-metadata";

export const generateMetadata = localizedMetadata("contact", "/contact");

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContactView locale={locale as Locale} />;
}
