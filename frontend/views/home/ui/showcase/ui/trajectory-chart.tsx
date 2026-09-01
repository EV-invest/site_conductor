"use client";

import { useId, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Locale } from "@evinvest/i18n";

import { CountUp, DUR, EASE, VIEWPORT_Y } from "@/shared/ui/motion";
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
} from "../model/trajectory";

/**
 * Seconds the plot takes to sweep left→right. Longer than a card reveal on
 * purpose — this is the one element on the page the reader is meant to watch
 * arrive, and a compounding curve only reads as compounding if the eye has time
 * to follow the slope steepening.
 */
const SWEEP = 1.6;

/** The exit marker lands as the sweep reaches it, not after it has finished. */
const MARKER_DELAY = SWEEP * 0.85;

/**
 * The compounding curve, plotted as the reader reaches it.
 *
 * ## Why a clip wipe rather than a `pathLength` stroke draw
 *
 * Drawing the stroke with `pathLength: 0 → 1` animates along *arc length*, while
 * the area fill beneath it can only be revealed by *horizontal* position. Run
 * both and they desynchronise wherever the curve steepens — which, on a
 * compounding series, is exactly the right-hand half the eye is drawn to. One
 * animated clip rect over the whole plot keeps line, fill and nodes locked
 * together and reads as the chart plotting itself. Only that rect's geometry
 * animates; the paths themselves are static strings computed at module scope.
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
}: {
  locale: Locale;
  /** Sentence describing the curve for a screen reader. */
  alt: string;
  /** Names the x axis, e.g. "Hold year". */
  axisLabel: string;
}) {
  // Two instances on one page would otherwise share — and clobber — each
  // other's gradient and clip ids.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEWPORT_Y);
  const reduce = useReducedMotion();

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
  const shown = inView || Boolean(reduce);
  const marker = {
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: shown ? 1 : 0 },
    transition: {
      duration: DUR.base,
      ease: EASE.out,
      delay: reduce ? 0 : MARKER_DELAY,
    },
  };

  return (
    <div ref={ref}>
      {/* Positioning context for the labels: the `<svg>` and nothing else. */}
      <div className="relative">
        <svg
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
            <clipPath id={`sweep-${uid}`}>
              <motion.rect
                x={0}
                y={0}
                height={VIEW.h}
                initial={{ width: reduce ? VIEW.w : 0 }}
                animate={{ width: shown ? VIEW.w : 0 }}
                transition={{ duration: SWEEP, ease: EASE.out }}
              />
            </clipPath>
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

          <g clipPath={`url(#sweep-${uid})`}>
            <path d={AREA_PATH} fill={`url(#area-${uid})`} />
            <path
              d={LINE_PATH}
              fill="none"
              stroke={`url(#line-${uid})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            className="absolute -translate-x-1/2 translate-y-1.5 font-mono-tech text-[11px] text-main-mist/35"
            style={{ left: atX(year), top: AXIS_PCT }}
          >
            {year}
          </span>
        ))}
      </div>

      <span className="mt-3 block text-right font-mono-tech text-[10px] uppercase tracking-[0.25em] text-main-mist/30">
        {axisLabel}
      </span>
    </div>
  );
}
