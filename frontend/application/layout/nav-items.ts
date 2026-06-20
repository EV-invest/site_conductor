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
