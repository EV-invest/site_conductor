import { localePath, type Locale } from "@evinvest/i18n";

import type { Translate } from "@evinvest/i18n";
import type { HeaderAuthLinks } from "./header-shared";

// One entry's label, deferred until a translator exists. A plain string would
// force the catalogue key back out of the call site, which is what the inline
// English exists to avoid; a `(t) => t(key, english)` thunk keeps both halves
// here beside the href they belong to.
export interface NavEntry {
  label: (t: Translate) => string;
  href: string;
}

// Header navigation — single source for desktop + mobile menus, on conductor
// pages and in the zone-injected shell fragment (scripts/build-shell.mts) alike.
// Portfolio / Research are root-relative anchors to the homepage sections (so
// they work from any route, then scroll); Publications / Team / Hiring /
// Contact are dedicated pages. The brand logo links home. The cabinet entries
// are rendered separately: the static signed-out pair from `authLinks` below
// (header-cta.tsx), the signed-in chip from account-chip-remote.tsx.
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
  heading: (t: Translate) => string;
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
  t: Translate
): { label: string; href: string }[] {
  return items.map(item => ({
    label: item.label(t),
    href: localePath(locale, item.href),
  }));
}

// The signed-out pair's targets, one place for both hosts (the conductor's
// <Header> and the zone fragment in scripts/build-shell.mts). Hard cross-zone
// hrefs (PATTERNS §9): the cabinet root for a newcomer, its sign-in page for a
// returning investor. Both labels are capped at 20 characters (i18n-max) — the
// primary shares the bar with the burger below `sm`, where a longer label
// overflows a 320px viewport in German.
export function authLinks(locale: Locale, t: Translate): HeaderAuthLinks {
  return {
    openAccount: {
      href: localePath(locale, "/cabinet"),
      label: t("header.openAccount", "Open an account"),
    },
    cabinet: {
      href: localePath(locale, "/cabinet/login"),
      label: t("header.cabinet", "Cabinet"),
    },
  };
}
