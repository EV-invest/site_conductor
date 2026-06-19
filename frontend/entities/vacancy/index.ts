// `vacancy` entity — the domain-facing surface over the generated API client.
//
// The transport (typed SDK functions, request/response types) is generated from
// the backend contract under @/shared/api. This slice re-exports it under stable
// domain names so feature/view code depends on "the vacancy entity" rather than
// reaching into shared/api directly. The backend owns the data; keep the
// generated layer untouched.
export { type VacancySummary, type VacancyDetail, listVacancies, getVacancy } from "@/shared/api";

/// Filter facets for the board, mirroring the backend `VacancyCategory`. The
/// "All" pseudo-facet is UI-only (no category filter sent).
export const VACANCY_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "investment", label: "Investment" },
  { key: "development", label: "Development" },
  { key: "advisory", label: "Advisory" },
  { key: "operations", label: "Operations" },
] as const;

export type VacancyCategoryKey = (typeof VACANCY_CATEGORIES)[number]["key"];
