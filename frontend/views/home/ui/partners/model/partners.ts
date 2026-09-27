// The services a client's money actually touches, in the order the trust bar
// reads them: custody and identity first (the two external counterparties),
// then the way in (sign-in), the ledger every balance lives on, where the
// client-facing code is developed, and the two services that watch it run —
// errors and product analytics. Our own infrastructure — runtime, databases,
// orchestration — is deliberately NOT here: a client relies on it, but never
// interacts with it, and naming it says nothing a client can verify.
//
// No coin and no network: the landing says "crypto today, fiat to follow"
// and leaves the rails to the cabinet (owner feedback, 2026-09-18).
//
// Marks are vendored under `frontend/assets/partners/` and reach
// `/assets/partners/*.svg` through the flake's `cp -rL assets/. public/assets/`
// — the same pipeline as every other image on the site, so there is nothing to
// register and nothing to add to `flake.nix`.
//
// Every glyph is a 24x24 single-path mark from simple-icons (CC0-1.0);
// `turnkey.svg` is Turnkey's own wordmark.
//
// The list lives here rather than in `shared/config/assets.ts` on purpose:
// `ASSETS` is a flat lookup of individually-addressed section art, whereas the
// membership of this list *is* the data. Splitting names from paths across two
// files would let a logo outlive its entry.

const DIR = "/assets/partners";

/**
 * How a mark is drawn. The two shapes differ in aspect ratio, and a wordmark
 * already spells the vendor out — so it stands in for the text label instead of
 * sitting next to a duplicate of itself.
 */
type MarkShape = "glyph" | "wordmark";

interface Mark {
  src: string;
  shape: MarkShape;
}

export interface Partner {
  /** A proper noun. Vendor names are never translated. */
  name: string;
  /**
   * Absent when there is no mask-safe SVG for the vendor, in which case the item
   * renders its name alone. This is a supported state rather than a fallback:
   * Didit's official mark embeds a PNG, which a CSS mask cannot use, and
   * TigerBeetle has no flat mark in any CC0 set — both ship as a name until a
   * flat file exists.
   */
  mark?: Mark;
}

const glyph = (file: string): Mark => ({
  src: `${DIR}/${file}.svg`,
  shape: "glyph",
});

// Names only — the caption under each mark ("Custody", "Identity", …) went
// with the owner's 2026-09-18 pass: the intro already pairs every vendor with
// its job, and a second, smaller line under the logo made the bar read as a
// table. With nothing to translate, the list is a constant.
export const partners: readonly Partner[] = [
  { name: "Turnkey", mark: { src: `${DIR}/turnkey.svg`, shape: "wordmark" } },
  { name: "Didit" },
  { name: "Google", mark: glyph("google") },
  { name: "TigerBeetle" },
  { name: "GitHub", mark: glyph("github") },
  { name: "Sentry", mark: glyph("sentry") },
  { name: "PostHog", mark: glyph("posthog") },
];
