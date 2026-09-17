import type { Translate } from "@evinvest/i18n";

// The services a client's money actually touches, in the order the trust bar
// reads them: custody and identity first (the two external counterparties),
// then the way in (sign-in), the money itself (the stablecoin and its network),
// the ledger every balance lives on, and where the client-facing code is
// developed. Our own infrastructure — runtime, databases, orchestration,
// observability — is deliberately NOT here: a client relies on it, but never
// interacts with it, and naming it says nothing a client can verify.
//
// Marks are vendored under `frontend/assets/partners/` and reach
// `/assets/partners/*.svg` through the flake's `cp -rL assets/. public/assets/`
// — the same pipeline as every other image on the site, so there is nothing to
// register and nothing to add to `flake.nix`.
//
// Every glyph is a 24x24 single-path mark: Google, Tether and GitHub from
// simple-icons (CC0-1.0); TRON from spothq/cryptocurrency-icons (CC0-1.0, the
// same path the cabinet draws beside a TRC20 address — simple-icons dropped it);
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
  /** What the vendor does for the client, resolved through the catalogue. */
  role: string;
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

// Roles arrive resolved rather than as keys, the same way `entities/team` does
// it: the row is the only renderer, and a key on the model would just move the
// lookup one file over.
export const partners = (t: Translate): readonly Partner[] => [
  {
    name: "Turnkey",
    role: t("home.partners.role.custody", "Custody"),
    mark: { src: `${DIR}/turnkey.svg`, shape: "wordmark" },
  },
  { name: "Didit", role: t("home.partners.role.identity", "Identity") },
  {
    name: "Google",
    role: t("home.partners.role.signIn", "Sign-in"),
    mark: glyph("google"),
  },
  {
    name: "Tether",
    role: t("home.partners.role.stablecoin", "Stablecoin"),
    mark: glyph("tether"),
  },
  {
    name: "TRON",
    role: t("home.partners.role.network", "Network"),
    mark: glyph("tron"),
  },
  {
    name: "TigerBeetle",
    role: t("home.partners.role.ledger", "Ledger"),
  },
  {
    name: "GitHub",
    role: t("home.partners.role.openSource", "Open source"),
    mark: glyph("github"),
  },
];
