// Single source of truth for site-wide identity + SEO data. Every SEO surface
// (metadata.ts, robots.ts, sitemap.ts, manifest.ts, the JSON-LD graph, the OG
// image) reads from here, so adding a locale or a subpage is a one-line edit.
// App-agnostic config → lives in `shared/config` beside const/assets/experiments.

// Canonical production origin. Set NEXT_PUBLIC_SITE_URL in the deploy env
// (https, NO trailing slash, pick www-or-not once). The `.example` fallback is
// a deliberately invalid placeholder so a missing env can never silently ship a
// wrong canonical domain — it stands out in robots.txt / sitemap.xml / JSON-LD.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://evinvest.example"
).replace(/\/+$/, "");

export const SITE = {
  url: SITE_URL,
  name: "EV Investment",
  alternateName: "Quy Nhon Fund",
  tagline: "Premium Real Estate Fund",
  // ~155 chars, leads with value + place; reused as the default meta
  // description and the Organization / WebSite description.
  description:
    "EV Investment is a Quy Nhon–based real-estate fund developing premium coastal property in Vietnam, open to international investors via bank transfer or crypto.",
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
    streetAddress: "102 An Duong Vuong St, Nguyen Van Cu Ward",
    addressLocality: "Quy Nhon",
    addressRegion: "Binh Dinh",
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
// Indexable URLs for the sitemap (and future nav). Single-page today; pushing a
// real subpage here makes it sitemap-listed and sitelink-eligible with no other
// change. The homepage in-page sections (#portfolio, #research…) are NOT separate
// URLs and intentionally not listed.
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
];
