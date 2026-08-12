import { localePath, type Locale } from "@evinvest/i18n";

// Header navigation — single source for desktop + mobile menus, on conductor
// pages and in the zone-injected shell fragment (scripts/build-shell.mts) alike.
// Portfolio / Research are root-relative anchors to the homepage sections (so
// they work from any route, then scroll); Publications / Team / Hiring /
// Contact are dedicated pages. The brand logo links home. The account chip CTA
// is rendered separately (application/layout/account-chip-remote.tsx).
// `label` stays the English string rather than becoming a bare key: it is what
// scripts/build-shell.mts renders into the zone fragment, and the zones
// (/cabinet, /rea) are not localised. `key` is the catalogue lookup used on
// conductor pages — see localizeNav below.
export const NAV_ITEMS = [
  { key: "nav.portfolio", label: "Portfolio", href: "/#portfolio" },
  { key: "nav.research", label: "Research", href: "/#research" },
  { key: "nav.publications", label: "Publications", href: "/publications" },
  { key: "nav.team", label: "Team", href: "/team" },
  { key: "nav.hiring", label: "Hiring", href: "/hiring" },
  { key: "nav.contact", label: "Contact", href: "/contact" },
] as const;

// Footer sitemap columns (issue #34). Company = dedicated pages; Explore =
// homepage sections + research surfaces. Crawlable internal links from every
// page, so each destination is one hop from anywhere on the site.
export const FOOTER_NAV = [
  {
    key: "footer.company",
    heading: "Company",
    links: [
      { key: "nav.home", label: "Home", href: "/" },
      { key: "nav.team", label: "Team", href: "/team" },
      { key: "nav.hiring", label: "Hiring", href: "/hiring" },
      { key: "nav.contact", label: "Contact", href: "/contact" },
    ],
  },
  {
    key: "footer.explore",
    heading: "Explore",
    links: [
      { key: "nav.portfolio", label: "Portfolio", href: "/#portfolio" },
      {
        key: "footer.calculator",
        label: "Investment Calculator",
        href: "/#calculator",
      },
      {
        key: "footer.fieldNotes",
        label: "Field Notes & Research",
        href: "/publications",
      },
      {
        key: "footer.whitepaper",
        label: "Whitepaper",
        href: "/publications/whitepaper",
      },
    ],
  },
] as const;

// One place that turns the canonical English nav into what a given locale
// renders: catalogue label + locale-prefixed href. Without the href half, a
// reader on /ru/ clicking "Команда" would land on the English /team.
export interface NavEntry {
  key: string;
  label: string;
  href: string;
}

export function localizeNav(
  items: readonly NavEntry[],
  locale: Locale,
  t: (key: string) => string
): NavEntry[] {
  return items.map(item => ({
    ...item,
    label: t(item.key),
    href: localePath(locale, item.href),
  }));
}
