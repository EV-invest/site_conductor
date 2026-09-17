import { buttonVariants, type ButtonSize } from "@evinvest/uikit";

// The hero CTA row's shared vocabulary — its three weights and where it sits.
//
// Every weight is a uikit button; what lives here is only the hero's delta on
// top of `buttonVariants`: the section's square, mono-tech, light-filled look.
// Only the roles moved in #198 — the light fill is the one primary, the
// outline the secondary, the text link the tertiary — so the three read as one
// ladder rather than three buttons.
const HERO = "font-mono-tech text-xs tracking-widest uppercase rounded-none";

/** `xl` is the one size without a fixed height, so the hero padding can win. */
export const SIZE: ButtonSize = "xl";

/** `className` for `<Button variant="primary" size={SIZE}>`. */
export const PRIMARY = `${HERO} bg-ink text-brand hover:bg-primary hover:text-on-primary px-8 py-6`;

/** `className` for `<Button variant="outline" size={SIZE}>`. */
export const SECONDARY = `${HERO} border-ink-soft shadow-none text-ink hover:bg-ink hover:text-brand px-8 py-6`;

/** The full class string for a plain `<Link>` wearing the link weight. */
export const TEXT_LINK = buttonVariants({
  variant: "link",
  size: SIZE,
  className: `${HERO} text-ink-mid hover:text-primary-ink px-2 py-3`,
});

/** How the row sits in its hero: centred (variant A) or leading (variant B). */
export type HeroCtaAlign = "center" | "start";
