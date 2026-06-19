import type { MetadataRoute } from "next";
import { SITE, ROUTES } from "@/shared/config/site";
import { ASSETS } from "@/shared/config/assets";

// Static route — no request data, so statically generated despite the dynamic
// page. Driven off shared/config ROUTES so adding a subpage = one list entry.
export const dynamic = "force-static";

// Sitemap requires absolute URLs.
const abs = (path: string) =>
  path.startsWith("http") ? path : new URL(path, SITE.url).toString();

// Real <img>-able homepage art surfaced to Google's image index (feeds the
// thumbnail row). CSS-background images are NOT indexed, so list the asset URLs.
const HOME_IMAGES = [
  ASSETS.quynhon_future,
  ASSETS.luxury_villa,
  ASSETS.abstract_investment,
  "/assets/EV_Investment_office.png",
].map(abs);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(route => ({
    url: route.path === "/" ? SITE.url : abs(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    // hreflang block stays empty while English-only; lights up automatically
    // once SITE.locales gains a second entry (see shared/config/site.ts).
    ...(SITE.locales.length > 1
      ? {
          alternates: {
            languages: Object.fromEntries(
              SITE.locales.map(l => [l, abs(route.path)])
            ),
          },
        }
      : {}),
    ...(route.path === "/" ? { images: HOME_IMAGES } : {}),
  }));
}
