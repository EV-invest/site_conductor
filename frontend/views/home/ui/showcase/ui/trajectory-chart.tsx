"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Locale } from "@evinvest/i18n";

import {
  CountUp,
  DUR,
  EASE,
  VIEWPORT_LIVE,
  VIEWPORT_Y,
} from "@/shared/ui/motion";
import {
  AREA_PATH,
  AXIS_PCT,
  AXIS_Y,
  EXIT_MULTIPLE,
  GRIDLINES,
  HOLD_YEARS,
  LINE_PATH,
  PLOT_TOP,
  TRAJECTORY,
  VIEW,
  YEARS,
  atX,
  atY,
  x,
  y,
  yearAt,
} from "../model/trajectory";

/**
 * Seconds the plot takes to sweep left→right. Longer than a card reveal on
 * purpose — this is the one element on the page the reader is meant to watch
 * arrive, and a compounding curve only reads as compounding if the eye has time
 * to follow the slope steepening.
 */
const SWEEP = 2.1;

/** The exit marker lands as the sweep reaches it, not after it has finished. */
const MARKER_DELAY = SWEEP * 0.82;

/**
 * Width of the reveal's soft edge, in viewBox units. The mask is a rectangle
 * whose trailing edge fades out over this distance, so the chart dissolves into
 * view instead of being uncovered by a hard vertical line travelling across it.
 * At 0 this is a clip wipe again; much above ~120 the curve looks perpetually
 * out of focus.
 */
const FEATHER = 90;

/** One full travel of the pulse, then a rest. Together: one unhurried cycle. */
const PULSE_TRAVEL = 2.8;
const PULSE_REST = 2.2;

/** Radar ping on the exit marker. Slow enough to read as breathing, not blinking. */
const PING = 3;

/**
 * The compounding curve — plotted as the reader reaches it, then readable point
 * by point.
 *
 * ## The reveal is a feathered mask, not a clip
 *
 * Drawing the stroke with `pathLength: 0 → 1` animates along *arc length*, while
 * the area fill beneath it can only be revealed by *horizontal* position. Run
 * both and they desynchronise wherever the curve steepens — which, on a
 * compounding series, is exactly the right-hand half the eye is drawn to. So one
 * moving rectangle governs line, fill and nodes together.
 *
 * That rectangle is a **mask** filled with a gradient rather than a clip path:
 * its trailing edge fades over {@link FEATHER} units, which removes the hard
 * sweeping edge a clip leaves behind. Sliding the rect (rather than growing its
 * `width`) keeps the gradient locked to it, so the feather travels with the edge
 * instead of stretching.
 *
 * Note the `x` in its `initial`/`animate` is motion's transform shorthand, not
 * the SVG attribute — it compiles to `translateX`, so the sweep runs on the
 * compositor. Rewriting it as an animated `x` *attribute* would look identical
 * on the first frame and then relayout the mask sixty times a second.
 *
 * ## Two loops, both gated
 *
 * A pulse of light runs up the curve and the exit marker pings, forever — the
 * chart reads as live rather than as a static picture. Both are gated on
 * {@link VIEWPORT_LIVE} (a *repeating* observer) and on `prefers-reduced-motion`,
 * so nothing animates off-screen or for a reader who asked for stillness.
 *
 * ## Why the labels are HTML
 *
 * The viewBox scales with the container, and SVG `<text>` scales with it — on a
 * phone the axis would land near 6px. These labels are ordinary DOM positioned
 * by {@link atX}/{@link atY}, so they keep the site's type scale at every width
 * and stay selectable. Two things are load-bearing for that: `preserveAspectRatio`
 * stays at its default (uniform scaling is what makes "42% across the viewBox"
 * and "42% across the rendered box" the same place), and the positioned labels
 * share a wrapper with the `<svg>` and *nothing else* — a sibling with height of
 * its own would stretch the containing block and shift every percentage.
 */
