// The vendors and infrastructure the fund actually runs on, in the order the
// trust bar reads them: the two external counterparties first (custody,
// identity), then our own stack.
//
// Marks are vendored under `frontend/assets/partners/` and reach
// `/assets/partners/*.svg` through the flake's `cp -rL assets/. public/assets/`
// — the same pipeline as every other image on the site, so there is nothing to
// register and nothing to add to `flake.nix`.
//
// Every glyph is a 24x24 mark from simple-icons (CC0-1.0 — public domain, no
// attribution obligation); `turnkey.svg` is Turnkey's own wordmark.
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
   * Didit's official mark embeds a PNG, which a CSS mask cannot use, so it ships
   * as a name until a flat file exists.
   */
  mark?: Mark;
}

const glyph = (file: string): Mark => ({
  src: `${DIR}/${file}.svg`,
  shape: "glyph",
});

export const PARTNERS: readonly Partner[] = [
  { name: "Turnkey", mark: { src: `${DIR}/turnkey.svg`, shape: "wordmark" } },
  { name: "Didit" },
  { name: "Rust", mark: glyph("rust") },
  { name: "Next.js", mark: glyph("nextdotjs") },
  { name: "PostgreSQL", mark: glyph("postgresql") },
  { name: "Redis", mark: glyph("redis") },
  { name: "Kubernetes", mark: glyph("kubernetes") },
  { name: "NixOS", mark: glyph("nixos") },
  { name: "Traefik", mark: glyph("traefikproxy") },
  { name: "Cloudflare", mark: glyph("cloudflare") },
  { name: "Prometheus", mark: glyph("prometheus") },
  { name: "Grafana", mark: glyph("grafana") },
];
