import type { MetadataRoute } from "next";
import { localePath } from "@evinvest/i18n";
import { SITE, ROUTES } from "@/shared/config/site";
import { INDEXED_LOCALES } from "@/shared/config/i18n";
import { ASSETS } from "@/shared/config/assets";
import { allPublications } from "@/entities/publication";
import { listVacancies, vacancyCacheOptions } from "@/entities/vacancy";

// Driven off shared/config ROUTES (adding a subpage = one list entry) plus the
// static research articles and the live vacancy detail pages, fetched at build
// so each role is indexable. ISR (not force-static) so newly published roles
// enter the sitemap without a redeploy; the backend being unreachable degrades
// to the static routes only. No <lastmod>: we have no real per-URL change
// dates, and an always-now stamp teaches Google to distrust the field.
export const revalidate = 3600;

// Sitemap requires absolute URLs.
const abs = (path: string) =>
  path.startsWith("http") ? path : new URL(path, SITE.url).toString();

// Real <img>-able homepage art surfaced to Google's image index (feeds the
// thumbnail row). CSS-background images are NOT indexed, so list the asset URLs.
const HOME_IMAGES = [
  ASSETS.quynhon_future,
  ASSETS.luxury_villa,
  ASSETS.abstract_investment,
  "/assets/EV_Investment_office.jpg",
].map(abs);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(route => ({
    url: route.path === "/" ? SITE.url : abs(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    // hreflang, one entry per indexable locale, each pointing at that locale's
    // OWN url. The previous block mapped every locale to the same href, which
    // tells Google the languages are interchangeable — worse than omitting it.
    // Stays absent while only English is indexed: a single-entry hreflang set is
    // meaningless.
    ...(INDEXED_LOCALES.length > 1
      ? {
          alternates: {
            languages: Object.fromEntries(
              INDEXED_LOCALES.map(l => [l, abs(localePath(l, route.path))])
            ),
          },
        }
      : {}),
    ...(route.path === "/" ? { images: HOME_IMAGES } : {}),
  }));

  // The whitepaper is excluded on purpose: it mounts in a shadow root, so its
  // text is not in the SSR HTML and it is not a meaningful indexable target —
  // same reasoning as its absence from ROUTES (shared/config/site.ts).
  const articleEntries: MetadataRoute.Sitemap = allPublications()
    .filter(publication => publication.kind !== "whitepaper")
    .map(publication => ({
      url: abs(`/publications/${publication.slug}`),
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  // Live vacancy detail pages. Degrade to static routes only if unreachable.
  let vacancyEntries: MetadataRoute.Sitemap = [];
  try {
    const { data } = await listVacancies(vacancyCacheOptions);
    vacancyEntries = (data ?? []).map(vacancy => ({
      url: abs(`/hiring/${vacancy.slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    vacancyEntries = [];
  }

  return [...staticEntries, ...articleEntries, ...vacancyEntries];
}
