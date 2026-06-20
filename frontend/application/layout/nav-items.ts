// Header navigation — single source for desktop + mobile menus.
// Portfolio / Terminal / Research are root-relative anchors to the homepage
// sections (so they work from any route, then scroll); Team / Careers / Contact
// are dedicated pages. The Investor Portal CTA is rendered separately (it points
// at a separate app via NEXT_PUBLIC_OAUTH_PORTAL_URL — see investor-portal-button).
export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Terminal", href: "/#calculator" },
  { label: "Research", href: "/#research" },
  { label: "Team", href: "/team" },
  { label: "Careers", href: "/hiring" },
  { label: "Contact", href: "/contact" },
] as const;
