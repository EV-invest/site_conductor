import { DEFAULT_LOCALE, isLocale, LOCALES, translator, type Locale } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getVacancy,
  listVacancies,
  vacancyCacheOptions,
  type VacancyDetail,
} from "@/entities/vacancy";
import { VacancyView } from "@/views/vacancy";
import { pageMetadata } from "@/shared/seo/page-metadata";

// SSG: every role known at build time is prerendered (instant load + static,
// indexable metadata). `dynamicParams` keeps unknown/just-published slugs
// working — they render on demand behind loading.tsx, then ISR-cache for an hour.
export const revalidate = 3600;
export const dynamicParams = true;

// Every (locale, slug) pair, not just the slugs.
//
// `app/[locale]/layout.tsx` declares `dynamicParams = false` — load-bearing, so
// `/team` is declined by `[locale]` and falls through to the fallback rewrite
// (docs/i18n-routing-spike.md). The cost is that a route under `[locale]` is
// only reachable if its params were actually enumerated, and a child returning
// `{ slug }` alone never names the locale it belongs to. That produced no valid
// path for this route at all: every `/{locale}/hiring/{slug}` fell straight
// through to Next's *default* 404 — not this segment's `not-found.tsx`, which is
// what a real missing role renders. `/hiring` kept working the whole time
// (`[locale]` is its only dynamic segment), which is what made it look like a
// backend problem when the API was answering 200 all along.
//
// So the cross product is spelled out here. `publications/[slug]` sidesteps the
// same trap from the other end, with `dynamic = "force-dynamic"`.
export async function generateStaticParams() {
  try {
    const { data } = await listVacancies();
    const slugs = (data ?? []).map(vacancy => vacancy.slug);
    return LOCALES.flatMap(locale => slugs.map(slug => ({ locale, slug })));
  } catch {
    // Backend unreachable at build — fall back to fully on-demand rendering.
    return [];
  }
}

// Deduped within a request, so generateMetadata and the page share one fetch.
// `null` means a genuine 404 (role missing); a network/5xx failure throws so the
// 500 boundary (app/error.tsx) renders instead of a misleading "not found".
// Keyed on (slug, locale), not slug alone: `cache` dedupes on its arguments, so
// a slug-only key would let whichever locale rendered first answer for all five
// — a Russian reader served the French copy of a role. The locale has to be an
// argument for the memo to be correct, not just for the request to be.
const fetchVacancy = cache(
  async (slug: string, locale: Locale): Promise<VacancyDetail | null> => {
    const { data, response } = await getVacancy({
      path: { slug },
      query: { locale },
      // ISR: on-demand (non-prebuilt) roles cache for an hour (the TTL rides
      // on the fetch itself — see vacancyCacheOptions) instead of re-fetching
      // every request. Prebuilt params bake at build.
      ...vacancyCacheOptions,
    });
    if (data) return data;
    if (response?.status === 404) return null;
    throw new Error(
      `Failed to load vacancy "${slug}" in ${locale} (${response ? `status ${response.status}` : "network error"})`
    );
  }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const vacancy = await fetchVacancy(slug, resolved);
  // Explicit noindex, matching /publications/[slug]: the robots backstop keeps
  // a retired role unindexable even if a streaming boundary pins the status at
  // 200 and turns the 404 into a soft-404.
  const t = translator(messagesFor(resolved), resolved);
  if (!vacancy)
    return { title: t("meta.vacancy.notFound"), robots: { index: false } };
  return pageMetadata({
    title: t("meta.vacancy.title", { title: vacancy.title }),
    description: vacancy.summary,
    path: `/hiring/${vacancy.slug}`,
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const vacancy = await fetchVacancy(slug, resolved);
  if (!vacancy) notFound();
  return <VacancyView locale={resolved} vacancy={vacancy} />;
}
