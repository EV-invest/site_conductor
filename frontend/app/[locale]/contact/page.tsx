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
  return pageMetadata({
    title: "Contact",
    description:
      "Get in touch with EV Investment — hiring, investment, and our coastal developments in Quy Nhơn, Vietnam.",
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
