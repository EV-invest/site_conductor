import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getVacancy,
  listVacancies,
  type VacancyDetail,
} from "@/entities/vacancy";
import { VacancyView } from "@/views/vacancy";

// SSG: every role known at build time is prerendered (instant load + static,
// indexable metadata). `dynamicParams` keeps unknown/just-published slugs
// working — they render on demand behind loading.tsx, then ISR-cache for an hour.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { data } = await listVacancies();
    return (data ?? []).map(vacancy => ({ slug: vacancy.slug }));
  } catch {
    // Backend unreachable at build — fall back to fully on-demand rendering.
    return [];
  }
}

// Deduped within a request, so generateMetadata and the page share one fetch.
// `null` means a genuine 404 (role missing); a network/5xx failure throws so the
// 500 boundary (app/error.tsx) renders instead of a misleading "not found".
const fetchVacancy = cache(
  async (slug: string): Promise<VacancyDetail | null> => {
    const { data, response } = await getVacancy({
      path: { slug },
      // ISR: on-demand (non-prebuilt) roles cache for the segment's hour
      // instead of re-fetching every request. Prebuilt params bake at build.
      cache: "force-cache",
    });
    if (data) return data;
    if (response?.status === 404) return null;
    throw new Error(
      `Failed to load vacancy "${slug}" (${response ? `status ${response.status}` : "network error"})`
    );
  }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await fetchVacancy(slug);
  if (!vacancy) return { title: "Role not found" };
  return {
    title: `${vacancy.title} — Careers`,
    description: vacancy.summary,
    alternates: { canonical: `/hiring/${vacancy.slug}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vacancy = await fetchVacancy(slug);
  if (!vacancy) notFound();
  return <VacancyView vacancy={vacancy} />;
}
