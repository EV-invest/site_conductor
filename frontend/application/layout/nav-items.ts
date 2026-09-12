import { localePath, type Locale } from "@evinvest/i18n";

import type { T } from "@/shared/config/i18n";

// One entry's label, deferred until a translator exists. A plain string would
// force the catalogue key back out of the call site, which is what the inline
// English exists to avoid; a `(t) => t(key, english)` thunk keeps both halves
// here beside the href they belong to.
export interface NavEntry {
  label: (t: T) => string;
  href: string;
}

// Header navigation — single source for desktop + mobile menus, on conductor
// pages and in the zone-injected shell fragment (scripts/build-shell.mts) alike.
// Portfolio / Research are root-relative anchors to the homepage sections (so
// they work from any route, then scroll); Publications / Team / Hiring /
// Contact are dedicated pages. The brand logo links home. The account chip CTA
// is rendered separately (application/layout/account-chip-remote.tsx).
export const NAV_ITEMS: readonly NavEntry[] = [
  { label: t => t("nav.portfolio", "Portfolio"), href: "/#portfolio" },
  { label: t => t("nav.research", "Research"), href: "/#research" },
  { label: t => t("nav.publications", "Publications"), href: "/publications" },
  { label: t => t("nav.team", "Team"), href: "/team" },
  { label: t => t("nav.hiring", "Hiring"), href: "/hiring" },
  { label: t => t("nav.contact", "Contact"), href: "/contact" },
];

// Footer sitemap columns (issue #34). Company = dedicated pages; Explore =
// homepage sections + research surfaces. Crawlable internal links from every
// page, so each destination is one hop from anywhere on the site.
export const FOOTER_NAV: readonly {
  heading: (t: T) => string;
  links: readonly NavEntry[];
}[] = [
  {
    heading: t => t("footer.company", "Company"),
    links: [
      { label: t => t("nav.home", "Home"), href: "/" },
      { label: t => t("nav.team", "Team"), href: "/team" },
      { label: t => t("nav.hiring", "Hiring"), href: "/hiring" },
      { label: t => t("nav.contact", "Contact"), href: "/contact" },
    ],
  },
  {
    heading: t => t("footer.explore", "Explore"),
    links: [
      { label: t => t("nav.portfolio", "Portfolio"), href: "/#portfolio" },
      {
        label: t => t("footer.calculator", "Investment Calculator"),
        href: "/#calculator",
      },
      {
        label: t => t("footer.fieldNotes", "Field Notes & Research"),
        href: "/publications",
      },
      {
        label: t => t("footer.whitepaper", "Whitepaper"),
        href: "/publications/whitepaper",
      },
    ],
  },
];

// One place that turns the nav into what a given locale renders: translated
// label + locale-prefixed href. Without the href half, a reader on /ru/
// clicking "Команда" would land on the English /team.
export function localizeNav(
  items: readonly NavEntry[],
  locale: Locale,
  t: T
): { label: string; href: string }[] {
  return items.map(item => ({
    label: item.label(t),
    href: localePath(locale, item.href),
  }));
}