export function TrajectoryChart({
  locale,
  alt,
  axisLabel,
  exploreLabel,
  hint,
  yearLabels,
}: {
  locale: Locale;
  /** Sentence describing the curve for a screen reader. */
  alt: string;
  /** Names the x axis, e.g. "Hold year". */
  axisLabel: string;
  /** Accessible name for the interactive group, e.g. "Explore the curve…". */
  exploreLabel: string;
  /** Visible affordance, e.g. "Hover or use ← →". */
  hint: string;
  /** One label per year, indexed by year, e.g. `["Year 0", "Year 1", …]`. */
  yearLabels: readonly string[];
}) {
  // Two instances on one page would otherwise share — and clobber — each
  // other's gradient, mask and filter ids.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const entered = useInView(ref, VIEWPORT_Y);
  const onScreen = useInView(ref, VIEWPORT_LIVE);
  const reduce = useReducedMotion();

  // Which point the reader is asking about, and where the marker rests while it
  // fades out — without `resting` the crosshair would snap back to year 0 on
  // the way out instead of fading in place.
  const [active, setActive] = useState<number | null>(null);
  const [resting, setResting] = useState(HOLD_YEARS);
  const select = useCallback((year: number | null) => {
    setActive(year);
    if (year !== null) setResting(year);
  }, []);

  // The gridline labels sit inches from the exit marker, which CountUp formats
  // through Intl. Formatting these with `toFixed` instead would print "×1.00"
  // beside "×2,14" for a Russian, French or German reader.
  const asMultiple = useMemo(() => {
    const nf = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (n: number) => `×${nf.format(n)}`;
  }, [locale]);

  // Reduced motion still gets the finished chart, just with no sweep — the
  // information was never in the movement. CountUp makes the same call itself.
  const shown = entered || Boolean(reduce);
  const loop = onScreen && !reduce;

  const marker = {
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: shown ? 1 : 0 },
    transition: {
      duration: DUR.base,
      ease: EASE.out,
      delay: reduce ? 0 : MARKER_DELAY,
    },
  };

  const track = useCallback(
    (clientX: number) => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box || box.width === 0) return;
      select(yearAt(((clientX - box.left) / box.width) * VIEW.w));
    },
    [select]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (step !== undefined) {
      // Entering from the right edge starts at the exit; from the left, at zero.
      const from = active ?? (step > 0 ? -1 : HOLD_YEARS + 1);
      select(Math.min(HOLD_YEARS, Math.max(0, from + step)));
    } else if (event.key === "Home") select(0);
    else if (event.key === "End") select(HOLD_YEARS);
    else if (event.key === "Escape") select(null);
    else return;
    event.preventDefault();
  };

  const point = active ?? resting;
  const reading = `${yearLabels[point]} — ${asMultiple(TRAJECTORY[point])}`;

  return (
    <div ref={ref}>
      <div
        // The interactive surface. `pan-y` keeps the page scrollable under a
        // finger: scrubbing this chart must never trap a vertical swipe.
        className="relative touch-pan-y rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-main-accent-t1/60"
        role="group"
        tabIndex={0}
        aria-label={exploreLabel}
        onPointerMove={e => track(e.clientX)}
        onPointerDown={e => track(e.clientX)}
        onPointerLeave={() => select(null)}
        onBlur={() => select(null)}
        onKeyDown={onKeyDown}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="block h-auto w-full"
          role="img"
          aria-label={alt}
        >
          <defs>
            {/* Teal at the base rising into gold at the exit: the palette's own
                tiers, t1 → t2 → t3, used in the order they mean. */}
            <linearGradient id={`line-${uid}`} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-main-accent-t1)" />
              <stop offset="55%" stopColor="var(--color-main-accent-t2)" />
              <stop offset="100%" stopColor="var(--color-main-accent-t3)" />
            </linearGradient>
            <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-main-accent-t2)"
                stopOpacity="0.26"
              />
              <stop
                offset="100%"
                stopColor="var(--color-main-accent-t2)"
                stopOpacity="0"
              />
            </linearGradient>

            {/* The reveal's soft edge. Opaque until the last FEATHER units of
                the rect, then out to nothing. */}
            <linearGradient id={`feather-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" />
              <stop
                offset={`${(VIEW.w / (VIEW.w + FEATHER)) * 100}%`}
                stopColor="white"
              />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask
              id={`sweep-${uid}`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={VIEW.w}
              height={VIEW.h}
            >
              {/* x runs -VIEW.w → 0: at the start the opaque part sits entirely
                  left of the chart, at the end it covers all of it. */}
              <motion.rect
                y={0}
                width={VIEW.w + FEATHER}
                height={VIEW.h}
                fill={`url(#feather-${uid})`}
                initial={{ x: reduce ? 0 : -VIEW.w }}
                animate={{ x: shown ? 0 : -VIEW.w }}
                transition={{ duration: SWEEP, ease: EASE.out }}
              />
            </mask>
          </defs>

          {/* Grid first and unclipped: the ruler is in place before the data
              arrives, so the curve is read against a scale rather than as a
              shape that happens to go up. */}
          <g aria-hidden="true">
            {YEARS.map(year => (
              <line
                key={`v${year}`}
                x1={x(year)}
                x2={x(year)}
                y1={PLOT_TOP}
                y2={AXIS_Y}
                className="stroke-main-mist/5"
                strokeWidth={1}
              />
            ))}
            {GRIDLINES.map(multiple => (
              <line
                key={`h${multiple}`}
                x1={x(0)}
                x2={x(HOLD_YEARS)}
                y1={y(multiple)}
                y2={y(multiple)}
                className="stroke-main-mist/10"
                strokeWidth={1}
                // ×1.00 is the money line — capital returned, nothing earned.
                strokeDasharray={multiple === 1 ? "4 5" : undefined}
              />
            ))}
            <line
              x1={x(0)}
              x2={x(HOLD_YEARS)}
              y1={AXIS_Y}
              y2={AXIS_Y}
              className="stroke-main-mist/15"
              strokeWidth={1}
            />
          </g>

          <g mask={`url(#sweep-${uid})`}>
            <path d={AREA_PATH} fill={`url(#area-${uid})`} />
            <path
              d={LINE_PATH}
              fill="none"
              stroke={`url(#line-${uid})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* The loop: a short bright dash running the length of the curve,
                then a rest. `pathLength={1}` normalises the dash units so the
                same numbers work whatever the path actually measures. */}
            {loop ? (
              <motion.path
                d={LINE_PATH}
                fill="none"
                pathLength={1}
                stroke="var(--color-main-accent-t3)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="0.05 0.95"
                initial={{ strokeDashoffset: 1, opacity: 0 }}
                // Opacity is keyframed so the pulse fades in as it leaves the
                // origin and out as it reaches the exit, rather than sitting
                // parked and visible at the start of the path between travels.
                animate={{ strokeDashoffset: 0, opacity: [0, 0.9, 0.9, 0] }}
                transition={{
                  duration: PULSE_TRAVEL,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: PULSE_REST,
                  delay: SWEEP,
                }}
              />
            ) : null}

            {/* A node per year: the curve is six underwritten points, not a
                freehand trend line, and the dots say so without a caption. */}
            {TRAJECTORY.map((multiple, year) => (
              <circle
                key={year}
                cx={x(year)}
                cy={y(multiple)}
                r={2.5}
                className="fill-main-black stroke-main-accent-t2"
                strokeWidth={1.5}
              />
            ))}
          </g>

          <motion.g aria-hidden="true" {...marker}>
            <line
              x1={x(HOLD_YEARS)}
              x2={VIEW.w}
              y1={y(EXIT_MULTIPLE)}
              y2={y(EXIT_MULTIPLE)}
              className="stroke-main-accent-t3/40"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            {/* The second loop: a slow ping off the exit. */}
            {loop ? (
              <motion.circle
                cx={x(HOLD_YEARS)}
                cy={y(EXIT_MULTIPLE)}
                className="fill-main-accent-t3"
                initial={{ r: 5, opacity: 0.35 }}
                animate={{ r: 18, opacity: 0 }}
                transition={{
                  duration: PING,
                  ease: EASE.out,
                  repeat: Infinity,
                  delay: SWEEP,
                }}
              />
            ) : null}
            <circle
              cx={x(HOLD_YEARS)}
              cy={y(EXIT_MULTIPLE)}
              r={9}
              className="fill-main-accent-t3/15"
            />
            <circle
              cx={x(HOLD_YEARS)}
              cy={y(EXIT_MULTIPLE)}
              r={4}
              className="fill-main-accent-t3"
            />
          </motion.g>

          {/* The reader's crosshair. Kept mounted and animated between points so
              it glides along the series rather than teleporting. */}
          <motion.g
            aria-hidden="true"
            animate={{ opacity: active === null ? 0 : 1 }}
            transition={{ duration: DUR.fast, ease: EASE.out }}
          >
            <motion.line
              y1={PLOT_TOP}
              y2={AXIS_Y}
              className="stroke-main-accent-t3/35"
              strokeWidth={1}
              initial={{ x1: x(HOLD_YEARS), x2: x(HOLD_YEARS) }}
              animate={{ x1: x(point), x2: x(point) }}
              transition={{ duration: DUR.fast, ease: EASE.out }}
            />
            <motion.circle
              r={11}
              className="fill-main-accent-t3/15"
              initial={{ cx: x(HOLD_YEARS), cy: y(EXIT_MULTIPLE) }}
              animate={{ cx: x(point), cy: y(TRAJECTORY[point]) }}
              transition={{ duration: DUR.fast, ease: EASE.out }}
            />
            <motion.circle
              r={4.5}
              className="fill-main-accent-t3 stroke-main-black"
              strokeWidth={1.5}
              initial={{ cx: x(HOLD_YEARS), cy: y(EXIT_MULTIPLE) }}
              animate={{ cx: x(point), cy: y(TRAJECTORY[point]) }}
              transition={{ duration: DUR.fast, ease: EASE.out }}
            />
          </motion.g>
        </svg>

        {/* Labels — HTML, positioned off the same scale the SVG is drawn from.
            All aria-hidden: `alt` already states the figures as a sentence, and
            a screen reader announcing "1.00 1.50 2.14 0 1 2 3 4 5" is noise. */}
        {GRIDLINES.map(multiple => (
          <span
            key={multiple}
            aria-hidden="true"
            className="absolute right-0 -translate-y-1/2 font-mono-tech text-[11px] text-main-mist/35"
            style={{ top: atY(multiple) }}
          >
            {asMultiple(multiple)}
          </span>
        ))}

        <motion.span
          aria-hidden="true"
          className="absolute right-0 -translate-y-1/2 whitespace-nowrap font-mono-tech text-xs font-semibold text-main-accent-t3 sm:text-sm"
          style={{ top: atY(EXIT_MULTIPLE) }}
          {...marker}
        >
          <CountUp
            locale={locale}
            value={EXIT_MULTIPLE}
            decimals={2}
            prefix="×"
            duration={SWEEP}
          />
        </motion.span>

        {YEARS.map(year => (
          <span
            key={year}
            aria-hidden="true"
            // The drop below the axis is a fixed `translate-y`, not extra
            // percent: a percentage offset shrinks with the chart, and on a
            // phone these would sit on the axis line they label.
            className={`absolute -translate-x-1/2 translate-y-1.5 font-mono-tech text-[11px] transition-colors ${
              active === year ? "text-main-accent-t3" : "text-main-mist/35"
            }`}
            style={{ left: atX(year), top: AXIS_PCT }}
          >
            {year}
          </span>
        ))}

        {/* The readout. Anchored to the node, nudged clear of the chart's edges
            at the two ends so it never overflows the card. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-main-mist/15 bg-main-black/90 px-2.5 py-1.5 backdrop-blur-sm"
          initial={{
            opacity: 0,
            left: atX(HOLD_YEARS),
            top: atY(EXIT_MULTIPLE),
          }}
          animate={{
            opacity: active === null ? 0 : 1,
            left: atX(point),
            top: atY(TRAJECTORY[point]),
          }}
          transition={{ duration: DUR.fast, ease: EASE.out }}
          style={{
            translate: `${point === 0 ? "0" : point === HOLD_YEARS ? "-100%" : "-50%"} calc(-100% - 14px)`,
          }}
        >
          <span className="block font-mono-tech text-[9px] uppercase tracking-[0.2em] text-main-mist/50">
            {yearLabels[point]}
          </span>
          <span className="block font-mono-tech text-sm font-semibold text-main-accent-t3">
            {asMultiple(TRAJECTORY[point])}
          </span>
        </motion.div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-main-mist/25">
          {hint}
        </span>
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-main-mist/30">
          {axisLabel}
        </span>
      </div>

      {/* Announced only while the reader is actually scrubbing — an always-live
          region would read the resting point aloud on every render. */}
      <span aria-live="polite" className="sr-only">
        {active === null ? "" : reading}
      </span>
    </div>
  );
}
