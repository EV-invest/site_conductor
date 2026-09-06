import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, localePath, type Locale } from "@evinvest/i18n";
import { SITE, ROUTES } from "@/shared/config/site";
import { alternateLocales, hreflangAlternates } from "@/shared/seo/hreflang";
import { ASSETS } from "@/shared/config/assets";
import { allPublications } from "@/entities/publication";
import { listVacancies, vacancyCacheOptions } from "@/entities/vacancy";

// Driven off shared/config ROUTES (adding a subpage = one list entry) plus the
// static research articles and the live vacancy detail pages, fetched at build
// so each role is indexable. ISR (not force-static) so newly published roles
// enter the sitemap without a redeploy; the backend being unreachable degrades
// to the static routes only.
//
// Every entry is emitted once PER LOCALE, each carrying the full alternate set.
// Google's requirement here is explicit and is the part that gets skipped: each
// language version must appear as its own <url>, and each must annotate every
// version *including itself*. One English <url> with four alternates hanging off
// it looks equivalent and is not — the other four are then URLs Google was told
// about but never asked to index, which is how a fully translated site sits at
// one indexed locale for months.
//
// <lastmod> is emitted ONLY where a real date exists: the publications, from
// their own catalogue `date`. The static marketing routes carry none, and
// neither do the vacancies — the board projection (VacancySummary) has no
// timestamp, and only VacancyDetail carries `created_at`, which would cost one
// request per role to read. An always-now stamp on those is exactly what
// teaches Google to distrust the field, and that would cost us the accurate
// publication stamps too.
export const revalidate = 3600;

// Sitemap requires absolute URLs.
const abs = (path: string) =>
  path.startsWith("http") ? path : new URL(path, SITE.url).toString();

/// `abs`, with the homepage normalised.
///
/// `new URL("/", SITE.url)` appends the trailing slash `SITE_URL` deliberately
/// strips, so the homepage would appear as `…/` in its own hreflang set while its
/// <loc> said `…` — and a self-reference that does not match the URL it annotates
/// character for character is exactly the "no return tag" Search Console reports.
/// Both sides go through this, so they cannot disagree.
const absUrl = (path: string) => (path === "/" ? SITE.url : abs(path));

// Real <img>-able homepage art surfaced to Google's image index (feeds the
// thumbnail row). CSS-background images are NOT indexed, so list the asset URLs.
const HOME_IMAGES = [
  ASSETS.quynhon_future,
  ASSETS.luxury_villa,
  ASSETS.abstract_investment,
].map(abs);

/// One <url> per locale that is a genuine version of `path`, each annotated with
/// the whole set (hreflang built by shared/seo/hreflang.ts, so the sitemap and
/// the pages' <head> links can never disagree).
///
/// `contentLocales` narrows the set for content this repo does not translate: a
/// publication whose document is English-only yields the English URL alone,
/// which is exactly what its localised pages canonicalise to.
///
/// `entry` is a function of the locale rather than a fixed object because the
/// homepage's image list belongs to one locale only — see its call site.
const perLocale = (
  path: string,
  entry: (locale: Locale) => Omit<MetadataRoute.Sitemap[number], "url">,
  contentLocales?: readonly Locale[]
): MetadataRoute.Sitemap => {
  const languages = hreflangAlternates(path, contentLocales, absUrl);
  return alternateLocales(contentLocales).map(locale => ({
    ...entry(locale),
    url: absUrl(localePath(locale, path)),
    ...(languages ? { alternates: { languages } } : {}),
  }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = ROUTES.flatMap(route =>
    perLocale(route.path, locale => ({
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      // The art is one file serving every locale, so it is declared on the
      // default-locale homepage only. Repeating the same image URL under five
      // <url> entries does not get it indexed five times; it inflates the file
      // and asks Googlebot to re-fetch art it already has.
      ...(route.path === "/" && locale === DEFAULT_LOCALE
        ? { images: HOME_IMAGES }
        : {}),
    }))
  );

  // The whitepaper is excluded on purpose: it mounts in a shadow root, so its
  // text is not in the SSR HTML and it is not a meaningful indexable target —
  // same reasoning as its absence from ROUTES (shared/config/site.ts).
  //
  // `publication.locales` records which locales the DOCUMENT exists in (absent ⇒
  // English only), and that is what decides how many URLs a publication
  // contributes. A translated card is not enough: the body is the page.
  const articleEntries: MetadataRoute.Sitemap = allPublications()
    .filter(publication => publication.kind !== "whitepaper")
    .flatMap(publication =>
      perLocale(
        `/publications/${publication.slug}`,
        () => ({
          lastModified: publication.date,
          changeFrequency: "yearly",
          priority: 0.6,
        }),
        publication.locales ?? [DEFAULT_LOCALE]
      )
    );

  // Live vacancy detail pages. Degrade to static routes only if unreachable.
  let vacancyEntries: MetadataRoute.Sitemap = [];
  try {
    const { data } = await listVacancies(vacancyCacheOptions);
    // All five locales: the backend localises a role per request (the detail
    // route passes `query: { locale }`), so each URL is a real version.
    vacancyEntries = (data ?? []).flatMap(vacancy =>
      perLocale(`/hiring/${vacancy.slug}`, () => ({
        changeFrequency: "weekly",
        priority: 0.6,
      }))
    );
  } catch {
    vacancyEntries = [];
  }

  return [...staticEntries, ...articleEntries, ...vacancyEntries];
}
