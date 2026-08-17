import { messagesFor } from "@/shared/config/i18n";
import { DEFAULT_LOCALE, isLocale, translator } from "@evinvest/i18n";

import {
  listVacancies,
  vacancyCacheOptions,
  type VacancySummary,
} from "@/entities/vacancy";
import { HiringView } from "@/views/hiring";
import { pageMetadata } from "@/shared/seo/page-metadata";

// SSG + ISR: the board statically prerenders (the force-cache fetch below makes
// the vacancy list cacheable) and revalidates hourly, so it loads instantly and
// new listings surface without a redeploy. An unreachable backend at build
// degrades to an empty board (see try/catch); ISR fills it on the next request.
export const revalidate = 3600;

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
    title: t("meta.hiring.title"),
    description: t("meta.hiring.description"),
    path: "/hiring",
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let vacancies: VacancySummary[] = [];
  try {
    // vacancyCacheOptions = force-cache + an explicit fetch TTL (static board,
    // hourly refresh). The generated client passes a Request object, which
    // segment revalidate alone won't make cacheable or expire, so both the
    // cache opt-in and the TTL ride on the fetch itself.
    const { data } = await listVacancies(vacancyCacheOptions);
    vacancies = data ?? [];
  } catch {
    // Backend unreachable — render the page shell with an empty board.
    vacancies = [];
  }
  return (
    <HiringView
      locale={isLocale(locale) ? locale : DEFAULT_LOCALE}
      vacancies={vacancies}
    />
  );
}
