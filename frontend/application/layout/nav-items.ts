// Header navigation — single source for desktop + mobile menus, on conductor
// pages and in the zone-injected shell fragment (scripts/build-shell.mts) alike.
// Portfolio / Research are root-relative anchors to the homepage sections (so
// they work from any route, then scroll); Blogs / Team / Hiring / Contact are
// dedicated pages. The brand logo links home. The account chip CTA is rendered
// separately
// (application/layout/account-chip-remote.tsx).
export const NAV_ITEMS = [
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Research", href: "/#research" },
  { label: "Blogs", href: "/blogs" },
  { label: "Team", href: "/team" },
  { label: "Hiring", href: "/hiring" },
  { label: "Contact", href: "/contact" },
] as const;

// Footer sitemap columns (issue #34). Company = dedicated pages; Explore =
// homepage sections + research surfaces. Crawlable internal links from every
// page, so each destination is one hop from anywhere on the site.
export const FOOTER_NAV = [
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Team", href: "/team" },
      { label: "Hiring", href: "/hiring" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Portfolio", href: "/#portfolio" },
      { label: "Investment Calculator", href: "/#calculator" },
      { label: "Research Articles", href: "/blogs" },
      { label: "Whitepaper", href: "/whitepaper" },
    ],
  },
] as const;
