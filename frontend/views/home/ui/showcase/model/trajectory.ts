// The arithmetic behind the showcase chart. Pure, React-free and exported so
// the curve, the axis labels and the headline multiple all read from ONE source
// — a chart whose drawn line and printed figure can disagree is worse than no
// chart at all.
//
// Nothing here is a claim about realised performance. The single input is the
// fund's published underwriting target (the same 16.4% the hero ribbon shows);
// everything else is that number compounded. The section says so in copy, and
// `home.showcase.disclaimer` carries it into the markup.

/** The fund's published target IRR, as a rate. Hero: "16.4% +". */
export const TARGET_IRR = 0.164;

/**
 * The same rate as a percentage, for display. Rounded on the way out because
 * `0.164 * 100` is `16.400000000000002` in binary floating point, and a fund's
 * headline figure rendering as 16.4000000000000021% is not a rounding nit.
 */
export const TARGET_IRR_PCT = Math.round(TARGET_IRR * 1000) / 10;

/** Underwriting horizon for a coastal asset, in years. */
export const HOLD_YEARS = 5;

/** Multiple of invested capital at the end of each year, starting at ×1.00. */
export const TRAJECTORY: readonly number[] = Array.from(
  { length: HOLD_YEARS + 1 },
  (_, year) => (1 + TARGET_IRR) ** year
);

/** Where the curve lands — ×2.14 at the published target. */
export const EXIT_MULTIPLE = TRAJECTORY[HOLD_YEARS];

/** Gridlines the reader gets a ruler from. The exit marker is drawn separately. */
export const GRIDLINES: readonly number[] = [1, 1.5];

// ── Geometry ────────────────────────────────────────────────────────────────
//
// One viewBox, uniformly scaled (`preserveAspectRatio` left at its default), so
// a percentage of the SVG's box is the same percentage of the rendered element.
// That is what lets the axis labels live in HTML — real, selectable, unscaled
// text — while staying pinned to the gridlines they name. Positions come from
// `atX`/`atY` below, so labels cannot drift from the geometry they annotate.

export const VIEW = { w: 720, h: 340 } as const;

/**
 * Gutters. `right` reserves room for the HTML value labels beside the plot, and
 * is sized off the *narrowest* case rather than the prettiest: the labels are
 * unscaled DOM text, so the gutter's width in real pixels shrinks with the
 * viewport while "×2.14" stays ~44px. At 92 the exit label sat on top of its own
 * marker on a phone.
 */
const PAD = { top: 30, right: 112, bottom: 40, left: 12 } as const;

/** Headroom above the exit multiple and below ×1.00, so neither touches an edge. */
const DOMAIN = { min: 0.85, max: 2.3 } as const;

const PLOT = {
  left: PAD.left,
  right: VIEW.w - PAD.right,
  top: PAD.top,
  bottom: VIEW.h - PAD.bottom,
} as const;

/** Two decimals is below a device pixel here and keeps the path attribute short. */
const round = (n: number) => Math.round(n * 100) / 100;

/** Year index → x, in viewBox units. */
export const x = (year: number) =>
  round(PLOT.left + (year / HOLD_YEARS) * (PLOT.right - PLOT.left));

/** Capital multiple → y, in viewBox units. */
export const y = (multiple: number) =>
  round(
    PLOT.bottom -
      ((multiple - DOMAIN.min) / (DOMAIN.max - DOMAIN.min)) *
        (PLOT.bottom - PLOT.top)
  );

/** Fraction of the SVG box, for an HTML label positioned over the chart. */
export const atX = (year: number) => `${round((x(year) / VIEW.w) * 100)}%`;
export const atY = (multiple: number) =>
  `${round((y(multiple) / VIEW.h) * 100)}%`;

/** The plot's own edges, for the axis rule, the gridlines and the area baseline. */
export const AXIS_Y = PLOT.bottom;
export const PLOT_TOP = PLOT.top;

/**
 * The axis line as a percentage of the SVG box, for the year labels below it.
 * They are offset off this by a fixed pixel translate rather than by a few more
 * percent: a percentage offset shrinks with the chart, and on a phone the
 * labels would sit on top of the axis they annotate.
 */
export const AXIS_PCT = `${round((AXIS_Y / VIEW.h) * 100)}%`;
export const YEARS = Array.from({ length: HOLD_YEARS + 1 }, (_, i) => i);

/**
 * Catmull-Rom through the points, converted to cubic Béziers. A polyline would
 * read as five discrete quarters rather than one compounding curve; a quadratic
 * fit would smooth the early years into a straight line and hide the convexity
 * that is the entire point of the picture.
 */
function smooth(points: readonly { x: number; y: number }[]): string {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    // Clamp at both ends: the first and last segments reuse their own endpoint
    // as the missing neighbour, which keeps the tangent from flaring outward.
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const POINTS = TRAJECTORY.map((multiple, year) => ({
  x: x(year),
  y: y(multiple),
}));

/** The curve itself. */
export const LINE_PATH = smooth(POINTS);

/** The same curve closed down to the axis, for the gradient fill beneath it. */
export const AREA_PATH = `${LINE_PATH} L ${x(HOLD_YEARS)} ${AXIS_Y} L ${x(0)} ${AXIS_Y} Z`;
