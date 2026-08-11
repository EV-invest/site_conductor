// Motion tokens — the design-system half of `motion`. Every animation on this
// surface picks its curve and duration from here, the same way colour picks
// from `ev/color`: one place to retune the feel of the whole site, and no
// per-component easing invented on the spot.
//
// The house curve is a strong ease-out. Institutional motion decelerates into
// place — it never overshoots, bounces, or draws attention to itself.

/** Cubic-bezier control points, in the shape `motion` wants them. */
export const EASE = {
  /** Default. Fast start, long settle — used for every entrance. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric; for state changes that reverse (open ⇄ close). */
  inOut: [0.65, 0, 0.35, 1],
  /** Exits: leave quickly, don't linger. */
  in: [0.55, 0, 1, 0.45],
} as const;

/** Seconds. Anything longer than `slow` reads as the page being stuck. */
export const DUR = {
  fast: 0.22,
  base: 0.45,
  slow: 0.7,
} as const;

/** Pixels a revealing element travels. Small — the fade carries the effect. */
export const RISE = 16;

/**
 * Seconds between siblings in a staggered group. Tuned so a 4-up grid finishes
 * within `DUR.slow` of its first child: past ~8 items, prefer two groups over a
 * longer tail.
 */
export const STAGGER = 0.07;

/** Per-token delay inside a split headline — tighter than a card stagger. */
export const STAGGER_TEXT = 0.045;

/**
 * The viewport margin that triggers a scroll reveal: fire slightly *before* the
 * element is fully on screen so the motion has finished by the time the reader's
 * eye arrives. A reveal the reader watches start is a reveal that felt slow.
 */
export const VIEWPORT = { once: true, margin: "-80px" } as const;
