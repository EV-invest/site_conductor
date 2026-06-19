import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVacancy, type VacancyDetail } from "@/entities/vacancy";
import { VacancyView } from "@/views/vacancy";

export const dynamic = "force-dynamic";

// Deduped within a request, so generateMetadata and the page share one fetch.
// `null` means a genuine 404 (role missing); a network/5xx failure throws so the
// 500 boundary (app/error.tsx) renders instead of a misleading "not found".
const fetchVacancy = cache(async (slug: string): Promise<VacancyDetail | null> => {
  const { data, response } = await getVacancy({ path: { slug } });
  if (data) return data;
  if (response?.status === 404) return null;
  throw new Error(`Failed to load vacancy "${slug}" (${response ? `status ${response.status}` : "network error"})`);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await fetchVacancy(slug);
  if (!vacancy) return { title: "Role not found" };
  return {
    title: `${vacancy.title} — Careers`,
    description: vacancy.summary,
    alternates: { canonical: `/hiring/${vacancy.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vacancy = await fetchVacancy(slug);
  if (!vacancy) notFound();
  return <VacancyView vacancy={vacancy} />;
}
