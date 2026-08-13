// `vacancy` entity — the domain-facing surface over the generated API client.
//
// The transport (typed SDK functions, request/response types) is generated from
// the backend contract under @/shared/api. This slice re-exports it under stable
// domain names so feature/view code depends on "the vacancy entity" rather than
// reaching into shared/api directly. The backend owns the data; keep the
// generated layer untouched.
export {
  type VacancySummary,
  type VacancyDetail,
  listVacancies,
  getVacancy,
} from "@/shared/api";

/// Data-cache options for ISR'd vacancy fetches (hiring board, role pages,
/// sitemap). `cache: "force-cache"` alone caches the response *indefinitely* —
/// a segment-level `export const revalidate` does not reach an explicit
/// force-cache fetch — so pin the fetch's own TTL to make the hourly refresh
/// the callers promise actually happen, in step everywhere.
export const VACANCY_REVALIDATE_SECONDS = 3600;
export const vacancyCacheOptions = {
  cache: "force-cache",
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      next: { revalidate: VACANCY_REVALIDATE_SECONDS },
    }),
} as const;

/// Filter facets for the board, mirroring the backend `VacancyCategory`. The
/// "All" pseudo-facet is UI-only (no category filter sent).
///
/// `labelKey` is a catalogue key, not a label: these five facets are chrome the
/// app owns, so they translate. The vacancies themselves do NOT — title,
/// summary, location and employment type come from the backend and stay in the
/// language they were authored in until `vacancy_translations` lands (see
/// docs/i18n-persisted-content.md).
export const VACANCY_CATEGORIES = [
  { key: "all", labelKey: "hiring.category.all" },
  { key: "investment", labelKey: "hiring.category.investment" },
  { key: "development", labelKey: "hiring.category.development" },
  { key: "advisory", labelKey: "hiring.category.advisory" },
  { key: "operations", labelKey: "hiring.category.operations" },
] as const;

export type VacancyCategoryKey = (typeof VACANCY_CATEGORIES)[number]["key"];

/// Richer team labels for the board's category pill (vs. the short filter-chip
/// label). Returns the *rendered* label, so the caller passes its translator in;
/// an unrecognised category falls back to the backend's own label, which is the
/// one string here that cannot be translated ahead of time.
const TEAM_LABEL_KEYS: Record<string, string> = {
  investment: "hiring.team.investment",
  development: "hiring.team.development",
  advisory: "hiring.team.advisory",
  operations: "hiring.team.operations",
};

export function vacancyTeamLabel(
  category: string,
  fallback: string,
  t: (key: string) => string
): string {
  const key = TEAM_LABEL_KEYS[category];
  return key ? t(key) : fallback;
}
