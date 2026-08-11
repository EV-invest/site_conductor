"use client";

import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { DUR, EASE, STAGGER_TEXT, VIEWPORT } from "./tokens";
import { flattenText, tokenize } from "./tokenize";

export interface SplitTextProps {
  children: ReactNode;
  /** Seconds before the first word moves. */
  delay?: number;
  /** Seconds between words. Default {@link STAGGER_TEXT}. */
  step?: number;
  /** Animate on scroll instead of on mount. Use below the fold. */
  inView?: boolean;
  className?: string;
}

const WORD = {
  hidden: { opacity: 0, y: "0.45em" },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE.out },
  },
};

/**
 * Headline motion: each word rises into place a beat after the last, so the
 * line assembles left-to-right instead of appearing whole. The effect belongs
 * on display type only — running it on body copy makes text unreadable while
 * it settles.
 *
 * It takes rich children, not a string: the hero headline carries styled spans
 * (`<span className="italic">Vietnam</span>`) and `<br />`s, and those must
 * survive. {@link tokenize} splits bare strings into words and leaves every
 * element intact as one token, so markup and animation stay independent.
 *
 * Only `opacity`/`transform` animate — no `filter`, which would repaint the
 * whole glyph run each frame at display sizes. Accessibility: the split spans
 * are `aria-hidden` and the container carries the reassembled text as its
 * `aria-label`, so assistive tech reads one sentence rather than a word list.
 * DOM text is unchanged, so crawlers see the headline either way.
 */
export function SplitText({
  children,
  delay = 0,
  step = STAGGER_TEXT,
  inView = false,
  className,
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const trigger = inView
    ? ({ whileInView: "shown", viewport: VIEWPORT } as const)
    : ({ animate: "shown" } as const);

  // Reduced motion: one fade for the whole line. Splitting would still move
  // every word, which is the thing the preference is asking us not to do.
  if (reduce) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        {...(inView
          ? { whileInView: { opacity: 1 }, viewport: VIEWPORT }
          : { animate: { opacity: 1 } })}
        transition={{ duration: DUR.base, ease: EASE.out, delay }}
      >
        {children}
      </motion.span>
    );
  }

  const tokens = tokenize(children);

  return (
    <motion.span
      className={className}
      aria-label={flattenText(children)}
      initial="hidden"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
      {...trigger}
    >
      {tokens.map((token, i) =>
        token.kind === "break" ? (
          <br key={i} aria-hidden />
        ) : (
          <Fragment key={i}>
            <motion.span
              aria-hidden
              variants={WORD}
              // `inline-block` is what makes the transform apply at all — an
              // inline box ignores `translate`. Wrapping still works because
              // the separators below are real text nodes.
              className="inline-block will-change-transform"
            >
              {token.node}
            </motion.span>
            {token.space ? " " : null}
          </Fragment>
        )
      )}
    </motion.span>
  );
}
