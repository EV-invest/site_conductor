// Header navigation — single source for desktop + mobile menus.
// Portfolio / Research are root-relative anchors to the homepage sections (so
// they work from any route, then scroll); Team / Hiring / Contact are dedicated
// pages. The brand logo links home. The Investor Portal CTA is rendered
// separately (it points at a separate app via NEXT_PUBLIC_OAUTH_PORTAL_URL —
// see investor-portal-button).
export const NAV_ITEMS = [
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Research", href: "/#research" },
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
