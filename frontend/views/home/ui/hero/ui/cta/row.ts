// The hero CTA row's shared vocabulary — its three weights and where it sits.
//
// The shapes are the section's established buttons (square, mono-tech label);
// only the roles moved in #198 — the light fill is the one primary, the outline
// the secondary, the text link the tertiary — so the three read as one ladder
// rather than three buttons.
const BASE =
  "inline-flex items-center font-mono-tech text-xs tracking-widest uppercase rounded-none transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const PRIMARY = `${BASE} bg-ink text-brand hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 px-8 py-6`;

export const SECONDARY = `${BASE} bg-transparent text-ink border border-ink/40 hover:bg-ink hover:text-brand hover:scale-105 active:scale-95 px-8 py-6`;

export const TEXT_LINK = `${BASE} text-ink/70 hover:text-primary-ink underline-offset-4 hover:underline px-2 py-3`;

/** How the row sits in its hero: centred (variant A) or leading (variant B). */
export type HeroCtaAlign = "center" | "start";
