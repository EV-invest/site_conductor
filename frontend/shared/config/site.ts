// Single source of truth for site-wide identity + SEO data. Every SEO surface
// (metadata.ts, robots.ts, sitemap.ts, manifest.ts, the JSON-LD graph, the OG
// image) reads from here, so adding a locale or a subpage is a one-line edit.
// App-agnostic config → lives in `shared/config` beside const/assets/experiments.

import { config } from "@/config";

// Canonical production origin (https, NO trailing slash, pick www-or-not once).
// Only the production image build exports NEXT_PUBLIC_SITE_URL; every other
// launch (the flake dev run, a bare `next dev`) omits it, so fall back to the
// obvious placeholder rather than failing — going live means setting the var.
export const SITE_URL = (config.public.siteUrl ?? "https://evinvest.example").replace(/\/+$/, "");

export const SITE = {
  url: SITE_URL,
  name: "EV Investment",
  alternateName: "Quy Nhon Fund",
  tagline: "Invest in China+1 Narrative",
  // Reused as the default meta description, the Organization / WebSite
  // description, and the OG image alt.
  description:
    "Through Vietnam, with Quy-Nhon based fund, - we have direct pulse on Real Estate and tourist flows. Follow the money.",
  // Brand palette (mirrors @evinvest/uikit tokens). manifest theme_color and the
  // generated OG/icon art use raw hex (manifest forbids oklch).
  theme: {
    black: "#070d18",
    surface: "#081020",
    mist: "#e6e1d3",
    accent: "#2a9d8f",
    brand: "#001e4e",
  },
  // i18n-ready: while `locales` is length-1 the metadata + sitemap layers emit
  // NO hreflang (a lone self/x-default cluster is risk without benefit). Add a
  // locale here + a messages layer to light up `alternates.languages` everywhere.
  defaultLocale: "en",
  locales: ["en"] as const,
  // Funding rails — feeds FinancialService.paymentAccepted + on-page copy.
  paymentAccepted: ["Bank transfer (SWIFT)", "Cryptocurrency"],
  // Optional social/X handle for twitter:site (e.g. "@evinvest"). Empty = omitted.
  twitterHandle: "",
  // TODO(owner): fill from real records — these feed Organization JSON-LD trust
  // fields. Any left undefined/empty are simply omitted downstream (never faked).
  legalName: "" as string,
  foundingDate: "" as string, // ISO 8601, e.g. "2021-03-01"
  email: "" as string, // e.g. "invest@<domain>"
  // sameAs — the bridge to Google's Knowledge Graph. Add LinkedIn / Crunchbase / X.
  sameAs: [] as string[],
} as const;

// ── Offices ────────────────────────────────────────────────────────────────
// Two physical locations (LocalBusiness JSON-LD + footer NAP). Keep byte-identical
// with the footer copy so NAP stays consistent across the page and structured data.
export type Office = {
  id: string;
  name: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
  addressCountry: string; // ISO 3166-1 alpha-2
  telephone?: string; // +84 E.164  — TODO(owner)
  geo?: { lat: number; lng: number }; // ≥5 decimals — TODO(owner)
};

export const OFFICES: Office[] = [
  {
    id: "quynhon",
    name: "Quy Nhon Head Office",
    streetAddress: "01 Nguyễn Tất Thành",
    addressLocality: "Quy Nhơn",
    addressRegion: "Gia Lai",
    postalCode: "590000",
    addressCountry: "VN",
  },
  {
    id: "hcmc",
    name: "Ho Chi Minh Representative",
    streetAddress: "Deutsches Haus, 33 Le Duan Blvd, District 1",
    addressLocality: "Ho Chi Minh City",
    addressRegion: "Ho Chi Minh",
    addressCountry: "VN",
  },
];

// ── Routes ───────────────────────────────────────────────────────────────────
// Indexable URLs for the sitemap (and the footer sitemap nav). Pushing a new
// subpage here makes it sitemap-listed and sitelink-eligible with no other
// change. The homepage in-page sections (#portfolio, #research…) are NOT separate
// URLs and intentionally not listed; neither are noindexed surfaces
// (/apps/*). /hiring/[slug] and /blogs/[slug] detail entries
// are added in app/sitemap.ts.
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type Route = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

export const ROUTES: Route[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/team", changeFrequency: "monthly", priority: 0.8 },
  { path: "/hiring", changeFrequency: "weekly", priority: 0.8 },
  // The research hub: its articles are light-DOM document MFEs read off disk on
  // the server, so (unlike /whitepaper) the text IS in the SSR HTML.
  { path: "/blogs", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  // NB: /whitepaper is intentionally NOT listed. Its body mounts in a shadow root
  // (a client-side document microfrontend), so the page text isn't in the SSR HTML
  // and isn't a meaningful indexable target — don't advertise it as one. Making it
  // SSR-indexable would mean rendering it light-DOM with its self-styles scoped.
];
