// `article` entity — the research-article catalogue, single source of truth
// for /blogs, /blogs/[slug], and the sitemap entries.
//
// TODO: generalize — hardcoded; should come from the blog flake build (the
// same builds that ship the /blogs/<slug>.{dark,light}.html documents).
export type Article = {
  slug: string;
  title: string;
  /// Display date, e.g. "May 2026".
  date: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "vietnam_coastal_2026",
    title: "Vietnam Coastal Macro Report 2026",
    date: "May 2026",
  },
  {
    slug: "vietnam_tail_risk",
    title: "Vietnam Tail Risk Analysis",
    date: "April 2026",
  },
  {
    slug: "hospitality_yield_shifts",
    title: "Post-Pandemic Hospitality Yield Shifts",
    date: "March 2026",
  },
];

// `undefined` (not a slug fallback) so an uncatalogued slug is a hard miss
// callers must handle — never a silently rendered soft-404 (#105).
export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug);
}
